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
    .filter(url => url.match(/[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/))
    .map(url => url.split('?')[0])
  const manualReports = []
  // get the value of the first role mentioned
  const roles: any[] = Array.from(msg.mentions.roles.values())
  if (roles.length !== 2) throw new Error(`expected 2 franchise mentions but got ${roles.length} mentions`)
  const franchises = await rlStats.get(
    'franchises',
    `discord_id=${roles[0].id}&discord_id=${roles[1].id}&populate=teams`,
  )
  if (franchises.length !== 2) throw new Error(`expected 2 franchises but got ${franchises.length}`)
  const tierName = msg.league.name.toLowerCase()
  const teams = franchises.map(franchise => {
    return franchise.teams.find(t => {
      if (t.tier_name && t.tier_name.toLowerCase() === tierName) {
        t.franchise = franchise
        return t
      }
    })
  })

  // const gameReportRegex = new RegExp(/g///s)
  manualReports.push(
    ...args
      .filter(a => a.match(/g\/\//))
      .reduce((result, item) => {
        console.log('item', item)
        const [g, gameNumber, winType, franchiseMention] = item.split('//')
        console.log(g, gameNumber, winType, franchiseMention)
        if (!['w', 'ff'].includes(winType)) {
          throw new Error(`expected win type "w" or "ff" but got ${winType}`)
        }
        const mentionReg = new RegExp(/(?<=<@&)(.*)(?=>)/s)
        const mentionFranchiseId = mentionReg.exec(franchiseMention)[0]
        result.push({
          game_number: parseInt(gameNumber),
          winning_team_id: teams.find(t => t.franchise.discord_id === mentionFranchiseId)._id,
          forfeit: winType === 'ff',
        })
        return result
      }, []),
  )

  if (manualReports.length > 0) {
    if (roles.length !== 2) {
      let message = `expected 2 teams mentioned but got ${roles.length}\n`
      message += `expected usage:\n\`\`\`!report <@team 1> <@team 2>\n`
      message += `g//1//w//<@team that won game 1>\n`
      message += `g//2//ff//<@team that ff'd game 2>\n`
      message += `etc...\`\`\``
      throw new Error(message)
    }
    if (teams.length !== 2) {
      let message = `expected 2 teams but got ${teams.length}. teams: ${teams.map(t => t.name).join(', ')}`
      throw new Error(message)
    }
  }

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
