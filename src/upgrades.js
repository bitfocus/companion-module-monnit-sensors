import { combineRgb } from '@companion-module/base'

const val = (value) => ({ isExpression: false, value })

function upgradeV110(_context, props) {
	const updatedFeedbacks = []
	for (const fb of props.feedbacks) {
		if (
			(fb.feedbackId === 'temperature_specific' || fb.feedbackId === 'humidity_specific') &&
			fb.options.expression === undefined
		) {
			fb.options.expression = val('=')
			updatedFeedbacks.push(fb)
		} else if (
			(fb.feedbackId === 'temperature_warning' || fb.feedbackId === 'humidity_warning') &&
			fb.options.above_bgcolor === undefined
		) {
			Object.assign(fb.options, {
				above_bgcolor: val(combineRgb(255, 0, 0)),
				above_color: val(combineRgb(255, 255, 255)),
				below_bgcolor: val(combineRgb(0, 0, 255)),
				below_color: val(combineRgb(255, 255, 255)),
			})
			updatedFeedbacks.push(fb)
		}
	}
	return { updatedConfig: null, updatedActions: [], updatedFeedbacks }
}

export const UpgradeScripts = [upgradeV110]
