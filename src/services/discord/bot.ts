// @ts-nocheck
import * as Discord from 'discord.js'

import rlStats from '../rl-stats'

const client: any = new Discord.Client()
const accountLinkURL = `${process.env.PROTOCOL}://${process.env.HOST}/api/v1/auth/discord`

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`)
})

const requestLinkAccount = author => {
  let dm = ''
  dm += `In order to report games, you have to link your steam or xbox account to Discord, then go here: ${accountLinkURL} to link your Discord to MNRL.\n`
  dm += `You will be redirected to discordapp.com, which is Discord's website for authentication, to link your account to MNRL.\n`
  dm += `Once you have done that (only one time required), please re-report your scores for MNCS stats processing.\n`
  dm += `If you have any concerns, please reach out to Tero or the MNCS stats team in the MNRL or MNCS discords.`
  author.send(dm)
}

client.on('message', async msg => {
  const channel = msg.channel
  if (channel.name === 'dev' || channel.name === 'score-report') {
    /**
     * @done response/link handling
     * @todo report game ids to service
     * @todo validation on report message
     * @todo flexibility for message format
     * @todo figure out how to @ the user correctly
     * @todo link w/o displaying full link
     */
    if (msg.content.startsWith('!report')) {
      const [command, ...urls] = msg.content.split(' ')
      const gameIds = urls.map(
        url =>
          url
            .split('?')[0]
            .split('/')
            .slice(-1)[0],
      )
      // find out if user has a linked account
      const members = await rlStats.get('members', { discord_id: msg.author.id })
      console.log({ discord_id: msg.author.id }, members)
      if (members && members.length > 0) {
        // report scores
        const response = await rlStats.report(gameIds, msg.author.id)
        channel.send(`Thank you for the report, @${msg.author.username}!\nGames reported: ${gameIds.join(', ')}`)
      } else {
        // ask user to link account and re-report
        channel.send(`Unknown MNRL player - please link your account. I'll send instructions in a DM`)
        requestLinkAccount(msg.author)
      }
    }
  }
})

client.login(process.env.DISCORD_BOT_SECRET)

export const bot = client
