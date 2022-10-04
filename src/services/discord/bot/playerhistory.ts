import rlStats from '../../rl-stats'
import * as day from 'dayjs'
import * as utc from 'dayjs/plugin/utc'
import * as timezone from 'dayjs/plugin/timezone'
day.extend(utc)
day.extend(timezone)

const linkTeam = async (command, args, msg) => {
  const tz = 'America/Chicago'
  const user = msg.mentions.users.values().next().value
  const { id } = user
  const [player] = await rlStats.get('players', { populate: 'teams', discord_id: id })
  if (!player) throw new Error(`no player found for discord_id: ${id}`)
  let response = `${player.screen_name}'s team histoy:\n\`\`\``
  response += player.team_history
    .map(history => {
      const team = player.teams.find(t => t._id === history.team_id)
      let line = `${team.name} - Joined: ${day(history.date_joined)
        .tz(tz)
        .format('MMM D, YYYY')}`
      if (history.date_left)
        line += `, Left: ${day(history.date_left)
          .tz(tz)
          .format('MMM D, YYYY')}`
      return line
    })
    .join('\n')
  response += `\`\`\``
  msg.channel.send(response)
}
export default linkTeam
