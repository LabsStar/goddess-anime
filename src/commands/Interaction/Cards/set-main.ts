import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction, MessageEmbed, TextChannel } from 'discord.js';
import Command from "../../../interfaces/Command";
import cards from '../../../models/cards';
import user from '../../../models/user';

export const command: Command = {
    data: new SlashCommandBuilder()
        .setName('set-main')
        .setDescription('Set a card as your main card to level up')
        .addStringOption(option =>
            option
                .setName('card-id')
                .setDescription('The ID of the card you want to set as your main card (personal ID)')
                .setRequired(true)),
    hasToBeLinked: true,
    async execute(interaction: CommandInteraction) {
        const cardId = interaction.options.getString('card-id')!;

        const userData = await user.findOne({ discordId: interaction.user.id });

        if (!userData) return interaction.reply({ content: `You don't have a profile yet!`, ephemeral: true });


        const card = userData.cards.find((card) => card.personal_id === cardId);

        if (!card) return interaction.reply({ content: `You don't have a card with the ID \`${cardId}\`!`, ephemeral: true });

        userData.main_card = cardId;


        try {
            await userData.save();
            const cardData = await cards.findOne({ _id: card.id });

            if (!cardData) return interaction.reply({ content: `There was an error while saving your main card!`, ephemeral: true });

            const embed = new MessageEmbed()
                .setTitle(`Main card set!`)
                .setDescription(`Your main card is now **${cardData.name}**!`)
                .setColor('GREEN')
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });
        }
        catch (err) {
            console.log(err);
            await interaction.reply({ content: `There was an error while saving your main card!`, ephemeral: true });
        }

    }
} as Command;