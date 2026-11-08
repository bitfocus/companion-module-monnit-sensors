export default function UpdateActions(self) {
	const sensorChoices = Object.keys(self.sensors || {}).map((name) => ({ id: name, label: name }))

	self.setActionDefinitions({
		refresh_now: {
			name: 'Refresh All Sensors',
			options: [],
			callback: async (_event, context) => {
				await self.fetchSensorData(context?.signal)
			},
		},
		refresh_sensor: {
			name: 'Refresh Single Sensor',
			options: [
				{
					id: 'sensor',
					type: 'dropdown',
					label: 'Sensor',
					choices: sensorChoices,
					default: sensorChoices[0]?.id ?? '',
					allowCustom: true,
				},
			],
			callback: async (event, context) => {
				await self.fetchSingleSensor(event.options.sensor, context?.signal)
			},
		},
	})
}
