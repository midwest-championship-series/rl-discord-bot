import * as tmi from 'tmi.js'
import rlStats from '../rl-stats'
import stats from './stats'
import goat from './goat'

// Define configuration options
const opts = {
  identity: {
    username: process.env.TWITCH_BOT_USERNAME,
    password: process.env.TWITCH_OAUTH_TOKEN,
  },
  channels: [process.env.TWITCH_CHANNEL_NAME],
}

// Create a client with our options
const client = new tmi.client(opts)

// Register our event handlers (defined below)

client.on('connected', onConnectedHandler)

// Connect to Twitch:
client.connect()

// Called every time the bot connects to Twitch chat
async function onConnectedHandler(addr, port) {
  console.log(`* Connected to ${addr}:${port}, channel: ${process.env.TWITCH_CHANNEL_NAME}`)
  // Initialize Season IDs
  const Response = await rlStats.get('leagues')
  const seasonIDs = {
    mncs: Response.find(league => league.name == 'mncs').current_season_id,
    clmn: Response.find(league => league.name == 'clmn').current_season_id,
    mnrs: Response.find(league => league.name == 'mnrs').current_season_id,
  }
  // Initialize commands
  const commands = [
    { command: '!goat', handler: goat },
    { command: '!stats', handler: stats },
  ]
  // Called every time a message comes in
  async function onMessageHandler(target, context, msg, self) {
    if (self) {
      return
    } // Ignore messages from the bot

    // remove the first arguement (the command)
    const commandName = msg.split(' ').shift()
    // If the command is known, let's execute it
    try {
      const controller = commands.find(cmd => cmd.command === commandName)
      await controller.handler(client, target, msg, seasonIDs)
      console.log(`Successfully executed command ${commandName}`)
    } catch (error) {
      console.log(`Unkown command ${commandName}`)
    }
  }
  client.on('message', onMessageHandler)
}
