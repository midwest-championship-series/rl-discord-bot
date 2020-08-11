import rlStats from '../../rl-stats'

/**
 * @todo error handling if report goes wrong
 * @todo validation on report message
 * @todo figure out how to @ the user correctly
 * @todo link w/o displaying full link
 */

const report = async (command, args, msg) => {
  const leagueId = msg.league._id
  const gameIds = args.map(
    url =>
      url
        .split('?')[0]
        .split('/')
        .slice(-1)[0],
  )

  try {
    // report scores
    await rlStats.report({ gameIds, leagueId, replyToChannel: msg.channel.id })
    msg.channel.send(`Thank you for the report, <@${msg.author.id}>!`)
  } catch (err) {
    console.error(err)
    if (err.body && err.body.error) {
      throw new Error(err.body.error)
    } else {
      throw err
    }
  }
}

export default report
