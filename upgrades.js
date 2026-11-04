const { EmptyUpgradeScript } = require('@companion-module/base')

// Upgrade scripts from the 1.x module API were removed when moving to @companion-module/base 2.x,
// as their option formats are no longer applicable. Add new scripts after this one.
module.exports = [EmptyUpgradeScript]
