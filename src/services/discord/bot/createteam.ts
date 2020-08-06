import rlStats from '../../rl-stats'

const createTeam = async msg => {
  const { id: teamId, name: teamName } = msg.mentions.roles.values().next().value
  if (!teamId || !teamName) throw new Error('Error: no id or team name found')
  const [existing] = await rlStats.get('teams', { discord_id: teamId })
  if (existing) throw new Error(`Error: team with id: ${teamId} and name: ${existing.name} already exists`)
  const team = await rlStats.post('teams', {
    name: teamName,
    discord_id: teamId,
    hex_color: '72BFFF',
  })
  msg.channel.send(`created team: ${team.name}`)
}

export default createTeam
