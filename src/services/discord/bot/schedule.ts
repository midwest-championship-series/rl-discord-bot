import rlStats from '../../rl-stats'
import * as day from 'dayjs'
import * as utc from 'dayjs/plugin/utc'
import * as timezone from 'dayjs/plugin/timezone'
day.extend(utc)
day.extend(timezone)

export default async (command, args, msg, objectArgs) => {
  const leagueName = args.join(' ')
  if (!leagueName) throw new Error('Please request the schedule for a league using !schedule [league name]')
  const [league] = await rlStats.get('leagues', {
    populate: 'current_season.matches.teams',
    text_search: leagueName,
  })
  if (!league) throw new Error(`no league found with name ${leagueName}`)
  const leagueTz = league.default_timezone || 'America/New_York'
  const sortedMatches = league.current_season.matches.sort(
    (a, b) =>
      a.week - b.week ||
      (a.scheduled_datetime &&
        b.scheduled_datetime &&
        new Date(a.scheduled_datetime).getTime() - new Date(b.scheduled_datetime).getTime()),
  )
  let matchWeek
  if (objectArgs.week) {
    matchWeek = Math.abs(parseInt(objectArgs.week))
  } else {
    matchWeek = sortedMatches.reduce((result, match) => {
      if (match.status !== 'open') {
        result = match.week + 1
      }
      return result
    }, 1)
  }
  if (matchWeek == 69) {
    msg.channel.send('nice.')
    return
  }
  const weekMatches = sortedMatches.filter(match => match.week === matchWeek)
  let response = ''
  response += `__**${league.name.toUpperCase()} Week ${matchWeek} Matches**__\n`
  response += weekMatches.reduce((result, match) => {
    if (match.scheduled_datetime) {
      const datetime = day(match.scheduled_datetime).tz(leagueTz)
      result += `${datetime.format('ddd MMM D')} at ${datetime.format('hh:mm')} - `
    }
    result += match.teams.map(t => `*${t.name}*`).join(' *vs* ')
    if (!match.stream_link) {
      result += ` (off stream)`
    }
    result += '\n'
    return result
  }, '')
  msg.channel.send(response)
}
