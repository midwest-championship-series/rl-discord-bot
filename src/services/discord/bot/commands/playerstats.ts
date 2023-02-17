import { SlashCommandBuilder, CommandInteraction } from 'discord.js'
import rlStats from '../../../rl-stats'

export const playerstats = {
	data: new SlashCommandBuilder()
		.setName('playerstats')
		.setDescription('Returns a players stats')
		.addUserOption(option =>
			option.setName('player')
				.setDescription('The player whose stats you want')
		),
	async execute(interaction: CommandInteraction) {
		try {
			const discord_id = interaction.options.get('player').value
			const [player] = await rlStats.get(`players`, { discord_id })
			if (!player) {
				throw new Error(`No player for <@${discord_id}>`)
			}
			const statCategories = [
				{
					name: 'Wins',
					key: 'wins',
					decimalFormat: 2,
				},
				{
					name: 'Shots',
					key: 'shots',
					decimalFormat: 2,
				},
				{
					name: 'Goals',
					key: 'goals',
					decimalFormat: 2,
				},
				{
					name: 'Saves',
					key: 'saves',
					decimalFormat: 2,
				},
				{
					name: 'Assists',
					key: 'assists',
					decimalFormat: 2,
				}
			]
			const stats = await rlStats.getPlayerStats([
				{ property: 'player_id', value: player._id }
			], statCategories.map(s => s.key))

			let msg = `**${player.screen_name}'s Stats from ${stats.total} games**\n`

			for (const { key, name, decimalFormat } of statCategories) {
				const value = stats.aggregations[key]
				msg += `__${name}__:\n`
				msg += `  total: ${value.sum}\n`
				msg += `  average: ${Math.round(value.avg * Math.pow(10, decimalFormat)) / Math.pow(10, decimalFormat)}\n`
			}

			await interaction.reply(msg)
		} catch (err) {
			await interaction.reply(err.message)
		}
	},
}