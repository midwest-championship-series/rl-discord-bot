import rlStats from '../../../rl-stats'

export const gameids = async (command, args, msg, objectArgs) => {
  const requiredArgs = [
    {
      name: 'match_id',
      description: 'ballchasing match id',
    },
  ]
  requiredArgs.forEach(arg => {
    if (!objectArgs[arg.name]) {
      throw new Error(`expected argument: ${arg.name} (${arg.description})`)
    }
  })
  const { count, list } = await rlStats.ballchasing.getMatchInfo(objectArgs.match_id)
  let text = `---- Match report ${objectArgs.match_id} ----\n\n`
  text += `Total games: ${count}\n`
  text += `Game ids: ${list.map(game => game.id).join(', ')}`
  msg.channel.send(text)
}
