const { combineRgb } = require('@companion-module/base')

function sanitizeId(name) {
	return name.toLowerCase().replace(/[^a-z0-9]/g, '_')
}

const CATEGORIES = [
	{
		key: 'temperature',
		name: 'Temperature',
		feedbackId: 'temperature_warning',
		above: 79,
		below: 65,
		humidityOnly: false,
	},
	{ key: 'humidity', name: 'Humidity', feedbackId: 'humidity_warning', above: 60, below: 40, humidityOnly: true },
	{ key: 'humidex', name: 'Humidex', feedbackId: 'humidex_warning', above: 90, below: 65, humidityOnly: true },
	{ key: 'wet_bulb', name: 'Wet Bulb', feedbackId: 'wet_bulb_warning', above: 80, below: 55, humidityOnly: true },
]

module.exports = function (self) {
	const presets = {}
	const sectionPresets = {}

	for (const name of Object.keys(self.sensors || {})) {
		const id = sanitizeId(name)
		const sensor = self.sensors[name] || {}

		for (const category of CATEGORIES) {
			if (category.humidityOnly && sensor.ApplicationID !== 43) continue

			const presetId = `${category.key}_${id}`
			presets[presetId] = {
				type: 'simple',
				name: `${name} ${category.name}`,
				style: {
					text: `${name}\n$(monnit-sensors:${id}_${category.key})`,
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
						feedbackId: category.feedbackId,
						options: {
							sensor: name,
							above: category.above,
							above_bgcolor: combineRgb(255, 0, 0),
							above_color: combineRgb(255, 255, 255),
							below: category.below,
							below_bgcolor: combineRgb(0, 0, 255),
							below_color: combineRgb(255, 255, 255),
						},
					},
				],
			}
			;(sectionPresets[category.key] ??= []).push(presetId)
		}
	}

	const structure = CATEGORIES.filter((category) => sectionPresets[category.key]).map((category) => ({
		id: category.key,
		name: category.name,
		definitions: [
			{
				id: `${category.key}_sensors`,
				type: 'simple',
				name: category.name,
				presets: sectionPresets[category.key],
			},
		],
	}))

	self.setPresetDefinitions(structure, presets)
}
