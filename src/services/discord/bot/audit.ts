import rlStats from '../../rl-stats'
import { createQuery } from '../../../utils/message-parse'

const audit = async (command, args, msg) => {
  const params = createQuery(args)
  const league = msg.league
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
