import { v4 as uuid } from 'uuid'

import rlStats from '../../rl-stats'

const linkPlayer = async (user, teamDiscordId) => {
  const registeredPlayers = await rlStats.get('players', { discord_id: user.id })
  if (registeredPlayers.length > 0) return console.log('not going to add duplicates') // don't re-link a player
  const [team] = await rlStats.get('teams', { discord_id: teamDiscordId })
  // const members = await rlStats.get('members', { discord_id: user.id })
  // const id = members.length > 0 ? members[0].id : uuid()
  try {
    /**
     * @todo figure out how to attach players to more than one team
     * @todo update the post/put to add or modify the correct document
     */
    // const res = await rlStats.post('players', [
    //   {
    //     id,
    //     discord_id: user.id,
    //     team_id: team.id,
    //     screen_name: user.username,
    //   },
    // ])
    // return res[0].screen_name
  } catch (err) {
    console.error(err)
    return `error adding: ${user.screen_name}`
  }
}

const linkTeam = async msg => {
  throw new Error('linkteam is not currently working')
  const linked = []
  // get the value of the first role mentioned
  const teamId = msg.mentions.roles.values().next().value.id
  for (let [id, user] of msg.mentions.users) {
    const username = await linkPlayer(user, teamId)
    if (username) linked.push(username)
  }
  msg.channel.send(`linked players: ${linked.join(', ')}`)
}

export default linkTeam
