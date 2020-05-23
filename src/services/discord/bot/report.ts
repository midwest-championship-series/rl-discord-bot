import rlStats from '../../rl-stats'

/**
 * @todo error handling if report goes wrong
 * @todo validation on report message
 * @todo flexibility for message format
 * @todo figure out how to @ the user correctly
 * @todo link w/o displaying full link
 */

const report = async msg => {
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
  // find out if user has a linked account
  try {
    // report scores
    const { recorded_ids } = await rlStats.report({ gameIds })
    msg.channel.send(`Thank you for the report, @${msg.author.username}!\nGames reported: ${recorded_ids.join(', ')}`)
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
