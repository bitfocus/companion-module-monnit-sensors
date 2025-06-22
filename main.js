const { InstanceBase, Regex, runEntrypoint, InstanceStatus } = require('@companion-module/base')
const UpgradeScripts = require('./upgrades')
const UpdateActions = require('./actions')
const UpdateFeedbacks = require('./feedbacks')
const UpdateVariableDefinitions = require('./variables')
const UpdatePresets = require('./presets')

function sanitizeId(name) {
	return name.toLowerCase().replace(/[^a-z0-9]/g, '_')
}

function parseSensor(sensor) {
	const timestamp = parseInt(String(sensor.LastCommunicationDate).replace(/[^0-9]/g, ''))
	const date = isNaN(timestamp) ? '' : new Date(timestamp).toLocaleString()

	let temperature = NaN
	let humidity = NaN

	if (sensor.ApplicationID === 43 && typeof sensor.CurrentReading === 'string') {
		const parts = sensor.CurrentReading.split('@')
		humidity = parseFloat(parts[0])
		temperature = parseFloat(parts[1])
	} else {
		temperature = parseFloat(sensor.CurrentReading)
	}

	return {
		...sensor,
		parsedDate: date,
		parsedTemperature: temperature,
		parsedHumidity: humidity,
		parsedTimestamp: isNaN(timestamp) ? 0 : timestamp,
	}
}

class ModuleInstance extends InstanceBase {
	constructor(internal) {
		super(internal)
	}

	async init(config) {
		this.config = config

		this.sensors = {}
		this.pollTimer = null
		this.requestQueue = Promise.resolve()
		this.lastPollDate = ''
		this.lastPollTime = ''

		this.updateStatus(InstanceStatus.Ok)

		this.updateActions() // export actions
		this.updateFeedbacks() // export feedbacks
		this.updateVariableDefinitions() // export variable definitions
		this.updatePresets() // export presets

		this.startPolling()
	}
	// When module gets deleted
	async destroy() {
		this.log('debug', 'destroy')
		this.stopPolling()
	}

	async configUpdated(config) {
		this.config = config
		this.startPolling()
	}

	// Return config fields for web config
	getConfigFields() {
		return [
			{
				type: 'textinput',
				id: 'APIKeyID',
				label: 'API Key ID',
				width: 6,
			},
			{
				type: 'textinput',
				id: 'APISecretKey',
				label: 'API Secret Key',
				width: 6,
			},
			{
				type: 'number',
				id: 'interval',
				label: 'Refresh Interval (minutes)\n0 will disable',
				width: 4,
				default: 5,
				min: 0,
			},
			{
				type: 'checkbox',
				id: 'verbose',
				label: 'Verbose Logging',
				width: 4,
				default: false,
			},
		]
	}

	updateActions() {
		UpdateActions(this)
	}

	updateFeedbacks() {
		UpdateFeedbacks(this)
	}

	updateVariableDefinitions() {
		UpdateVariableDefinitions(this)
	}

	updatePresets() {
		UpdatePresets(this)
	}

	applySensorData(sensor) {
		const data = parseSensor(sensor)
		const id = sanitizeId(data.SensorName)

		this.sensors[data.SensorName] = data

		const values = {}
		values[`${id}_lastCommunication`] = data.parsedDate
		values[`${id}_battery`] = data.BatteryLevel
		values[`${id}_signal`] = data.SignalStrength

		if (data.ApplicationID === 43) {
			values[`${id}_humidity`] = data.parsedHumidity
			values[`${id}_temperature`] = data.parsedTemperature
		} else {
			values[`${id}_temperature`] = data.parsedTemperature
		}

		return values
	}

	startPolling() {
		this.stopPolling()

		const minutes = parseInt(this.config.interval)

		if (!isNaN(minutes) && minutes > 0) {
			this.pollTimer = setInterval(() => this.fetchSensorData(), minutes * 60 * 1000)
			this.fetchSensorData()
		}
	}

	stopPolling() {
		if (this.pollTimer) {
			clearInterval(this.pollTimer)
			this.pollTimer = null
		}
	}

	queueRequest(task) {
		this.requestQueue = this.requestQueue.then(task).catch((e) => {
			this.log('error', `Queued request failed: ${e}`)
		})
		return this.requestQueue
	}

	async fetchSensorData() {
		return this.queueRequest(async () => {
			try {
				const url = 'https://www.imonnit.com/json/SensorList'
				const body = JSON.stringify({})
				if (this.config.verbose) {
					this.log('debug', `POST ${url} ${body}`)
				}
				const res = await fetch(url, {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
						APIKeyID: this.config.APIKeyID,
						APISecretKey: this.config.APISecretKey,
					},
					body,
				})
				const text = await res.text()
				if (this.config.verbose) {
					this.log('debug', `Response ${res.status}: ${text}`)
				}

				let data
				try {
					data = JSON.parse(text)
				} catch (e) {
					this.log('error', 'Invalid JSON response')
					this.updateStatus(InstanceStatus.UnknownWarning)
					return
				}

				if (Array.isArray(data.Result)) {
					this.processSensorList(data.Result)
					if (this.pollTimer) {
						const now = new Date()
						this.lastPollDate = now.toLocaleDateString()
						this.lastPollTime = now.toLocaleTimeString()
						this.setVariableValues({
							last_poll_date: this.lastPollDate,
							last_poll_time: this.lastPollTime,
						})
					}
					this.updateStatus(InstanceStatus.Ok)
				} else {
					this.log('error', 'Invalid response from server')
					this.updateStatus(InstanceStatus.UnknownWarning)
				}
			} catch (e) {
				this.log('error', `Request failed: ${e}`)
				this.updateStatus(InstanceStatus.ConnectionFailure)
			}
		})
	}

	async fetchSingleSensor(name) {
		const info = this.sensors[name]
		if (!info) {
			this.log('error', `Sensor not found: ${name}`)
			return
		}

		return this.queueRequest(async () => {
			try {
				const url = 'https://www.imonnit.com/json/SensorGet'
				const body = JSON.stringify({
					sensorID: info.SensorID,
				})
				if (this.config.verbose) {
					this.log('debug', `POST ${url} ${body}`)
				}
				const res = await fetch(url, {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
						APIKeyID: this.config.APIKeyID,
						APISecretKey: this.config.APISecretKey,
					},
					body,
				})
				const text = await res.text()
				if (this.config.verbose) {
					this.log('debug', `Response ${res.status}: ${text}`)
				}

				let data
				try {
					data = JSON.parse(text)
				} catch (e) {
					this.log('error', 'Invalid JSON response')
					return
				}
				if (data && data.Result) {
					const values = this.applySensorData(data.Result)
					this.updateVariableDefinitions()
					this.setVariableValues(values)
					this.updateFeedbacks()
					this.updateActions()
					this.updatePresets()
				} else {
					this.log('error', 'Invalid response from server')
				}
			} catch (e) {
				this.log('error', `Request failed: ${e}`)
			}
		})
	}

	processSensorList(list) {
		this.sensors = {}
		const values = {}
		for (const sensor of list) {
			Object.assign(values, this.applySensorData(sensor))
		}
		this.updateVariableDefinitions()
		this.setVariableValues(values)
		this.updateFeedbacks()
		this.updateActions()
		this.updatePresets()
	}
}

runEntrypoint(ModuleInstance, UpgradeScripts)

module.exports.sanitizeId = sanitizeId
