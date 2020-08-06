// @ts-nocheck
import * as Discord from 'discord.js'

import linkTeam from './linkteam'
import reprocess from './reprocess'
import report from './report'
import audit from './audit'
import dm, { requestLinkAccount } from './dm'
import createTeams from './createteams'

const client: any = new Discord.Client()
const channelMap = {
  dev: {
    name: 'mncs',
  },
  'mncs-score-report': {
    name: 'mncs',
  },
  'clmn-score-report': {
    name: 'clmn',
  },
}

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`)
})

const operationChannels = {
  dev: [{ channelName: 'dev', league: { name: 'mncs' } }],
  prod: [
    { channelName: 'mncs-score-report', league: { name: 'mncs' } },
    { channelName: 'clmn-score-report', league: { name: 'clmn' } },
  ],
}
const handlerChannels = operationChannels[process.env.MNRL_ENV]

client.on('message', async msg => {
  try {
    const [command] = msg.content.split(' ')
    // handle dm messages
    if (process.env.MNRL_ENV === 'prod') {
      if (!msg.channel.name) {
        await dm(msg)
      }
    }

    // handle channel messages
    const handler = handlerChannels.find(c => c.channelName === msg.channel.name)
    if (handler) {
      msg.league = handler.league
      console.log('processing command', command)
      switch (command) {
        case '!report':
          await report(msg, handler.league)
          break
        case '!reprocess':
          await reprocess(msg)
          break
        case '!linkteam':
          await linkTeam(command)(msg)
          break
        case '!unlinkteam':
          await linkTeam(command)(msg)
          break
        case '!audit':
          await audit(msg)
          break
        case '!createteams':
          await createTeams(msg)
          break
        case '!link':
          requestLinkAccount(msg.author)
          break
      }
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

client.login(process.env.DISCORD_BOT_SECRET)

export const bot = client
