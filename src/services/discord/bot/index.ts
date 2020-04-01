// @ts-nocheck
import * as Discord from 'discord.js'

import linkTeam from './linkteam'
import reprocess from './reprocess'
import report from './report'
import dm from './dm'

const client: any = new Discord.Client()

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`)
})

client.on('message', async msg => {
  try {
    const [command] = msg.content.split(' ')
    // handle dm messages
    if (!msg.channel.name) {
      await dm(msg)
    }

    // handle channel messages
    if (msg.channel.name === 'dev' || msg.channel.name === 'mncs-score-report') {
      switch (command) {
        case '!report':
          await report(msg)
          break
        case '!reprocess':
          await reprocess(msg)
          break
        case '!linkteam':
          await linkTeam(msg)
          break
        case '!link':
          requestLinkAccount(msg.author)
          break
      }
    }
  } catch (err) {
    if (msg.channel && msg.channel.name) {
      msg.channel.send(err.message)
    } else {
      msg.author.send(err.message)
    }
  }
})

client.login(process.env.DISCORD_BOT_SECRET)

export const bot = client
