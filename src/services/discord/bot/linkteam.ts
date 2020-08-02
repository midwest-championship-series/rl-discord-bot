import rlStats from '../../rl-stats'

const linkPlayer = async (player, team) => {
  const history = player.team_history
  // check if player is already active on the team
  console.log(player, player.team_history)
  if (history.find(item => item.team_id === team._id && !item.date_left)) {
    throw new Error(`player is already linked: ${player.screen_name}`)
  }
  history.push({
    team_id: team._id,
  })
  const res = await rlStats.put(`players/${player._id}`, { team_history: history })
  return res.screen_name
}

const linkTeam = async msg => {
  const linked = []
  // get the value of the first role mentioned
  const teamId = msg.mentions.roles.values().next().value.id
  const [team] = await rlStats.get('teams', { discord_id: teamId })
  if (!team) throw new Error(`no team linked to discord id: ${teamId}`)
  for (let [id, user] of msg.mentions.users) {
    const registeredPlayers = await rlStats.get('players', { discord_id: user.id })
    if (registeredPlayers.length > 1) throw new Error(`multiple players registered with discord id: ${user.id}`)
    if (registeredPlayers.length < 1) throw new Error(`no player registered with discord id: ${user.id}`)
    const username = await linkPlayer(registeredPlayers[0], team)
    if (username) linked.push(username)
  }
  msg.channel.send(`linked players: ${linked.join(', ')}`)
}

export default linkTeam
