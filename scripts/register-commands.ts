require('dotenv').config()
const { REST, Routes } = require('discord.js')
const DISCORD_BOT_SECRET = process.env['DISCORD_BOT_SECRET'] || ''
const DISCORD_CLIENT_ID = process.env['DISCORD_CLIENT_ID'] || ''
const guildId = '678836373947678740'

import * as commandConfig from '../src/services/discord/bot/commands'

const commands: any[] = []

for (let command in commandConfig) {
	commands.push(commandConfig[command].data.toJSON())
}

console.log(commands)

// Construct and prepare an instance of the REST module
const rest = new REST({ version: '10' })
rest.setToken(DISCORD_BOT_SECRET)

const runScript = async () => {
	try {
		console.log(`Started refreshing ${commands.length} application (/) commands.`)

		// The put method is used to fully refresh all commands in the guild with the current set
		const data: any = await rest.put(
			Routes.applicationGuildCommands(DISCORD_CLIENT_ID, guildId),
			{ body: commands },
		)

		console.log(`Successfully reloaded ${data.length} application (/) commands.`)
	} catch (error) {
		// And of course, make sure you catch and log any errors!
		console.error(error)
	}
}

runScript()