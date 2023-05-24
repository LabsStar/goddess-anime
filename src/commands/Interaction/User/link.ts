import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction, MessageEmbed, MessageActionRow, MessageButton } from 'discord.js';
import Command from "../../../interfaces/Command";
import user from '../../../models/user';

export const command: Command = {
    data: new SlashCommandBuilder()
        .setName('link')
        .setDescription('Link your account to the bot'),
        hasToBeLinked: false,
    async execute(interaction: CommandInteraction) {


        const { channel, guild, client } = interaction;

        const userDoc = await user.findOne({ discordId: interaction.user.id });

        if (userDoc) {
            const embed = new MessageEmbed()
                .setTitle('Error')
                .setDescription(`You already have an account linked to this bot`)
                .setColor('RED')
                .setTimestamp();

            return interaction.reply({ embeds: [embed] });
        }

        const newUser = new user({
            discordId: interaction.user.id,
            username: interaction.user.username,
            discriminator: interaction.user.discriminator,
            avatar: `https://cdn.discordapp.com/avatars/${interaction.user.id}/${interaction.user.avatar}.${interaction.user.avatar?.startsWith('a_') ? 'gif' : 'png'}?size=1024`,
            balance: 0,
            bank: 0,
            verified: false,
            cards: [],
            inventory: [],
            badges: [],
        });

        await newUser.save();

        const embed = new MessageEmbed()
            .setTitle('Success')
            .setURL(`https://user.goddessanime.com/${interaction.user.id}`)
            .setDescription(`Your account has been linked to this bot`)
            .setColor('GREEN')
            .setTimestamp();

        const row = new MessageActionRow()
            .addComponents(
                new MessageButton()
                    .setLabel('View Profile')
                    .setStyle('LINK')
                    .setEmoji('👤')
                    .setURL(`https://user.goddessanime.com/${interaction.user.id}`),
            );

        await interaction.reply({ embeds: [embed], components: [row] });



    }
} as Command;
