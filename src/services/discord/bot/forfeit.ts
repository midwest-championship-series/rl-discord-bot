import rlStats from '../../rl-stats'

/**
 * @todo error handling if report goes wrong
 * @todo validation on report message
 * @todo figure out how to @ the user correctly
 * @todo link w/o displaying full link
 */

const forfeit = async (command, args, msg) => {
  const leagueId = msg.league._id
  const allRoles: any[] = Array.from(msg.mentions.roles.values())
  if (allRoles.length !== 1) {
    let message = `expected 1 team to forfeit but received ${allRoles.length}\n`
    message += `expected usage: !ff @<team who forfeited> <match query parameter 1>:<parameter value 1> <match query parameter 2>:<parameter value 2> etc...\n`
    throw new Error(message)
  }

  try {
    const league = await rlStats.get(`leagues/${leagueId}`, `populate=current_season.matches.teams`)
    const query = args
      .filter(a => a.includes(':'))
      .reduce(
        (result, arg) => {
          const [key, value] = arg.split(':')
          result[key] = value
          return result
        },
        { status: 'open' },
      )
    const matches = league.current_season.matches.filter(match => {
      return Object.keys(query).every(key => match[key] == query[key])
    })
    if (matches.length !== 1) {
      let message = `expected to locate 1 match with query, but found ${matches.length}.\nquery:\n`
      message += JSON.stringify(query, null, 2)
      throw new Error(message)
    }
    const { winner, loser } = matches[0].teams.reduce((result, team) => {
      if (team.discord_id == allRoles[0].id) {
        result.loser = team
      } else {
        result.winner = team
      }
      return result
    }, {})
    msg.channel.send(`reporting forfeit. ${loser.name} forfeit to ${winner.name}`)
    await rlStats.forfeit({ leagueId, replyToChannel: msg.channel.id, forfeitTeam: loser, matchId: matches[0]._id })
  } catch (err) {
    console.error(err)
    if (err.body && err.body.error) {
      throw new Error(err.body.error)
    } else {
      throw err
    }
  }

  // msg.channel.send('submitted match for forfeit')

  // try {
  //   // report scores
  //   await rlStats.report({ leagueId, replyToChannel: msg.channel.id })
  //   msg.channel.send(`Thank you for the report, <@${msg.author.id}>!`)
  // } catch (err) {
  //   console.error(err)
  //   if (err.body && err.body.error) {
  //     throw new Error(err.body.error)
  //   } else {
  //     throw err
  //   }
  // }
}

export default forfeit
