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
        msg.channel.send(`successfully reprocessed match: ${match.id} ${teams[0].name} vs ${teams[1].name}`)
      } catch (err) {
        console.error(err)
        msg.channel.send(err.body.error)
      }
    }
  } else if (msg.content.includes('all')) {
    msg.channel.send('reprocess all not yet implemented')
    // get list of all matches
    // loop through each match and call report endpoint
    // report to channel how many games were processed
  } else {
    msg.channel.send('i did not understand what to do')
  }
}

export default reprocess
