function sanitizeId(name) {
	return name.toLowerCase().replace(/[^a-z0-9]/g, '_')
}

export default function UpdateVariableDefinitions(self) {
	const defs = {
		last_poll_date: { name: 'Last Poll Date' },
		last_poll_time: { name: 'Last Poll Time' },
	}

	for (const name of Object.keys(self.sensors || {})) {
		const id = sanitizeId(name)
		const sensor = self.sensors[name] || {}

		defs[`${id}_lastCommunication`] = { name: `${name} Last Communication` }
		defs[`${id}_battery`] = { name: `${name} Battery Level` }
		defs[`${id}_signal`] = { name: `${name} Signal Strength` }

		if (sensor.ApplicationID === 43) {
			defs[`${id}_humidity`] = { name: `${name} Humidity` }
			defs[`${id}_temperature`] = { name: `${name} Temperature` }
			defs[`${id}_wet_bulb`] = { name: `${name} Wet Bulb` }
			defs[`${id}_humidex`] = { name: `${name} Humidex` }
		} else {
			defs[`${id}_temperature`] = { name: `${name} Temperature` }
		}
	}

	self.setVariableDefinitions(defs)
}
