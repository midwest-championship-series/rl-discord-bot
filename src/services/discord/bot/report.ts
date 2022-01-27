import rlStats from '../../rl-stats'

/**
 * @todo error handling if report goes wrong
 */

const report = async (command, args, msg) => {
  const leagueId = msg.league._id
  const urls = args
    .filter(url => url.match(/[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/))
    .map(url => url.split('?')[0])

  try {
    // report scores
    const res = await rlStats.report({ urls, leagueId, replyToChannel: msg.channel.id })
    console.log(res)
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
