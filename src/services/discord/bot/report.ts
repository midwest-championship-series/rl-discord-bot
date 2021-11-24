import rlStats from '../../rl-stats'

/**
 * @todo error handling if report goes wrong
 * @todo validation on report message
 * @todo figure out how to @ the user correctly
 * @todo link w/o displaying full link
 */

const report = async (command, args, msg) => {
  const leagueId = msg.league._id
  const urls = args
    .map(url => url.split('?')[0])
    .filter(url => url.match(/[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/))
  const manualReports = []
  const allRoles: any[] = Array.from(msg.mentions.roles.values())
  if (allRoles.length !== 2) {
    let message = `expected 2 teams mentioned but got ${allRoles.length}\n`
    message += `expected usage:\n\`\`\`!report <@team 1> <@team 2>\n`
    message += `g::1::w::<@team that won game 1>\n`
    message += `g::2::ff::<@team that ff'd game 2>\n`
    message += `etc...\`\`\``
    throw new Error(message)
  }

  const teams = await rlStats.get('teams', allRoles.map(r => `discord_id=${r.id}`).join('&'))
  if (teams.length !== 2) {
    let message = `expected 2 teams but got ${teams.length}. teams: ${teams.map(t => t.name).join(', ')}`
    throw new Error(message)
  }

  // const gameReportRegex = new RegExp(/g::/s)
  manualReports.push(
    ...args
      .filter(a => a.match(/g::/))
      .reduce((result, item) => {
        const [g, gameNumber, winType, teamMention] = item.split('::')
        if (!['w', 'ff'].includes(winType)) {
          throw new Error(`expected win type "w" or "ff" but got ${winType}`)
        }
        const mentionReg = new RegExp(/(?<=<@&)(.*)(?=>)/s)
        const mentionedTeamId = mentionReg.exec(teamMention)[0]
        result.push({
          game_number: parseInt(gameNumber),
          winning_team_id: teams.find(t => t.discord_id === mentionedTeamId)._id,
          forfeit: winType === 'ff',
        })
        return result
      }, []),
  )

  try {
    // report scores
    await rlStats.report({
      urls,
      leagueId,
      replyToChannel: msg.channel.id,
      manualReports,
      mentionedTeamIds: teams.map(t => t._id),
    })
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
