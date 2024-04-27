// @ts-nocheck
import { Client, IntentsBitField, Collection, Events } from 'discord.js'

import linkTeam from './linkteam'
import linkPlayer from './linkplayer'
import reprocess from './reprocess'
import report from './report'
import audit from './audit'
import requestLinkAccount from './link'
import createTeams from './createteams'
import rlStats from '../../rl-stats'
import checkPermissions from './permissions'
import updateDoc from './update-doc'
import createDoc from './create-doc'
import getDoc from './get-doc'
import mergePlayers from './merge'
import schedule from './schedule'
import standings from './standings'
import manualReport from './manualreport'
import playerStats from './playerstats'
import playerHistory from './playerhistory'
import gameinfo from './gameinfo'
import matchinfo from './matchinfo'
import * as commandConfig from './commands'
import setupVoiceManagement from './voice-channels'

const client = new Client({
  intents: [
    IntentsBitField.Flags.Guilds,
    IntentsBitField.Flags.GuildMembers,
    IntentsBitField.Flags.GuildMessages,
    IntentsBitField.Flags.MessageContent,
    IntentsBitField.Flags.GuildMessageReactions,
    IntentsBitField.Flags.GuildVoiceStates,
  ],
})

setupVoiceManagement(client)

client.commands = new Collection()
for (let command in commandConfig) {
  client.commands.set(commandConfig[command].data.name, commandConfig[command].execute)
}

client.on(Events.InteractionCreate, async interaction => {
  if (!interaction.isChatInputCommand()) return
  if (interaction.channelId === '692994579305332806' && process.env.MNRL_ENV === 'prod') return
  console.info('got command', interaction.commandName)
  const command = interaction.client.commands.get(interaction.commandName)
  if (!command) {
    console.error(`No command matching ${interaction.commandName} was found.`)
    return
  }
  try {
    await command(interaction)
  } catch (error) {
    console.error(error)
    await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true })
  }
})

client.once('ready', async () => {
  console.info(`Logged in as ${client.user.tag}!`)
  const leagues = await rlStats.get('leagues')
  const operationChannels = leagues.reduce(
    (result, league) => {
      if (league.name.toLowerCase() === 'premier') {
        result.dev.push({ channelId: '692994579305332806', league })
      }
      result.prod = result.prod.concat(league.command_channel_ids.map(id => ({ channelId: id, league })))
      return result
    },
    { dev: [], prod: [] },
  )
  console.log('channel map', operationChannels[process.env.MNRL_ENV])
  configureActions(operationChannels[process.env.MNRL_ENV])
})

const commands = [
  { command: 'schedule', handler: schedule, anyChannel: true },
  { command: 'standings', handler: standings, anyChannel: true },
  { command: 'playerstats', handler: playerStats, anyChannel: true },
  { command: 'link', handler: requestLinkAccount },
  { command: 'report', handler: report },
  { command: 'playerhistory', handler: playerHistory },
  { command: 'manualreport', handler: manualReport, permissions: ['all-owner', 'all-manager'] },
  { command: 'audit', handler: audit },
  { command: 'gameinfo', handler: gameinfo },
  { command: 'matchinfo', handler: matchinfo },
  { command: 'reprocess', handler: reprocess, permissions: ['all-owner', 'all-manager'] },
  { command: 'linkteam', handler: linkTeam, permissions: ['all-owner', 'all-manager'] },
  { command: 'unlinkteam', handler: linkTeam, permissions: ['all-owner', 'all-manager'] },
  { command: 'linkplayer', handler: linkPlayer, permissions: ['all-owner', 'all-manager'] },
  { command: 'createteams', handler: createTeams, permissions: ['all-owner', 'all-manager'] },
  { command: 'get', handler: getDoc, permissions: ['all-owner', 'all-manager'] },
  { command: 'update', handler: updateDoc, permissions: ['all-owner', 'all-manager'] },
  { command: 'create', handler: createDoc, permissions: ['all-owner', 'all-manager'] },
  { command: 'merge', handler: mergePlayers, permissions: ['all-owner', 'all-manager'] },
]

const configureActions = commandChannels => {
  client.on('messageCreate', async msg => {
    msg.content = msg.content.replace(/[\r\n]+/g, ' ').replace(/\s\s+/g, ' ')
    try {
      // handle dm messages
      if (process.env.MNRL_ENV === 'prod') {
        if (!msg.channel.name) {
          await dm(msg)
        }
      }

      // handle channel messages
      const argRegex = /[^\"\s]*:(("(.*?)")|[^\"\s]*)/g
      const args = msg.content.match(argRegex)
      const objectArgs: any = args
        ? args.reduce((result, item) => {
            const propName = item.split(':')[0]
            let propValue = item.substr(propName.length + 1)
            if (propValue.charAt(0) === '"' && propValue.charAt(propValue.length - 1) === '"') {
              propValue = propValue.substr(1, propValue.length - 2)
            }
            result[propName] = propValue
            return result
          }, {})
        : []
      const params = msg.content.split(' ').map(p => p.trim())
      const command = params.shift().split('!')[1]
      const controller = commands.find(cmd => cmd.command === command)
      const channel = commandChannels.find(c => c.channelId === msg.channel.id)
      if (
        (controller && channel) ||
        (controller && controller.anyChannel === true && process.env.MNRL_ENV === 'prod')
      ) {
        console.log('processing command', command)
        if (controller.permissions) {
          console.log('validating permissions')
          await checkPermissions(msg.author.id, controller)
        }
        msg.league = channel && channel.league
        await controller.handler(command, params, msg, objectArgs)
      }
    } catch (err) {
      console.error(err)
      if (msg.channel && msg.channel.name) {
        msg.channel.send(err.message)
      } else {
        msg.author.send(err.message)
      }
    }
  })
}

console.log('logging in with token', process.env.DISCORD_BOT_SECRET)

client.login(process.env.DISCORD_BOT_SECRET)

export const bot = client
