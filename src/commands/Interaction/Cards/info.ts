import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction, MessageEmbed, TextChannel } from 'discord.js';
import Command from "../../../interfaces/Command";
import cards from '../../../models/cards';

export const command: Command = {
  data: new SlashCommandBuilder()
    .setName('card-info')
    .setDescription('Get information about a card')
    .addStringOption(option =>
      option
        .setName('card-id')
        .setDescription('The ID of the card you want to get information about')
        .setRequired(true)),
  hasToBeLinked: false,
  async execute(interaction: CommandInteraction) {
    const cardId = interaction.options.getString('card-id')!;

    const cardData = await cards.findOne({ _id: cardId });

    if (!cardData) return interaction.reply({ content: `There is no card with the ID \`${cardId}\`!`, ephemeral: true });

    const card_embed = new MessageEmbed()
        .setTitle(`Card Information`)
        .setAuthor({
            name: `${cardData.name}`,
            url: `https://goddessanime.com/card/${cardData._id}`
        })
        .setURL(`https://goddessanime.com/card/${cardData._id}`)
        .setDescription(`${cardData.description}`)
        .setImage(`${cardData.image}`)
        .setColor('#FF0000')
        .setFooter({
            text: `${cardData.tagLine}`
        });

        for (let [key, value] of Object.entries(cardData.stats)) {
            // Capitalize the first letter of the key
            key = key.charAt(0).toUpperCase() + key.slice(1);
        
            // Add the key and value to the embed
            card_embed.addFields({
                name: `${key}:`,
                value: `${value}`,
                inline: true
            });
        };

    await interaction.reply({ embeds: [card_embed] });
  }
} as Command;