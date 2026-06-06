const { combineRgb } = require('@companion-module/base')

const EXPRESSION_CHOICES = [
	{ id: '=', label: 'Equal to (=)' },
	{ id: '!=', label: 'Not equal to (!=)' },
	{ id: '<', label: 'Less than (<)' },
	{ id: '>', label: 'Greater than (>)' },
]

function evaluateExpression(value, expression, target) {
	switch (expression) {
		case '=':
			return value === target
		case '!=':
			return value !== target
		case '<':
			return value < target
		case '>':
			return value > target
		default:
			return value === target
	}
}

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
				{ id: 'above_bgcolor', type: 'colorpicker', label: 'Above: Background Color', default: combineRgb(255, 0, 0) },
				{ id: 'above_color', type: 'colorpicker', label: 'Above: Text Color', default: combineRgb(255, 255, 255) },
				{ id: 'below', type: 'number', label: 'Below', default: 65 },
				{ id: 'below_bgcolor', type: 'colorpicker', label: 'Below: Background Color', default: combineRgb(0, 0, 255) },
				{ id: 'below_color', type: 'colorpicker', label: 'Below: Text Color', default: combineRgb(255, 255, 255) },
			],
			defaultStyle: {
				bgcolor: combineRgb(255, 0, 0),
				color: combineRgb(255, 255, 255),
			},
			callback: (fb) => {
				const sensor = self.sensors[fb.options.sensor]
				if (!sensor) return {}
				const value = parseFloat(sensor.parsedTemperature)
				if (isNaN(value)) return {}
				if (fb.options.above !== undefined && value > fb.options.above) {
					return { bgcolor: fb.options.above_bgcolor, color: fb.options.above_color }
				}
				if (fb.options.below !== undefined && value < fb.options.below) {
					return { bgcolor: fb.options.below_bgcolor, color: fb.options.below_color }
				}
				return {}
			},
		},
		temperature_specific: {
			name: 'Specific Temperature',
			type: 'boolean',
			options: [
				{ id: 'sensor', type: 'dropdown', label: 'Sensor', choices: getSensorChoices() },
				{
					id: 'expression',
					type: 'dropdown',
					label: 'Expression',
					choices: EXPRESSION_CHOICES,
					default: '=',
				},
				{ id: 'value', type: 'number', label: 'Value', default: 72 },
			],
			defaultStyle: {
				bgcolor: combineRgb(255, 165, 0),
				color: combineRgb(0, 0, 0),
			},
			callback: (fb) => {
				const sensor = self.sensors[fb.options.sensor]
				if (!sensor) return false
				const value = parseFloat(sensor.parsedTemperature)
				const target = parseFloat(fb.options.value)
				if (isNaN(value) || isNaN(target)) return false
				return evaluateExpression(value, fb.options.expression ?? '=', target)
			},
		},
		humidity_warning: {
			name: 'Humidity Threshold',
			type: 'advanced',
			options: [
				{ id: 'sensor', type: 'dropdown', label: 'Sensor', choices: getSensorChoices() },
				{ id: 'above', type: 'number', label: 'Above', default: 60 },
				{ id: 'above_bgcolor', type: 'colorpicker', label: 'Above: Background Color', default: combineRgb(255, 0, 0) },
				{ id: 'above_color', type: 'colorpicker', label: 'Above: Text Color', default: combineRgb(255, 255, 255) },
				{ id: 'below', type: 'number', label: 'Below', default: 40 },
				{ id: 'below_bgcolor', type: 'colorpicker', label: 'Below: Background Color', default: combineRgb(0, 0, 255) },
				{ id: 'below_color', type: 'colorpicker', label: 'Below: Text Color', default: combineRgb(255, 255, 255) },
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
				if (fb.options.above !== undefined && value > fb.options.above) {
					return { bgcolor: fb.options.above_bgcolor, color: fb.options.above_color }
				}
				if (fb.options.below !== undefined && value < fb.options.below) {
					return { bgcolor: fb.options.below_bgcolor, color: fb.options.below_color }
				}
				return {}
			},
		},
		humidity_specific: {
			name: 'Specific Humidity',
			type: 'boolean',
			options: [
				{ id: 'sensor', type: 'dropdown', label: 'Sensor', choices: getSensorChoices() },
				{
					id: 'expression',
					type: 'dropdown',
					label: 'Expression',
					choices: EXPRESSION_CHOICES,
					default: '=',
				},
				{ id: 'value', type: 'number', label: 'Value', default: 50 },
			],
			defaultStyle: {
				bgcolor: combineRgb(100, 149, 237),
				color: combineRgb(0, 0, 0),
			},
			callback: (fb) => {
				const sensor = self.sensors[fb.options.sensor]
				if (!sensor) return false
				const value = parseFloat(sensor.parsedHumidity)
				const target = parseFloat(fb.options.value)
				if (isNaN(value) || isNaN(target)) return false
				return evaluateExpression(value, fb.options.expression ?? '=', target)
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
