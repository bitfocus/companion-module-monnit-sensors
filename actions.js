module.exports = function (self) {
	const sensorChoices = Object.keys(self.sensors || {}).map((name) => ({ id: name, label: name }))

	self.setActionDefinitions({
		refresh_now: {
			name: 'Refresh All Sensors',
			options: [],
			callback: async () => {
				await self.fetchSensorData()
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
				},
			],
			callback: async (event) => {
				await self.fetchSingleSensor(event.options.sensor)
			},
		},
	})
}
