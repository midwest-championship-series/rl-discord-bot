const accountLinkURL = `${process.env.PROTOCOL}://${process.env.HOST}/api/v1/auth/discord`

export const requestLinkAccount = author => {
  let dm = ''
  dm += `In order to report games, you have to link your steam or xbox account to Discord, then go here: ${accountLinkURL} to link your Discord to MNRL.\n`
  dm += `You will be redirected to discord.com to link your account to MNRL.\n`
  dm += `If you have any concerns, please reach out to Tero or the MNCS stats team in discord.`
  author.send(dm)
}

export default async msg => {
  if (msg.content === 'ping') {
    return msg.author.send('pong')
  } else if (msg.content.startsWith('!link')) {
    return requestLinkAccount(msg.author)
  }
}
