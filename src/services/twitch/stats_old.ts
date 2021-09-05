import rlStats from '../rl-stats'

const stats = async function(client, target, args, seasonIDs) {
  // parse message into parameters
  let leagueName = ''
  let playerName = ''
  if (args[1] != 'mncs' && args[1] != 'clmn' && args[1] != 'mnrs' && args[1] != 'all') {
    leagueName = 'all'
    playerName = args
      .split(' ')
      .slice(1)
      .join(' ')
  } else {
    leagueName = args.split(' ')[1]
    playerName = args
      .split(' ')
      .slice(2)
      .join(' ')
  }
  let playerID = ''
  try {
    playerID = (await rlStats.get('players', { screen_name: playerName }))[0]._id
  } catch (error) {
    client.say(target, `Player name not found for name ${playerName}`)
  }
  if (leagueName === 'all') {
    try {
      // need to add logic to handle 1,2, or 3 seasons returned
      const playerStats = await rlStats.getPlayerStats(playerID, 'all')
      const mncsSaves = playerStats.total_saves.buckets.mncs.saves.value
      const mncsGoals = playerStats.total_goals.buckets.mncs.saves.value
      const mncsAssists = playerStats.total_assists.buckets.mncs.saves.value
      const clmnSaves = playerStats.total_saves.buckets.clmn.saves.value
      const clmnGoals = playerStats.total_goals.buckets.clmn.saves.value
      const clmnAssists = playerStats.total_assists.buckets.clmn.saves.value
      const mnrsSaves = playerStats.total_saves.buckets.mnrs.saves.value
      const mnrsGoals = playerStats.total_goals.buckets.mnrs.saves.value
      const mnrsAssists = playerStats.total_assists.buckets.mnrs.saves.value
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
      const playerStats = await rlStats.getPlayerStats(playerID, seasonIDs[leagueName])
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
export default stats
