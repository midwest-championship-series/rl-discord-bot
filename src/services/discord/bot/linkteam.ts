import rlStats from '../../rl-stats'

const linkPlayer = async (player, team) => {
  const history = player.team_history
  // check if player is already active on the team
  if (history.find(item => item.team_id === team._id && !item.date_left)) {
    return player.screen_name
  }
  history.push({
    team_id: team._id,
  })
  const res = await rlStats.put(`players/${player._id}`, { team_history: history })
  return res.screen_name
}

const unlinkPlayer = async (player, team) => {
  const history = player.team_history
  const teamToLeave = history.find(item => item.team_id === team._id && !item.date_left)
  if (!teamToLeave) throw new Error(`no team to leave for player: ${player.screen_name}`)
  teamToLeave.date_left = Date.now()
  const res = await rlStats.put(`players/${player._id}`, { team_history: history })
  return res.screen_name
}

const createPlayer = user =>
  rlStats.post('players', {
    screen_name: user.username,
    discord_id: user.id,
    accounts: [],
  })

const linkTeam = async (command, args, msg) => {
  const handler = command === 'linkteam' ? linkPlayer : unlinkPlayer
  const linked = []
  const created = []
  // get the value of the first role mentioned
  const teamId = msg.mentions.roles.values().next().value.id
  const [team] = await rlStats.get('teams', { discord_id: teamId })
  if (!team) throw new Error(`no team linked to discord id: ${teamId}`)
  for (let [id, user] of msg.mentions.users) {
    const registeredPlayers = await rlStats.get('players', { discord_id: user.id })
    if (registeredPlayers.length > 1) throw new Error(`multiple players registered with discord id: ${user.id}`)
    if (registeredPlayers.length < 1) {
      const newPlayer = await createPlayer(user)
      created.push(newPlayer.screen_name)
      registeredPlayers.push(newPlayer)
    }
    const username = await handler(registeredPlayers[0], team)
    if (username) linked.push(username)
  }
  let message = `updated players: ${linked.join(', ')}`
  if (created.length > 0) message += `\ncreated players: ${created.join(', ')}`
  msg.channel.send(message)
}

export default linkTeam
