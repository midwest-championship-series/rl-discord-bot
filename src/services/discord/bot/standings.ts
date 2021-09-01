import rlStats from '../../rl-stats'
import createEmbed from '../../../utils/create-embed'

const getStat = (stats, key) => {
  return stats.find(s => s.key === key)
}

export default async (command, args, msg) => {
  const leagueName = args[0] && args[0].toLowerCase()
  if (!leagueName) throw new Error('Please request the standings for a league using !standings [league name]')
  const [league] = await rlStats.get('leagues', { name: leagueName, populate: 'current_season' })
  if (!league) throw new Error(`no league found with name ${leagueName}`)
  const items: any[] = await rlStats.getSeasonStandings(league.current_season_id)
  let message = `**__${league.name.toUpperCase()} Season ${league.current_season.name} Standings__**\n`
  items.forEach((item, index) => {
    message += `${index + 1}. `
    const emojiId = item.team.vars.find(v => v.key === 'emoji_id')
    if (emojiId) message += `${emojiId.value} `
    message += `${item.team.name} (${[
      getStat(item.stats, 'match_wins').value,
      getStat(item.stats, 'match_losses').value,
    ].join('-')})`
    message += `\n`
  })
  msg.channel.send(message)
}
