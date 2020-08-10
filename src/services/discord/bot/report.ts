import rlStats from '../../rl-stats'

/**
 * @todo error handling if report goes wrong
 * @todo validation on report message
 * @todo figure out how to @ the user correctly
 * @todo link w/o displaying full link
 */

const report = async (msg, league) => {
  const gameIds = msg.content
    .split(' ')
    .slice(1)
    .map(
      url =>
        url
          .split('?')[0]
          .split('/')
          .slice(-1)[0],
    )

  try {
    // report scores
    const [{ _id: leagueId }] = await rlStats.get('leagues', { name: league.name })
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
