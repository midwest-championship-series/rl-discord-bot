import {
  SlashCommandBuilder,
  CommandInteraction,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
  ActionRowBuilder,
  ComponentType,
} from 'discord.js'
import rlStats from '../../../rl-stats'

export const proposeTransaction = {
  data: new SlashCommandBuilder()
    .setName('proposetransaction')
    .setDescription('Submits a transaction proposal')
    .addStringOption(option =>
      option
        .setName('text')
        .setDescription('Transaction text')
        .setRequired(true),
    ),
  async execute(interaction: CommandInteraction) {
    console.log(interaction)

    const row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
      new StringSelectMenuBuilder()
        .setCustomId('starter')
        .setPlaceholder('Make a selection!')
        .addOptions(
          new StringSelectMenuOptionBuilder()
            .setLabel('Bulbasaur')
            .setDescription('The dual-type Grass/Poison Seed Pokémon.')
            .setValue('bulbasaur'),
          new StringSelectMenuOptionBuilder()
            .setLabel('Charmander')
            .setDescription('The Fire-type Lizard Pokémon.')
            .setValue('charmander'),
          new StringSelectMenuOptionBuilder()
            .setLabel('Squirtle')
            .setDescription('The Water-type Tiny Turtle Pokémon.')
            .setValue('squirtle'),
        ),
    )

    const response = await interaction.reply({
      content: 'Choose your starter!',
      components: [row],
    })

    const collector = response.createMessageComponentCollector({
      componentType: ComponentType.StringSelect,
      time: 3_600_000,
    })

    collector.on('collect', async i => {
      const selection = i.values[0]
      await i.reply(`${i.user} has selected ${selection}!`)
    })

    // await interaction.reply('first reply')

    // // const reply = await interaction.fetchReply()
    // // console.log(reply)
    // // await interaction.deleteReply(reply)
    // // await interaction.deleteReply(followup)
    // const select = new StringSelectMenuBuilder()
    // 	.setCustomId('starter')
    // 	.setPlaceholder('Make a selection!')
    // 	.addOptions(
    // 		new StringSelectMenuOptionBuilder()
    // 			.setLabel('Bulbasaur')
    // 			.setDescription('The dual-type Grass/Poison Seed Pokémon.')
    // 			.setValue('bulbasaur'),
    // 		new StringSelectMenuOptionBuilder()
    // 			.setLabel('Charmander')
    // 			.setDescription('The Fire-type Lizard Pokémon.')
    // 			.setValue('charmander'),
    // 		new StringSelectMenuOptionBuilder()
    // 			.setLabel('Squirtle')
    // 			.setDescription('The Water-type Tiny Turtle Pokémon.')
    // 			.setValue('squirtle'),
    // 	);
    //   const row = new ActionRowBuilder().addComponents(select)
    //   const followup = await interaction.followUp({components: [row]})
  },
}
