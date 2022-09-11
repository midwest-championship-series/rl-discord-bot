import matchCreator from './match'
import franchiseCreator from './franchise'
import teamCreator from './team'

const creators = {
  match: matchCreator,
  franchise: franchiseCreator,
  team: teamCreator,
}

const argRegex = /[^\"\s]*:(("(.*?)")|[^\"\s]*)/g

const create = async (command, args, msg, objectArgs) => {
  const model = args.shift()
  console.log('creating', model)
  const createHandler = creators[model]
  if (!createHandler) {
    throw new Error(`no create rules for model ${model}`)
  }

  await createHandler(msg, objectArgs)
}

export default create
