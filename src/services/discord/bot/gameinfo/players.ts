import rlStats from '../../../rl-stats'

export const players = async (command, args, msg, objectArgs) => {
  const requiredArgs = [
    {
      name: 'id',
      description: 'ballchasing game id',
    },
  ]
  requiredArgs.forEach(arg => {
    if (!objectArgs[arg.name]) {
      throw new Error(`expected argument: ${arg.name} (${arg.description})`)
    }
  })
  const res = await rlStats.ballchasing.getGamePlayers(objectArgs.id)
  const text = res.reduce((result, player) => {
    result += `${player.name} played on team ${player.color} - ${player.id.platform}:${player.id.id}\n`
    return result
  }, '')
  msg.channel.send(text)
}
