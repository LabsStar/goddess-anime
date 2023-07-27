import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction, MessageEmbed, MessageActionRow } from 'discord.js';
import Command from "../../../interfaces/Command";
import user from '../../../models/user';
import { Document } from 'mongoose';
import Activity from '../../../services/activity';

export const command: Command = {
    data: new SlashCommandBuilder()
        .setName('setting')
        .setDescription('Change your settings')
        .addSubcommand(subcommand =>
            subcommand
                .setName('banner')
                .setDescription('Change your banner')
                .addStringOption(option =>
                    option
                        .setName('banner')
                        .setDescription('The banner you want to set')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('about')
                .setDescription('Change your about me')
                .addStringOption(option =>
                    option
                        .setName('about')
                        .setDescription('The about me you want to set')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('pronouns')
                .setDescription('Change your pronouns')
                .addStringOption(option =>
                    option
                        .setName('pronouns')
                        .setDescription('The pronouns you want to set')
                        .setRequired(true))),
    hasToBeLinked: true,
    async execute(interaction: CommandInteraction) {

        const { channel, guild, client } = interaction;

        const userDoc = await user.findOne({ discordId: interaction.user.id });

        const activity = new Activity(client);


        const subcommand = interaction.options.getSubcommand();

        async function updateUser() {
            const value = interaction.options.getString(subcommand)!;

            if (!value) return;
            if (!userDoc) return;

            //@ts-ignore
            userDoc[subcommand] = value;

            await userDoc.save();

            const embed = new MessageEmbed()
                .setTitle('Settings Changed!')
                .setDescription(`Your ${subcommand} has been changed to \`${value}\`!`)
                .setColor('GREEN');

            await activity.setActivity(
                interaction.user.id,
                `Updated ${subcommand}`,
                `https://cdn.discordapp.com/attachments/1102922824580091927/1110325110130352128/9256-settings-dark.png`,
                `You updated your ${subcommand} to ${value}`,
                `https://goddessanime.com/settings`,
                [{ label: 'Change Settings', cb: `https://goddessanime.com/settings` }],
                new Date(Date.now()).toLocaleString(),
            );

            interaction.reply({ embeds: [embed], ephemeral: true });

        }


        updateUser();



    }
} as Command;
