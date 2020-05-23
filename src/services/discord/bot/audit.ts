import rlStats from '../../rl-stats'

const audit = async msg => {
  const params = msg.content
    .split(' ')
    .slice(1)
    .reduce((result, param) => {
      const [key, value] = param.split(':')
      return {
        ...result,
        [key]: value,
      }
    }, {})
  // const schedule = await rlStats.get('schedules', params)
  // const reportedMatches = await rlStats.get('games')
  // const unreported = schedule
  //   .filter(match => !reportedMatches.includes(match.id))
  //   .map(match => `${match.team_1_name} vs ${match.team_2_name}`)
  // const matches = await rlStats.get('matches', { ...params, status: 'closed', populate: 'season.teams' })
  // const unreportedMatches = matches.filter(m => m.status !== 'closed')
  const [league] = await rlStats.get('leagues', { name: msg.league.name })
  // const currentSeason = league.seasons.find(s => s._id === league.current_season_id)
  const currentSeason = await rlStats.get(`seasons/${league.current_season_id}`, { populate: ['matches.teams'] })
  const matches = currentSeason.matches.filter(match => Object.keys(params).every(p => match[p] == params[p]))
  const unreported = matches.filter(m => m.status !== 'closed').map(m => `${m.teams[0].name} vs ${m.teams[1].name}`)
  let response = ``
  response += `There are ${unreported.length} unreported matches for those criteria.`
  if (unreported.length > 0) {
    response += ` Matches needing reports are:\n`
    response += unreported.join('\n')
  }
  msg.channel.send(response)
}

export default audit
