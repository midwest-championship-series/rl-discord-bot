import rlStats from '../../../rl-stats'

export const players = async (command, args, msg, objectArgs) => {
  const requiredArgs = [
    {
      name: 'id',
      description: 'ballchasing game id',
    },
  ]
  requiredArgs.forEach(arg => {
    if (!objectArgs[arg.name]) {
      throw new Error(`expected argument: ${arg.name} (${arg.description})`)
    }
  })
  const gameInfo = await rlStats.ballchasing.getGameInfo(objectArgs.id)
  const ballchasingPlayers = ['orange', 'blue'].reduce((result, color) => {
    result.push(...gameInfo[color].players.map(p => ({ ...p, color })))
    return result
  }, [])

  const knownPlayers = await rlStats.get(
    'players',
    `${ballchasingPlayers.map(p => `accounts.platform_id=${p.id.id}`).join('&')}&populate=teams`,
  )
  const playerMap = ballchasingPlayers.map(player => {
    player.known_player = knownPlayers.find(p => {
      return p.accounts.some(acct => {
        return acct.platform_id === player.id.id
      })
    })
    return player
  })
  let text = `----  Player info for game ${objectArgs.id}  ----\n\n`
  // known players
  for (let player of playerMap) {
    if (player.known_player) {
      const gameDate = new Date(gameInfo.date)
      const teamsAtDate = player.known_player.team_history
        .filter(({ date_joined, date_left }) => {
          const dateLeft = date_left ? new Date(date_left) : new Date()
          const dateJoined = new Date(date_joined)
          return dateJoined < gameDate && gameDate < dateLeft
        })
        .map(({ team_id }) => player.known_player.teams.find(t => t._id === team_id))
      text += `MCS player ${player.known_player.screen_name} (${
        player.known_player.discord_id
          ? `discord_id: ${player.known_player.discord_id}`
          : `_id:${player.known_player._id}`
      }) played with name ${player.name}. Currently linked to: ${
        teamsAtDate.length > 0 ? teamsAtDate.map(t => t.name).join(', ') : 'no team'
      }\n`
      if (teamsAtDate.length < 1) {
        const possibleMatches = await rlStats.get(
          'players',
          `text_search=${player.name}&text_search=${player.known_player.screen_name}`,
        )
        const filteredMatches = possibleMatches.filter(m => m.discord_id !== player.known_player.discord_id)
        if (filteredMatches.length > 0) {
          text += `  Possible MCS players: ${filteredMatches
            .map(p => `${p.screen_name} (${p.discord_id ? `discord_id:${p.discord_id}` : `_id:${p._id}`})`)
            .join(', ')}\n`
        }
      }
    }
  }
  text += '\n\n'

  // unknown players
  for (let player of playerMap) {
    if (!player.known_player) {
      const possibleMatches = await rlStats.get('players', { text_search: player.name })
      text += `${player.name} played on team ${player.color} - ${player.id.platform}:${player.id.id}\n`
      if (possibleMatches.length > 0) {
        text += `  Possible MCS players: ${possibleMatches.map(p => `${p.screen_name} (${p.discord_id})`)}\n`
      }
    }
  }
  msg.channel.send(text)
}
