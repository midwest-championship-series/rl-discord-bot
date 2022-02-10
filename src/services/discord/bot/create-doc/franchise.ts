import rlStats from '../../../rl-stats'

export default async (msg: any, args: string[] = []) => {
  const role = msg.mentions.roles.values().next()
  const franchise = args.reduce(
    (result, item) => {
      const [key, value] = item.split(':')
      result[key] = value
      return result
    },
    {
      name: role.value.name,
      discord_id: role.value.id,
    },
  )
  const newFranchise = await rlStats.post('franchises', franchise)
  msg.channel.send(`created franchise: ${newFranchise.name}`)
}
