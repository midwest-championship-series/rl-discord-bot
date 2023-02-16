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
			const statCategories = ['wins', 'shots', 'goals', 'saves', 'assists', 'score']
			const stats = await rlStats.getPlayerStats([
				{ property: 'player_id', value: player._id }
			], statCategories)

			let msg = `**${player.screen_name}'s Stats from ${stats.total} games**\n`
			console.log(stats.aggregations)
			for (const key of statCategories) {
				const value = stats.aggregations[key]
				msg += `__${key}__:\n`
				msg += `  total: ${value.sum}\n`
				msg += `  average: ${value.avg}\n`
			}

			await interaction.reply(msg)
		} catch (err) {
			await interaction.reply(err.message)
		}
	},
}