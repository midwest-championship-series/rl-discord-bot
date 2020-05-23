import rlStats from '../../rl-stats'

const reprocess = async msg => {
  if (msg.mentions.roles.size === 2) {
    const teamIds = []
    for (let [id] of msg.mentions.roles) {
      teamIds.push(id)
    }
    const teams = (await rlStats.get('teams')).filter(t => teamIds.includes(t.discord_id))
    if (teams.length !== 2) return msg.channel.send('did not find 2 teams')
    const [match] = (await rlStats.get('schedule')).filter(m =>
      [m.team_1_id, m.team_2_id].every(id => teams.map(t => t.id).includes(id)),
    )
    if (!match) {
      return msg.channel.send('no match found for mentioned teams')
    } else {
      try {
        await rlStats.report({ matchId: match.id })
        const message = `successfully reprocessed match: ${match.id} ${teams[0].name} vs ${teams[1].name}`
        console.info(message)
        msg.channel.send(message)
      } catch (err) {
        console.error(err)
        msg.channel.send(err.body.error)
      }
    }
  } else {
    // e.g. !reprocess week:1 season:1
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
    const { messages } = await rlStats.reprocess(params)
    const message = `queued ${messages.length} matches for reprocessing`
    console.info(message)
    msg.channel.send(message)
  }
}

export default reprocess
