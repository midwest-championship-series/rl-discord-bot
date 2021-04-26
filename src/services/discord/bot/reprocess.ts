import rlStats from '../../rl-stats'

const reprocess = async (command, args, msg) => {
  // e.g. !reprocess week:1 season:1
  const collection = args.shift()
  const params: string[] = args.reduce((result, param) => {
    const [key, value] = param.split(':')
    return {
      ...result,
      [key]: value,
    }
  }, {})
  const { succeeded } = await rlStats.reprocess(collection, params)
  const message = `queued ${succeeded} matches for reprocessing`
  console.info(message)
  msg.channel.send(message)
}

export default reprocess
