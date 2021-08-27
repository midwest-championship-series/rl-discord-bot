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
    mncs: Response[1].current_season_id,
    clmn: Response[0].current_season_id,
    mnrs: Response[2].current_season_id,
  }
  // Initialize commands
  const commands = [
    { command: 'goat', handler: goat },
    { command: 'stats', handler: stats },
  ]
  // Called every time a message comes in
  async function onMessageHandler(target, context, msg, self) {
    if (self) {
      return
    } // Ignore messages from the bot

    // Remove whitespace from chat message
    const commandName = msg.split(' ')[0]

    // If the command is known, let's execute it
    try {
      const executer = commands.find(cmd => cmd.command === commandName)
    } catch (error) {
      console.log(`Unkown command ${commandName}`)
    }
    if (commandName === '!goat') {
      client.say(target, `Grape is the GOAT`)
      console.log(`* Executed ${commandName} command`)
    } else if (commandName === '!stats') {
      // parse message into parameters
      let leagueName = ''
      let playerName = ''
      if (
        msg.split(' ')[1] != 'mncs' &&
        msg.split(' ')[1] != 'clmn' &&
        msg.split(' ')[1] != 'mnrs' &&
        msg.split(' ')[1] != 'all'
      ) {
        leagueName = 'all'
        playerName = msg
          .split(' ')
          .slice(1)
          .join(' ')
      } else {
        leagueName = msg.split(' ')[1]
        playerName = msg
          .split(' ')
          .slice(2)
          .join(' ')
      }
      let playerID = ''
      try {
        playerID = (await rlStats.get('players', { screen_name: playerName }))[0]._id
      } catch (error) {
        client.say(target, `Player name not found for name ${playerName}`)
      }
      if (leagueName === 'all') {
        try {
          // need to add logic to handle 1,2, or 3 seasons returned
          const playerStats = await rlStats.getPlayerStats(playerID, 'all')
          const mncsSaves = playerStats.total_saves.buckets.mncs.saves.value
          const mncsGoals = playerStats.total_goals.buckets.mncs.saves.value
          const mncsAssists = playerStats.total_assists.buckets.mncs.saves.value
          const clmnSaves = playerStats.total_saves.buckets.clmn.saves.value
          const clmnGoals = playerStats.total_goals.buckets.clmn.saves.value
          const clmnAssists = playerStats.total_assists.buckets.clmn.saves.value
          const mnrsSaves = playerStats.total_saves.buckets.mnrs.saves.value
          const mnrsGoals = playerStats.total_goals.buckets.mnrs.saves.value
          const mnrsAssists = playerStats.total_assists.buckets.mnrs.saves.value
          client.say(
            target,
            `${playerName}:
          MNCS: ${mncsGoals} goals, ${mncsAssists} assists, and ${mncsSaves} saves this season
          CLMN: ${clmnGoals} goals, ${clmnAssists} assists, and ${clmnSaves} saves this season
          MNRS: ${mnrsGoals} goals, ${mnrsAssists} assists, and ${mnrsSaves} saves this season`,
          )
        } catch (error) {
          client.say(
            target,
            `Unable to resolve, please specify league name:
          ex: !stats mncs Tero`,
          )
        }
      } else {
        try {
          const playerStats = await rlStats.getPlayerStats(playerID, seasonIDs[leagueName])
          const saves = playerStats.total_saves.sum
          const goals = playerStats.total_goals.sum
          const assists = playerStats.total_assists.sum
          client.say(
            target,
            `${playerName} has ${goals} goals, ${assists} assists, and ${saves} saves in ${leagueName} this season`,
          )
        } catch (error) {
          client.say(target, `Unable to get stats for ${playerName}`)
        }
      }
      console.log(`* Executed ${commandName} command`)
    } else {
      console.log(`* Unknown command ${commandName}`)
    }
  }
  client.on('message', onMessageHandler)
}
