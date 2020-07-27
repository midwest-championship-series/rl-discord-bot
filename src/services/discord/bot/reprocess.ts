import rlStats from '../../rl-stats'

const reprocess = async msg => {
  // e.g. !reprocess week:1 season:1
  const args = msg.content.split(' ').slice(1)
  const collection = args.shift()
  const params: string[] = args.reduce((result, param) => {
    const [key, value] = param.split(':')
    return {
      ...result,
      [key]: value,
    }
  }, {})
  const { messages } = await rlStats.reprocess(collection, params)
  const message = `queued ${messages.length} matches for reprocessing`
  console.info(message)
  msg.channel.send(message)
}

export default reprocess
