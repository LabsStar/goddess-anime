import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction, MessageEmbed } from 'discord.js';
import Command from "../../../interfaces/Command";
import CustomClient from '../../../interfaces/CustomClient';
import guild from '../../../models/guild';

export const command: Command = {
    data: new SlashCommandBuilder()
        .setName('setspawn')
        .setDescription('Set the spawn channel for the server')
        .addChannelOption(option =>
            option.setName('channel')
                .setDescription('The channel to set as the spawn channel')
                .setRequired(true)),
    hasToBeLinked: false,
    async execute(interaction: CommandInteraction) {
        const channel = interaction.options.getChannel('channel')!;

        if (channel.type !== 'GUILD_TEXT') {
            const randomChannel = interaction.guild!.channels.cache.filter(channel => channel.type === 'GUILD_TEXT').first();
            
            const replaceGuild_ = (n: string) => {
                return n.replace("GUILD_", "");
            };

            const embed = new MessageEmbed()
                .setTitle('Error!')
                .setDescription('The channel must be a text channel')
                .addFields(
                    { name: `Your input (\`${replaceGuild_(channel.type as string)}\`)`, value: `<#${channel.id}>`, inline: true },
                    { name: 'Text channel (\`TEXT\`)', value: `${randomChannel}`, inline: true }
                )
                .setColor('RED')
                .setTimestamp();

            return interaction.reply({ embeds: [embed] });
        }

        const guildData = await guild.findOne({ guildId: interaction.guildId });

        if (!guildData) throw new Error('Guild not found');

        guildData.spawnChannel = channel.id;

        await guildData.save();

        const embed = new MessageEmbed()
            .setTitle('Success!')
            .setDescription(`The spawn channel has been set to ${channel}`)
            .setColor('GREEN')
            .setTimestamp();

        return interaction.reply({ embeds: [embed] });
    }
} as Command;
