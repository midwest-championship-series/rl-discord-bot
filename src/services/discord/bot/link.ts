const accountLinkURL = `${process.env.PROTOCOL}://${process.env.HOST}/api/v1/auth/discord`

export default async (command, args, msg) => {
  let text = ''
  text += `Link your Discord to MCS here: ${accountLinkURL}.\n`
  text += `Please link any accounts you'll play games on (e.g. Steam, XBOX, etc...) to Discord prior to linking Discord with MCS.\n`
  text += `You will be redirected to discord.com to link your account to MCS.\n`
  text += `If you have any concerns, please reach out to Tero or the MCS stats team in discord.`
  msg.channel.send(text)
}
