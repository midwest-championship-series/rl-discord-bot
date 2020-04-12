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
  const schedule = await rlStats.get('schedules', params)
  const reportedMatches = (await rlStats.get('games')).map(({ match_id }) => match_id)
  const unreported = schedule
    .filter(match => !reportedMatches.includes(match.id))
    .map(match => `${match.team_1_name} vs ${match.team_2_name}`)
  let response = ``
  response += `there are ${unreported.length} unreported matches for those criteria.`
  if (unreported.length < 10) {
    response += ` Matches needing reports are:\n`
    response += unreported.join('\n')
  }
  msg.channel.send(response)
}

export default audit
