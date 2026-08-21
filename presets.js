const { combineRgb } = require('@companion-module/base')

function sanitizeId(name) {
	return name.toLowerCase().replace(/[^a-z0-9]/g, '_')
}

module.exports = function (self) {
	const presets = {}

	for (const name of Object.keys(self.sensors || {})) {
		const id = sanitizeId(name)
		const sensor = self.sensors[name] || {}

		presets[`temperature_${id}`] = {
			type: 'button',
			category: 'Temperature',
			name: `${name} Temperature`,
			style: {
				text: `${name}\n$(monnit-sensors:${id}_temperature)`,
				size: '14',
				color: combineRgb(255, 255, 255),
				bgcolor: combineRgb(0, 0, 0),
			},
			steps: [
				{
					down: [],
					up: [],
				},
			],
			feedbacks: [
				{
					feedbackId: 'temperature_warning',
					options: {
						sensor: name,
						above: 79,
						below: 65,
					},
				},
			],
		}

		if (sensor.ApplicationID === 43) {
			presets[`humidity_${id}`] = {
				type: 'button',
				category: 'Humidity',
				name: `${name} Humidity`,
				style: {
					text: `${name}\n$(monnit-sensors:${id}_humidity)`,
					size: '14',
					color: combineRgb(255, 255, 255),
					bgcolor: combineRgb(0, 0, 0),
				},
				steps: [
					{
						down: [],
						up: [],
					},
				],
				feedbacks: [
					{
						feedbackId: 'humidity_warning',
						options: {
							sensor: name,
							above: 60,
							below: 40,
						},
					},
				],
			}

			presets[`humidex_${id}`] = {
				type: 'button',
				category: 'Humidex',
				name: `${name} Humidex`,
				style: {
					text: `${name}\n$(monnit-sensors:${id}_humidex)`,
					size: '14',
					color: combineRgb(255, 255, 255),
					bgcolor: combineRgb(0, 0, 0),
				},
				steps: [
					{
						down: [],
						up: [],
					},
				],
				feedbacks: [
					{
						feedbackId: 'humidex_warning',
						options: {
							sensor: name,
							above: 90,
							below: 65,
						},
					},
				],
			}

			presets[`wet_bulb_${id}`] = {
				type: 'button',
				category: 'Wet Bulb',
				name: `${name} Wet Bulb`,
				style: {
					text: `${name}\n$(monnit-sensors:${id}_wet_bulb)`,
					size: '14',
					color: combineRgb(255, 255, 255),
					bgcolor: combineRgb(0, 0, 0),
				},
				steps: [
					{
						down: [],
						up: [],
					},
				],
				feedbacks: [
					{
						feedbackId: 'wet_bulb_warning',
						options: {
							sensor: name,
							above: 80,
							below: 55,
						},
					},
				],
			}
		}
	}

	self.setPresetDefinitions(presets)
}
