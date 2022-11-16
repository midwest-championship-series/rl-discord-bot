import { players } from './players'

const handlers = {
  players,
}

const gameInfo = async (command, args, msg, objectArgs) => {
  console.log('running', args)
  const handler = handlers[args[0]]
  if (!handler) {
    throw new Error(`no gameinfo handler for ${args[0]}`)
  }
  await handler(command, args, msg, objectArgs)
}

export default gameInfo
