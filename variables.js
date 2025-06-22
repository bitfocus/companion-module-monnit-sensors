function sanitizeId(name) {
	return name.toLowerCase().replace(/[^a-z0-9]/g, '_')
}

module.exports = function (self) {
	const defs = [
		{ variableId: 'last_poll_date', name: 'Last Poll Date' },
		{ variableId: 'last_poll_time', name: 'Last Poll Time' },
	]

	for (const name of Object.keys(self.sensors || {})) {
		const id = sanitizeId(name)
		const sensor = self.sensors[name] || {}

		defs.push({ variableId: `${id}_lastCommunication`, name: `${name} Last Communication` })
		defs.push({ variableId: `${id}_battery`, name: `${name} Battery Level` })
		defs.push({ variableId: `${id}_signal`, name: `${name} Signal Strength` })

		if (sensor.ApplicationID === 43) {
			defs.push({ variableId: `${id}_humidity`, name: `${name} Humidity` })
			defs.push({ variableId: `${id}_temperature`, name: `${name} Temperature` })
		} else {
			defs.push({ variableId: `${id}_temperature`, name: `${name} Temperature` })
		}
	}

	self.setVariableDefinitions(defs)
}
