import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction, MessageEmbed, MessageActionRow, MessageButton } from 'discord.js';
import Command from "../../../interfaces/Command";
import user from '../../../models/user';
import cards from '../../../models/cards';

export const command: Command = {
    data: new SlashCommandBuilder()
        .setName('inventory')
        .setDescription('Check your inventory (Cards)'),
        hasToBeLinked: true,
    async execute(interaction: CommandInteraction) {

        const { channel, guild, client } = interaction;


        const userDoc = await user.findOne({ discordId: interaction.user.id });

        if (!userDoc) return interaction.reply({ content: "You don't have an account yet! Please run `/link` to create one.", ephemeral: true });

        //? Snippet from src\webServer.ts
        const cardIds = userDoc.cards.map((card) => ({ id: String(card.id), personal_id: card.personal_id })); // Extract id value and personal_id from card object
        const userCards = await cards.find({ _id: { $in: cardIds.map(card => card.id) } });
        //? End snippet

        const embed = new MessageEmbed()
            .setTitle(`${interaction.user.username}'s Inventory`)
            .setDescription(`You have ${userCards.length > 0 ? userCards.length : 'no'} ${userCards.length === 1 ? 'card' : 'cards'}.`)
            .setColor('RANDOM')
            .setTimestamp();

        for (const card of userCards) {
            const cardId = cardIds.find((cardId) => cardId.id === String(card.id));
            if (cardId) {
                embed.addFields({
                    name: `${card.name}`,
                    value: `Personal ID: ${cardId.personal_id}`
                });
            }
        }

        await interaction.reply({ embeds: [embed] });
    }
} as Command;