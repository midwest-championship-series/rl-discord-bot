import rlStats from '../../../../services/rl-stats'
import { Updater } from './common'
import playerUpdates from './players'
import teamUpdates from './teams'

const updaters: { [key: string]: { [key: string]: Updater } } = {
  players: playerUpdates,
  teams: teamUpdates,
}

const update = async (command, args, msg) => {
  const model = args.shift()
  console.log('updating', model)
  const updateRules = updaters[model]
  if (!updateRules) {
    throw new Error(`no update rules for model ${model}`)
  }
  const allRoles = Array.from(msg.mentions.roles.values())
  const allUsers = Array.from(msg.mentions.users.values())
  const allMentions: any[] = [...allRoles, ...allUsers]
  if (allMentions.length > 1) {
    throw new Error('cannot mention more than one role/user in update')
  }
  const query = { discord_id: allMentions[0].id }
  const docs = await rlStats.get(`${model}`, query)
  if (!docs[0]) {
    throw new Error(`no documents found for ${model} by query: ${JSON.stringify(query)}`)
  }
  if (docs.length > 1) {
    throw new Error(`expected to find one document but found ${docs.length} for query: ${JSON.stringify(query)}`)
  }

  const updates = allMentions.length > 0 ? args.filter(arg => !arg.includes(allMentions[0].id)) : args
  const doc = docs[0]
  const notUpdated = []
  const update = updates.reduce((result, item) => {
    const property = item.split(':')[0]
    const value = item.substring(property.length + 1)
    const getUpdate = updateRules[property]
    if (!getUpdate) {
      notUpdated.push(property)
      return result
    }
    return {
      ...result,
      ...getUpdate({
        discordRole: allRoles[0],
        discordUser: allUsers[0],
        doc,
        property,
        value,
      }),
    }
  }, {})
  let message = `successfully updated ${model} properties: ${Object.keys(update).join(', ')}`
  if (notUpdated.length > 0) {
    message += `\nno update operator for ${notUpdated.join(', ')}`
  }
  await rlStats.put(`${model}/${doc._id}`, update)
  msg.channel.send(message)
}

export default update
