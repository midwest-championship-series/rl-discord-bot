import { getKeyValue } from '../../utils/message-parse'
import rlStats from '../rl-stats'

const stats = async function(client, target, args, seasonIDs) {
  // parse message into parameters
  let league = [...args.matchAll(/(?:[Ll]e?a?g?u?e?:\s?)([Cc][Ll][Mm][Nn]|[Mm][Nn][CcRr][Ss])/g)]
  const player = [...args.matchAll(/(?:[Nn]a?m?e?:\s?)(.+?)(?=\s?[Ss]:|\s?[Ll]:|\s?$)/g)]
  const season = [...args.matchAll(/(?:[Ss]e?a?s?o?n?:\s?)(\d{1})/g)]
  // get playerName
  let playerName = ''
  if (!player[0]) {
    client.say(target, `No player name found, please specify player...`)
  } else {
    playerName = player[0][1]
  }
  // get leagueName
  let leagueName = ''
  if (!league[0]) {
    leagueName = 'all'
  } else {
    leagueName = league[0][1]
  }
  // get season
  let seasonID = ''
  if (!season[0] && leagueName != 'all') {
    seasonID = seasonIDs[leagueName]
  }
  // retrieve player id
  const playerSearch = await rlStats.get('players', { screen_name: playerName })
  if (!playerSearch[0]) {
    client.say(target, `Player ${playerName} not found...`)
    return
  }
  const playerID = (await rlStats.get('players', { screen_name: playerName }))[0]._id
  if (leagueName === 'all') {
    try {
      // need to add logic to handle 1,2, or 3 seasons returned
      const playerStats = await rlStats.legacyGetPlayerStats(playerID, 'all')
      const mncsSaves = getValue(playerStats, 'saves', 'mncs')
      const mncsGoals = getValue(playerStats, 'goals', 'mncs')
      const mncsAssists = getValue(playerStats, 'assists', 'mncs')
      const clmnSaves = getValue(playerStats, 'saves', 'clmn')
      const clmnGoals = getValue(playerStats, 'goals', 'clmn')
      const clmnAssists = getValue(playerStats, 'assists', 'clmn')
      const mnrsSaves = getValue(playerStats, 'saves', 'mnrs')
      const mnrsGoals = getValue(playerStats, 'goals', 'mnrs')
      const mnrsAssists = getValue(playerStats, 'assists', 'mnrs')
      client.say(
        target,
        `${playerName}:
      MNCS: ${mncsGoals} goals, ${mncsAssists} assists, and ${mncsSaves} saves this season
      CLMN: ${clmnGoals} goals, ${clmnAssists} assists, and ${clmnSaves} saves this season
      MNRS: ${mnrsGoals} goals, ${mnrsAssists} assists, and ${mnrsSaves} saves this season`,
      )
    } catch (error) {
      client.say(
        target,
        `Unable to resolve, please specify league name:
      ex: !stats mncs Tero`,
      )
    }
  } else {
    try {
      const playerStats = await rlStats.getPlayerStats(playerID, seasonIDs[leagueName.toLowerCase()])
      const saves = playerStats.total_saves.sum
      const goals = playerStats.total_goals.sum
      const assists = playerStats.total_assists.sum
      client.say(
        target,
        `${playerName} has ${goals} goals, ${assists} assists, and ${saves} saves in ${leagueName} this season`,
      )
    } catch (error) {
      client.say(target, `Unable to get stats for ${playerName}`)
    }
  }
}
const getValue = (playerStats: any, stat: string, league: string) => {
  return playerStats['total_' + stat]['buckets'][league][stat].value
}

export default stats
