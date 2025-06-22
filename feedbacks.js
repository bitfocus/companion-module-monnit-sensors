const { combineRgb } = require('@companion-module/base')

module.exports = function (self) {
	const getSensorChoices = () => {
		return Object.keys(self.sensors || {}).map((name) => ({ id: name, label: name }))
	}

	self.setFeedbackDefinitions({
		temperature_warning: {
			name: 'Temperature Threshold',
			type: 'advanced',
			options: [
				{ id: 'sensor', type: 'dropdown', label: 'Sensor', choices: getSensorChoices() },
				{ id: 'above', type: 'number', label: 'Above', default: 79 },
				{ id: 'below', type: 'number', label: 'Below', default: 65 },
			],
			defaultStyle: {
				bgcolor: combineRgb(255, 0, 0),
				color: combineRgb(255, 255, 255),
			},
			callback: (fb) => {
				const sensor = self.sensors[fb.options.sensor]
				if (!sensor) return {}
				const value = parseFloat(sensor.parsedTemperature)
				if (fb.options.above && value > fb.options.above) {
					return { bgcolor: combineRgb(255, 0, 0), color: combineRgb(255, 255, 255) }
				}
				if (fb.options.below && value < fb.options.below) {
					return { bgcolor: combineRgb(0, 0, 255), color: combineRgb(255, 255, 255) }
				}
				return {}
			},
		},
		temperature_specific: {
			name: 'Specific Temperature',
			type: 'boolean',
			options: [
				{ id: 'sensor', type: 'dropdown', label: 'Sensor', choices: getSensorChoices() },
				{ id: 'value', type: 'number', label: 'Equals', default: 72 },
			],
			callback: (fb) => {
				const sensor = self.sensors[fb.options.sensor]
				if (!sensor) return false
				const value = parseFloat(sensor.parsedTemperature)
				const target = parseFloat(fb.options.value)
				if (isNaN(value) || isNaN(target)) return false
				return value === target
			},
		},
		humidity_warning: {
			name: 'Humidity Threshold',
			type: 'advanced',
			options: [
				{ id: 'sensor', type: 'dropdown', label: 'Sensor', choices: getSensorChoices() },
				{ id: 'above', type: 'number', label: 'Above', default: 60 },
				{ id: 'below', type: 'number', label: 'Below', default: 40 },
			],
			defaultStyle: {
				bgcolor: combineRgb(255, 0, 0),
				color: combineRgb(255, 255, 255),
			},
			callback: (fb) => {
				const sensor = self.sensors[fb.options.sensor]
				if (!sensor) return {}
				const value = parseFloat(sensor.parsedHumidity)
				if (isNaN(value)) return {}
				if (fb.options.above && value > fb.options.above) {
					return { bgcolor: combineRgb(255, 0, 0), color: combineRgb(255, 255, 255) }
				}
				if (fb.options.below && value < fb.options.below) {
					return { bgcolor: combineRgb(0, 0, 255), color: combineRgb(255, 255, 255) }
				}
				return {}
			},
		},
		humidity_specific: {
			name: 'Specific Humidity',
			type: 'boolean',
			options: [
				{ id: 'sensor', type: 'dropdown', label: 'Sensor', choices: getSensorChoices() },
				{ id: 'value', type: 'number', label: 'Equals', default: 50 },
			],
			callback: (fb) => {
				const sensor = self.sensors[fb.options.sensor]
				if (!sensor) return false
				const value = parseFloat(sensor.parsedHumidity)
				const target = parseFloat(fb.options.value)
				if (isNaN(value) || isNaN(target)) return false
				return value === target
			},
		},
		battery_warning: {
			name: 'Battery Level Warning',
			type: 'boolean',
			options: [
				{ id: 'sensor', type: 'dropdown', label: 'Sensor', choices: getSensorChoices() },
				{ id: 'threshold', type: 'number', label: 'Below %', default: 20 },
			],
			defaultStyle: {
				bgcolor: combineRgb(255, 165, 0),
				color: combineRgb(0, 0, 0),
			},
			callback: (fb) => {
				const sensor = self.sensors[fb.options.sensor]
				return sensor ? sensor.BatteryLevel < fb.options.threshold : false
			},
		},
		signal_warning: {
			name: 'Signal Strength Warning',
			type: 'boolean',
			options: [
				{ id: 'sensor', type: 'dropdown', label: 'Sensor', choices: getSensorChoices() },
				{ id: 'threshold', type: 'number', label: 'Below %', default: 40 },
			],
			defaultStyle: {
				bgcolor: combineRgb(255, 0, 255),
				color: combineRgb(255, 255, 255),
			},
			callback: (fb) => {
				const sensor = self.sensors[fb.options.sensor]
				return sensor ? sensor.SignalStrength < fb.options.threshold : false
			},
		},
		stale_warning: {
			name: 'Last Checkin',
			type: 'boolean',
			options: [
				{ id: 'sensor', type: 'dropdown', label: 'Sensor', choices: getSensorChoices() },
				{ id: 'minutes', type: 'number', label: 'Older Than Minutes', default: 1440 },
			],
			defaultStyle: {
				bgcolor: combineRgb(255, 255, 0),
				color: combineRgb(0, 0, 0),
			},
			callback: (fb) => {
				const sensor = self.sensors[fb.options.sensor]
				if (!sensor) return false
				const age = Date.now() - sensor.parsedTimestamp
				const limit = (parseInt(fb.options.minutes, 10) || 0) * 60 * 1000
				return age > limit
			},
		},
	})
}
