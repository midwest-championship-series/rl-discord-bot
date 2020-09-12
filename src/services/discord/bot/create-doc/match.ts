import rlStats from '../../../rl-stats'

export default async (msg: any, args: string[]) => {
  const teamDiscordIds = Array.from(msg.mentions.roles.values()).map((t: any) => t.id)
  if (teamDiscordIds.length !== 2) {
    throw new Error(`Expected to get two teams but got ${teamDiscordIds.length}`)
  }

  const objectArgs: any = args.reduce((result, item) => {
    const propName = item.split(':')[0]
    let propValue = item.substr(propName.length + 1)
    if (propValue.charAt(0) === '"' && propValue.charAt(propValue.length - 1) === '"') {
      propValue = propValue.substr(1, propValue.length - 2)
    }
    result[propName] = propValue
    return result
  }, {})

  if (!objectArgs.season_id) {
    throw new Error('match args must contain a season_id')
  }

  const teams = await rlStats.get('teams', `discord_id=${teamDiscordIds[0]}&discord_id=${teamDiscordIds[1]}`)
  const teamIds = teams.map(t => t._id)
  const [season] = await rlStats.get('seasons', { _id: objectArgs.season_id, populate: 'matches' })
  if (!season) throw new Error(`no season found for id: ${objectArgs.season_id}`)
  const sameWeekMatch = season.matches.find(
    m => m.week == objectArgs.week && m.team_ids.every(id => teamIds.includes(id)),
  )
  if (sameWeekMatch) {
    throw new Error(`match between those teams already exists for season: ${season.name} week: ${objectArgs.week}`)
  }

  const match = await rlStats.post('matches', {
    team_ids: teams.map(t => t._id),
    best_of: 3,
    ...objectArgs,
  })

  await rlStats.put(`seasons/${season._id}`, {
    match_ids: season.match_ids.concat(match._id),
  })

  msg.channel.send(`created match: ${match._id}`)
}
