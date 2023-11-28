import rlStats from '../../rl-stats'
import { createQuery } from '../../../utils/message-parse'
import * as day from 'dayjs'
import * as utc from 'dayjs/plugin/utc'
import * as timezone from 'dayjs/plugin/timezone'
day.extend(utc)
day.extend(timezone)

const audit = async (command, args, msg) => {
  const params = createQuery(args)
  const league = msg.league
  const currentSeason = await rlStats.get(`seasons/${league.current_season_id}`, { populate: ['matches.teams'] })
  const matches = currentSeason.matches.filter(match => Object.keys(params).every(p => match[p] == params[p]))
  const unreported = matches
    .filter(m => m.status !== 'closed')
    .filter(m => !m.scheduled_datetime || day(m.scheduled_datetime).isBefore(day()))
    .map(
      m =>
        `Week ${m.week} - ${m.teams[0].name} vs ${m.teams[1].name} at ${day(m.scheduled_datetime).format('MMM D, YY')}`,
    )
  let response = ``
  response += `There are ${unreported.length} unreported matches for those criteria.`
  if (unreported.length > 0) {
    response += ` Matches needing reports are:\n`
    response += unreported.join('\n')
  }
  if (response.length > 2000) {
    msg.channel.send('response too long for reporting')
  } else {
    msg.channel.send(response)
  }
}

export default audit
