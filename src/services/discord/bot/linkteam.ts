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
  const roles: any[] = Array.from(msg.mentions.roles.values())
  if (roles.length !== 2) throw new Error(`expected franchise and league mentions but got ${roles.length} mentions`)
  const [franchise] = await rlStats.get(
    'franchises',
    `discord_id=${roles[0].id}&discord_id=${roles[1].id}&populate=teams`,
  )
  if (!franchise) throw new Error(`no franchise linked to discord id`)
  const tierNames = roles.map(r => r.name.toLowerCase())
  const team = franchise.teams.find(t => t.tier_name && tierNames.includes(t.tier_name.toLowerCase()))
  if (!team) throw new Error(`no team found`)
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
