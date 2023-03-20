import { SlashCommandBuilder, CommandInteraction } from 'discord.js'
import createEmbed from '../../../../utils/create-embed'

const accountLinkURL = `${process.env.PROTOCOL}://${process.env.HOST}/api/v1/auth/discord`
export const link = {
	data: new SlashCommandBuilder()
		.setName('linkdiscord')
		.setDescription(`Links your accounts with MNCS database. You can link multiple times without issue.`),
	async execute(interaction: CommandInteraction) {
    const embed = createEmbed()
    embed.setTitle('Discord Link Instructions')
    embed.setURL(accountLinkURL)
    let directions = '1. Make sure any player accounts you plan to use (Steam, Xbox, PlayStation, etc..) are linked with Discord (go to Settings > Connections to add them).\n\n'
    directions += '2. Click the link in the title of this message (this will take you to discord.com).\n\n'
    directions += '3. Sign in to Discord and authorize MNCS bot to see your connected accounts.'
    embed.setFields([
      { name: 'Description', value: `This links your Discord to the player database.` },
      { name: 'Directions', value: directions }
    ])
		await interaction.reply({
      embeds: [embed],
      // content: `Reminder: link your Steam, Xbox, and PlayStation accounts to Discord prior to using this link. Link your account here: ${accountLinkURL}`,
      ephemeral: true
    })
	},
}