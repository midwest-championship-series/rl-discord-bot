import rlStats from '../../../services/rl-stats'

const linkPlayer = async (command, args, msg) => {
  const platforms = ['xbox', 'ps4', 'steam', 'epic']
  const user = msg.mentions.users.values().next().value
  const { id, username, avatar } = user
  const linkAccounts = args
    .filter(str => platforms.some(p => str.includes(p)))
    .map(acc => acc.split(':'))
    .map(acc => ({ platform: acc[0], platform_id: acc[1] }))

  const [dbUser] = await rlStats.get('players', { discord_id: id })
  if (!dbUser) throw new Error(`no player exists for: ${username}. Please link the player to a team`)

  const accounts = dbUser.accounts.concat(
    linkAccounts.filter(
      acc => !dbUser.accounts.some(dbAcc => dbAcc.platform === acc.platform && dbAcc.platform_id === acc.platform_id),
    ),
  )

  const update = {
    avatar: `https://cdn.discordapp.com/avatars/${id}/${avatar}.png`,
    accounts,
  }
  const updatedUser = await rlStats.put(`players/${dbUser._id}`, update)
  msg.channel.send(`successfully updated user: ${updatedUser.screen_name}`)
}

export default linkPlayer
