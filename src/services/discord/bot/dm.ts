const accountLinkURL = `${process.env.PROTOCOL}://${process.env.HOST}/api/v1/auth/discord`

export const requestLinkAccount = author => {
  let dm = ''
  dm += `In order to report games, you have to link your steam or xbox account to Discord, then go here: ${accountLinkURL} to link your Discord to MNRL.\n`
  dm += `You will be redirected to discordapp.com, which is Discord's website for authentication, to link your account to MNRL.\n`
  dm += `If you were trying to report scores, please re-report them for MNCS stats processing.\n`
  dm += `If you have any concerns, please reach out to Tero or the MNCS stats team in the MNRL or MNCS discords.`
  author.send(dm)
}

export default async msg => {
  if (msg.content === 'ping') {
    return msg.author.send('pong')
  } else if (msg.content.startsWith('!link')) {
    return requestLinkAccount(msg.author)
  }
}
