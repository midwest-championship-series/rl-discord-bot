// @ts-nocheck
import * as Discord from 'discord.js'
import { v4 as uuid } from 'uuid'

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
  dm += `If you were trying to report scores, please re-report them for MNCS stats processing.\n`
  dm += `If you have any concerns, please reach out to Tero or the MNCS stats team in the MNRL or MNCS discords.`
  author.send(dm)
}

const linkTeam = async (user, teamDiscordId) => {
  const registeredPlayers = await rlStats.get('players', { discord_id: user.id })
  const [team] = await rlStats.get('teams', { discord_id: teamDiscordId })
  if (registeredPlayers.length > 0) return console.log('not going to add duplicates') // don't re-link a player
  const members = await rlStats.get('members', { discord_id: user.id })
  const id = members.length > 0 ? members[0].id : uuid()
  const res = await rlStats.put('players', {
    players: [
      {
        id,
        discord_id: user.id,
        team_id: team.id,
        screen_name: user.username,
      },
    ],
  })
  return res[0].screen_name
}

client.on('message', async msg => {
  // handle dm messages
  if (!msg.channel.name) {
    if (msg.content === 'ping') {
      return msg.author.send('pong')
    } else if (msg.content.startsWith('!link')) {
      return requestLinkAccount(msg.author)
    }
  }

  // handle channel messages
  if (msg.channel.name === 'dev' || msg.channel.name === 'mncs-score-report') {
    const [command] = msg.content.split(' ')
    /**
     * @done response/link handling
     * @todo report game ids to service
     * @todo error handling if report goes wrong
     * @todo validation on report message
     * @todo flexibility for message format
     * @todo figure out how to @ the user correctly
     * @todo link w/o displaying full link
     */
    switch (command) {
      case '!report':
        const gameIds = msg.content
          .split(' ')
          .slice(1)
          .map(
            url =>
              url
                .split('?')[0]
                .split('/')
                .slice(-1)[0],
          )
        // find out if user has a linked account
        const members = await rlStats.get('members', { discord_id: msg.author.id })
        if (members && members.length > 0) {
          try {
            // report scores
            const { recorded_ids } = await rlStats.report({ gameIds }, msg.author.id)
            msg.channel.send(
              `Thank you for the report, @${msg.author.username}!\nGames reported: ${recorded_ids.join(', ')}`,
            )
          } catch (err) {
            console.error(err)
            msg.channel.send(err.body.error)
          }
        } else {
          // ask user to link account and re-report
          msg.channel.send(`Unknown MNRL player - please link your account. I'll send instructions in a DM.`)
          requestLinkAccount(msg.author)
        }
        break
      case '!reprocess':
        if (msg.mentions.roles.size === 2) {
          const teamIds = []
          for (let [id] of msg.mentions.roles) {
            teamIds.push(id)
            // push ids to array
            // find the match that is being referenced
            // call the report endpoint
          }
          const teams = (await rlStats.get('teams')).filter(t => teamIds.includes(t.discord_id))
          if (!teams.length === 2) return msg.channel.send('did not find 2 teams')
          const [match] = (await rlStats.get('schedule')).filter(m =>
            [m.team_1_id, m.team_2_id].every(id => teams.map(t => t.id).includes(id)),
          )
          if (!match) {
            return msg.channel.send('no match found for mentioned teams')
          } else {
            try {
              await rlStats.report({ matchId: match.id })
              msg.channel.send(`successfully reprocessed match: ${match.id} ${teams[0].name} vs ${teams[1].name}`)
            } catch (err) {
              console.error(err)
              msg.channel.send(err.body.error)
            }
          }
        } else if (msg.content.includes('all')) {
          msg.channel.send('reprocess all not yet implemented')
          // get list of all matches
          // loop through each match and call report endpoint
          // report to channel how many games were processed
        } else {
          msg.channel.send('i did not understand what to do')
        }
        break
      case '!linkteam':
        const linked = []
        // get the value of the first role mentioned
        const teamId = msg.mentions.roles.values().next().value.id
        for (let [id, user] of msg.mentions.users) {
          const username = await linkTeam(user, teamId)
          if (username) linked.push(username)
        }
        msg.channel.send(`linked players: ${linked.join(', ')}`)
        break
      case '!link':
        requestLinkAccount(msg.author)
        break
    }
  }
})

client.login(process.env.DISCORD_BOT_SECRET)

export const bot = client
