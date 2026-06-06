const { combineRgb } = require('@companion-module/base')

// v1.1.0: Add expression selector to specific feedbacks; add style pickers to threshold feedbacks
function upgradeV110(context, props) {
	const updatedFeedbacks = []

	for (const feedback of props.feedbacks) {
		if (feedback.feedbackId === 'temperature_specific' || feedback.feedbackId === 'humidity_specific') {
			if (feedback.options.expression === undefined) {
				updatedFeedbacks.push({
					...feedback,
					options: { ...feedback.options, expression: '=' },
				})
			}
		} else if (feedback.feedbackId === 'temperature_warning') {
			if (feedback.options.above_bgcolor === undefined) {
				updatedFeedbacks.push({
					...feedback,
					options: {
						...feedback.options,
						above_bgcolor: combineRgb(255, 0, 0),
						above_color: combineRgb(255, 255, 255),
						below_bgcolor: combineRgb(0, 0, 255),
						below_color: combineRgb(255, 255, 255),
					},
				})
			}
		} else if (feedback.feedbackId === 'humidity_warning') {
			if (feedback.options.above_bgcolor === undefined) {
				updatedFeedbacks.push({
					...feedback,
					options: {
						...feedback.options,
						above_bgcolor: combineRgb(255, 0, 0),
						above_color: combineRgb(255, 255, 255),
						below_bgcolor: combineRgb(0, 0, 255),
						below_color: combineRgb(255, 255, 255),
					},
				})
			}
		}
	}

	return {
		updatedConfig: null,
		updatedActions: [],
		updatedFeedbacks,
	}
}

module.exports = [upgradeV110]
