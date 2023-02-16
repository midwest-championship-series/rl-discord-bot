import { SlashCommandBuilder } from 'discord.js'

export const ping = {
	data: new SlashCommandBuilder()
		.setName('ping')
		.setDescription('Tests whether the discord bot is running. Replies with "pong"'),
	async execute(interaction) {
		await interaction.reply('Pong!')
	},
}