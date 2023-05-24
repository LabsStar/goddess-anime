import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction, MessageEmbed, MessageActionRow, MessageButton } from 'discord.js';
import Command from "../../../interfaces/Command";
import user from '../../../models/user';
import badges from '../../../models/badges';

export const command: Command = {
    data: new SlashCommandBuilder()
        .setName('profile')
        .setDescription('Get the profile of a user')
        .addUserOption(option => option.setName('user').setDescription('The user to get the profile of').setRequired(false)),
        hasToBeLinked: false,
    async execute(interaction: CommandInteraction) {

        const userDoc = await user.findOne({ discordId: interaction.options.getUser('user')?.id || interaction.user.id });

        if (!userDoc) return interaction.reply({ content: `${interaction.options.getUser('user')?.username || interaction.user.username} does not have an account linked to this bot`, ephemeral: true });

        async function getBadges() {
            const badgesArray = [];

            if (!userDoc) return;

            for (const badge of userDoc?.badges) {
                const badgeDoc = await badges.findOne({ _id: badge });
                badgesArray.push(badgeDoc);
            }

            return badgesArray;
        }

        const userBadges = async () => {
            const resolvedBadges = await getBadges(); // Wait for the promise to resolve

            if (!resolvedBadges) return;

            return resolvedBadges.map((badge: any) => {
                return `<:${badge.name.toLowerCase()}:${badge.emoji}>`;
            });
        };

        function convertTimeToRaw(time: any) {
            return Math.floor(Date.parse(time) / 1000);
        }

        const embed = new MessageEmbed()
            .setTitle(`${userDoc.username}'s Profile (${userDoc.pronouns})`)
            .setURL(`https://user.goddessanime.com/${userDoc.discordId}`)
            .setThumbnail(`https://cdn.discordapp.com/avatars/${userDoc.discordId}/${userDoc.avatar}.${userDoc.avatar?.startsWith('a_') ? 'gif' : 'png'}?size=1024`)
            .setColor('GREEN')
            .setImage(userDoc.banner)
            .setTimestamp()
            .addFields(
                { name: 'Balance', value: `$${userDoc.wallet}`, inline: true },
                { name: 'Bank', value: `$${userDoc.bank}`, inline: true },
                { name: 'Badges', value: `${await userBadges().then((badges) => badges?.join(' ')) || 'None'}`, inline: true },
                //@ts-ignore (Ignores the error because createdAt is a Date object)
                { name: "Account Created", value: `<t:${convertTimeToRaw(userDoc.createdAt)}:R>`, inline: true },
                //@ts-ignore (Ignores the error because updatedAt is a Date object)
                { name: "Account Updated", value: `<t:${convertTimeToRaw(userDoc.updatedAt)}:R>`, inline: true },
            );

        const row = new MessageActionRow()
            .addComponents(
                new MessageButton()
                    .setLabel('View Profile')
                    .setStyle('LINK')
                    .setEmoji('👤')
                    .setURL(`https://user.goddessanime.com/${userDoc.discordId}`),
                new MessageButton()
                    .setLabel('View Cards')
                    .setStyle('LINK')
                    .setEmoji('🃏')
                    .setURL(`https://user.goddessanime.com/${userDoc.discordId}/cards`),
            );

        return await interaction.reply({ embeds: [embed], components: [row] });




    }
} as Command;
