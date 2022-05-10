import { createQuery } from '../../../utils/message-parse'
import rlStats from '../../rl-stats'

const mergePlayer = async (command, args, msg) => {
  const mentionReg = new RegExp(/(?<=<@)(.*)(?=>)/s)
  const mentionedUserId = mentionReg.exec(msg.content)[0]
  if (!mentionedUserId) {
    throw new Error(`expected 1 user mention`)
  }
  const queryArgs = args.filter(arg => arg.includes(':'))
  const queryUsers = await rlStats.get('players', createQuery(queryArgs))
  if (queryUsers.length !== 1) {
    throw new Error(
      `expected 1 player from query but got ${queryUsers.length}. Players: ${queryUsers
        .map(p => p.screen_name)
        .join(', ')}`,
    )
  }
  const secondary = queryUsers[0]
  if (!secondary) {
    throw new Error(`no user found with _id:${args._id}`)
  }
  const [primary] = await rlStats.get('players', { discord_id: mentionedUserId })

  if (!primary) {
    throw new Error(`no user found with discord id:${mentionedUserId}`)
  }

  if (secondary._id === primary._id) {
    throw new Error('both user ids are the same')
  }

  // for (let account of secondary.accounts) {
  const newAccounts = secondary.accounts.reduce((result, account) => {
    const match = primary.accounts.find(
      acc => acc.platform === account.platform && acc.platform_id === account.platform_id,
    )
    if (match) {
      console.info('found matched acount - skipping')
      return
    }
    console.info(`pushing new account: ${account.platform}:${account.platform_id}`)
    result.push(account)
    return result
  }, [])
  console.log(newAccounts)
  await rlStats.put(`players/${primary._id}`, { accounts: primary.accounts.concat(newAccounts) })
  await rlStats.del(`players/${secondary._id}`)
  msg.channel.send(`merged player and deleted id: ${secondary._id}`)
}

export default mergePlayer
