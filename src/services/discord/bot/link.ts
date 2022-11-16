const accountLinkURL = `${process.env.PROTOCOL}://${process.env.HOST}/api/v1/auth/discord`

export default async (command, args, msg) => {
  let text = ''
  text += `To report games, please link your steam or xbox account to Discord, link your Discord to MNCS here: ${accountLinkURL}.\n`
  text += `You will be redirected to discord.com to link your account to MNCS.\n`
  text += `If you have any concerns, please reach out to Tero or the MNCS stats team in discord.`
  msg.channel.send(text)
}
