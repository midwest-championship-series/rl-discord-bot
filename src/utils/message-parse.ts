export const createQuery = (args: Array<string>) => {
  return args.reduce((result, param) => {
    const { key, value } = getKeyValue(param)
    return {
      ...result,
      [key]: value,
    }
  }, {})
}

export const pullArg = (args: Array<string>, argName: string) => {
  const argIndex = args.findIndex(arg => arg.split(':')[0] === argName)
  if (argIndex < 0) return { key: argName, value: undefined }
  return getKeyValue(
    args.splice(
      args.findIndex(arg => arg.split(':')[0] === argName),
      1,
    )[0],
  )
}

export const getKeyValue = (arg: string) => {
  const [key] = arg.split(':')
  const value = arg
    .split(':')
    .slice(1)
    .join('')
  return {
    key,
    value,
  }
}

// export const extractKeyValue = (param: string) => {
//   const [key] = param.split(':')
//   const value = param
//     .split(':')
//     .slice(1)
//     .join('')
//   return {
//     [key]: value,
//   }
// }
