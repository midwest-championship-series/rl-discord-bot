import { v4 as uuid } from 'uuid'

import rlStats from '../../rl-stats'

const linkPlayer = async (user, teamDiscordId) => {
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

const linkTeam = async msg => {
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
