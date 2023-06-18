import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction, MessageEmbed, Webhook, WebhookClient } from 'discord.js';
import Command from "../../../interfaces/Command";
import CustomClient from '../../../interfaces/CustomClient';
import guild from '../../../models/guild';

export const command: Command = {
    data: new SlashCommandBuilder()
        .setName('setupdate')
        .setDescription('Set the update channel')
        .addChannelOption(option =>
            option.setName('channel')
                .setDescription('The channel to set as the update channel')
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

        if (!guildData) {
            const newGuild = new guild({
                guildId: interaction.guild?.id,
                spawnChannel: null,
                currentCards: [],
                updateChannel: channel.id,
            });
    
            await newGuild.save();
        }

        //@ts-ignore
        guildData.updateChannel = channel.id;

        //! This is for the webhook (NOT USED)
       
        // if (guildData.updateWebhook) {
        //     const webhook = await channel.fetchWebhooks();

        //     const webhook_ = webhook.find(webhook => webhook.id === guildData.updateWebhook);

        //     if (webhook_) {
        //         await webhook_.delete();
        //     }
        // }

        
        // const webhook = await channel.createWebhook('Goddess Anime', {
        //     avatar: `https://cdn.discordapp.com/avatars/${interaction.client.user!.id}/${interaction.client.user!.avatar}.png?size=256`,
        //     reason: `A webhook for the update channel of ${interaction.guild!.name}`,
        // });

        // guildData.updateWebhook = webhook.id;
        // // @ts-ignore
        // guildData.updateWebhookToken = webhook.token;
        // @ts-ignore
        await guildData.save();

        console.log(guildData);

        const embed = new MessageEmbed()
            .setTitle('Success!')
            .setDescription(`The update channel has been set to ${channel}`)
            .setColor('GREEN')
            .setTimestamp();

        return interaction.reply({ embeds: [embed] });
    }
} as Command;
