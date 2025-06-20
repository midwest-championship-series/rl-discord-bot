import { players } from './players'

const handlers = {
  players,
}

const gameInfo = async (command, args, msg, objectArgs) => {
  console.log('running', args)
  const handler = handlers[args[0]]
  if (!handler) {
    throw new Error(`No matchInfo handler for ${args[0]}. Available handlers: ${Object.keys(handlers).join(', ')}`)
  }
  await handler(command, args, msg, objectArgs)
}

export default gameInfo
