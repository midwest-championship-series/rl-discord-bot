import rlStats from '../../rl-stats'

const createTeams = async (command, args, msg) => {
  const allValues: Array<{ id: string; name: string }> = Array.from(msg.mentions.roles.values())
  for (const { id, name } of allValues) {
    if (!id || !name) throw new Error(`Error: no id or team name found for team: ${name}`)
    const [existing] = await rlStats.get('teams', { discord_id: id })
    if (existing) throw new Error(`Error: team with id: ${id} and name: ${existing.name} already exists`)
    const team = await rlStats.post('teams', {
      name,
      discord_id: id,
      hex_color: '72BFFF',
    })
    msg.channel.send(`created team: ${team.name}`)
  }
}

export default createTeams
