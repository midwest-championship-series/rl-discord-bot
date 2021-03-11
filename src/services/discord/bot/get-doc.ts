import { pick, chunk } from 'lodash'
import rlStats from '../../rl-stats'
import createEmbed from '../../../utils/create-embed'
import { pullArg, createQuery } from '../../../utils/message-parse'

const getDoc = async (command, args, msg) => {
  const pageSize = 5
  const model = args.shift()
  const page = parseInt(pullArg(args, 'page').value || '1')
  const selectStatement = pullArg(args, 'select').value
  const selection = selectStatement && selectStatement.split(',')
  const query = createQuery(args)
  const results = (await rlStats.get(model, query)).map(doc => (selection ? pick(doc, selection) : doc))
  const pagedResults = chunk(results, pageSize)
  if (pagedResults.length < 1) {
    return msg.channel.send(`no ${model} results for query: ${JSON.stringify(query, null, 2)}`)
  }
  if (!pagedResults[page - 1]) throw new Error(`page:${page} does not exist`)
  const headerMessage = `Returning page ${page} of ${Math.ceil(
    results.length / pageSize,
  )} ${model}. To get next pages, add parameter page:<page number>`
  msg.channel.send(headerMessage)
  const embeds = pagedResults[page - 1].map((result, index) => {
    const embed = createEmbed()
    let description = `${model}[${pageSize * (page - 1) + index + 1}]\n\n`
    description += `\`\`\`${JSON.stringify(result, null, 2)}\`\`\``
    embed.setDescription(description)
    return embed
  })
  for (let embed of embeds) {
    msg.channel.send(embed)
  }
}

export default getDoc
