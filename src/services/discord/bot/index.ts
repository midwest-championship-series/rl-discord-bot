// @ts-nocheck
import * as Discord from 'discord.js'

import linkTeam from './linkteam'
import linkPlayer from './linkplayer'
import reprocess from './reprocess'
import report from './report'
import audit from './audit'
import dm, { requestLinkAccount } from './dm'
import createTeams from './createteams'
import rlStats from '../../rl-stats'
import checkPermissions from './permissions'
import updateDoc from './update-doc'
import createDoc from './create-doc'
import getDoc from './get-doc'
import forfeit from './forfeit'

const client = new Discord.Client()

client.once('ready', async () => {
  console.log(`Logged in as ${client.user.tag}!`)
  const leagues = await rlStats.get('leagues')
  const operationChannels = leagues.reduce(
    (result, league) => {
      if (league.name === 'mncs') {
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
  { command: 'link', handler: requestLinkAccount },
  { command: 'report', handler: report },
  { command: 'audit', handler: audit },
  { command: 'reprocess', handler: reprocess, permissions: ['all-owner', 'all-manager'] },
  { command: 'linkteam', handler: linkTeam, permissions: ['all-owner', 'all-manager'] },
  { command: 'unlinkteam', handler: linkTeam, permissions: ['all-owner', 'all-manager'] },
  { command: 'linkplayer', handler: linkPlayer, permissions: ['all-owner', 'all-manager'] },
  { command: 'createteams', handler: createTeams, permissions: ['all-owner', 'all-manager'] },
  { command: 'get', handler: getDoc, permissions: ['all-owner', 'all-manager'] },
  { command: 'update', handler: updateDoc, permissions: ['all-owner', 'all-manager'] },
  { command: 'create', handler: createDoc, permissions: ['all-owner', 'all-manager'] },
  { command: 'ff', handler: forfeit, permissions: ['all-owner', 'all-manager'] },
]

const configureActions = commandChannels => {
  client.on('message', async msg => {
    msg.content = msg.content.replace(/[\r\n]+/g, ' ').replace(/\s\s+/g, ' ')
    try {
      // handle dm messages
      if (process.env.MNRL_ENV === 'prod') {
        if (!msg.channel.name) {
          await dm(msg)
        }
      }

      // handle channel messages
      const params = msg.content.split(' ')
      const command = params.shift().split('!')[1]
      const channel = commandChannels.find(c => c.channelId === msg.channel.id)
      const controller = commands.find(cmd => cmd.command === command)
      if (channel && controller) {
        console.log('processing command', command)
        if (controller.permissions) {
          console.log('validating permissions')
          await checkPermissions(msg.author.id, controller)
        }
        msg.league = channel.league
        await controller.handler(command, params, msg)
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

client.login(process.env.DISCORD_BOT_SECRET)

export const bot = client
