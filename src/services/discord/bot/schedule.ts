import rlStats from '../../rl-stats'
import * as day from 'dayjs'
import * as utc from 'dayjs/plugin/utc'
import * as timezone from 'dayjs/plugin/timezone'
day.extend(utc)
day.extend(timezone)

export default async (command, args, msg) => {
  const leagueName = args[0] && args[0].toLowerCase()
  if (!leagueName) throw new Error('Please request the schedule for a league using !schedule [league name]')
  const [league] = await rlStats.get('leagues', { populate: 'current_season.matches.teams', name: leagueName })
  if (!league) throw new Error(`no league found with name ${leagueName}`)
  const leagueTz = league.default_timezone || 'America/New_York'
  const sortedMatches = league.current_season.matches.sort((a, b) => a.week < b.week)
  const nextWeek = sortedMatches.reduce((result, match) => {
    if (match.status !== 'open') {
      result = match.week + 1
    }
    return result
  }, 1)
  const weekMatches = sortedMatches.filter(match => match.week === nextWeek)
  let response = ''
  response += weekMatches.reduce((result, match) => {
    if (match.scheduled_datetime) {
      const datetime = day(match.scheduled_datetime).tz(leagueTz)
      result += `${datetime.format('ddd MMM D')} at ${datetime.format('hh:mm')} `
    }
    result += match.teams.map(t => `**${t.name}**`).join(' *vs* ')
    result += '\n'
    return result
  }, '')
  msg.channel.send(response)
}
