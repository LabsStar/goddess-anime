import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction, MessageEmbed, MessageActionRow, MessageButton } from 'discord.js';
import Command from "../../../interfaces/Command";
import user from '../../../models/user';
import cards from '../../../models/cards';
import { ObjectId } from 'mongodb';
const wait = require('util').promisify(setTimeout);
import generateStats from '../../../utils/generateStats';
import { getWaifu } from '../../../utils/Waifu';

import { generateCardId, formatNumber } from '../../../utils/generate';


const getCurrentDate = () => {
    const date = new Date();

    return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
}



const g = async () => {
    const randomList = [
        "card",
        "coins",
    ];

    const random = Math.floor(Math.random() * randomList.length);

    switch (randomList[random]) {
        case "card":
            const card = await cards.aggregate([{ $sample: { size: 1 } }]);
            const cardData = card[0];

            const embed = new MessageEmbed()
                .setTitle(`Daily Rewards for ${getCurrentDate()}`)
                .setDescription(`You have received a ${cardData.rarity.toUpperCase()} ${cardData.name} card!`)
                .setColor("PURPLE")
                .setTimestamp()
                .setImage(cardData.image as string);

            return {
                type: "card",
                card: {
                    id: cardData._id,
                    personal_id: generateCardId(),
                },
                embed,
            }
        case "coins":
            const coins = Math.floor(Math.random() * 1000);

            const embed2 = new MessageEmbed()
                .setTitle(`Daily Rewards for ${getCurrentDate()}`)
                .setDescription(`You have received ${formatNumber(coins)} coins!`)
                .setImage(await getWaifu("happy") as string)
                .setColor("PURPLE")
                .setTimestamp();

            return {
                type: "coins",
                coins,
                embed: embed2,
            }
    }
}



export const command: Command = {
    data: new SlashCommandBuilder()
        .setName('daily')
        .setDescription('Check your daily rewards'),
    hasToBeLinked: true,
    async execute(interaction: CommandInteraction) {
        await interaction.deferReply();
        const userDB = await user.findOne({ discordId: interaction.user.id });

        if (!userDB) return interaction.editReply({ content: 'You need to link your account first!' });

        if (!userDB.dailyRewards) {
            userDB.dailyRewards = {
                lastClaimed: new Date(),
            };

            await userDB.save();
        }
        
       await wait(1000);

        const lastClaimed = new Date(userDB.dailyRewards.lastClaimed);

        const nextClaim = new Date(lastClaimed.getTime() + 86400000);

        if (nextClaim > new Date()) {
            const timeLeft = nextClaim.getTime() - new Date().getTime();

            const hours = Math.floor(timeLeft / 3600000);
            const minutes = Math.floor((timeLeft % 3600000) / 60000);
            const seconds = Math.floor(((timeLeft % 360000) % 60000) / 1000);

            return interaction.editReply({ content: `You can claim your daily rewards in ${hours ? `${hours} hours, ` : ""}${minutes ? `${minutes} minutes, ` : ""}${seconds} seconds!` });
        }



        const reward = await g();

        if (!reward) return interaction.editReply({ content: 'Something went wrong!' });

        if (reward.type === "card") {
            userDB.cards.push({
                id: reward.card?.id,
                personal_id: reward.card?.personal_id,
                stats: generateStats(),
                level: 0
            });

            userDB.dailyRewards.lastClaimed = new Date();

            await userDB.save();
        }

        if (reward.type === "coins") {
            userDB.bank += reward.coins || 0;

            userDB.dailyRewards.lastClaimed = new Date();

            await userDB.save();
        }

        userDB.dailyRewards.lastClaimed = new Date();

        await userDB.save();

        try {
            await interaction.client.users.fetch(interaction.user.id).then(async (user) => {
                await user.send({ embeds: [reward.embed] });
            });

            await interaction.editReply({ content: 'Check your DMs!' });
        } catch (err) {
            const checkErrorMessage = (err as Error).message.toLowerCase();

            if (checkErrorMessage.includes("cannot send messages to this user")) {
                await interaction.editReply({ content: `I cannot send you DMs!` });
            } else {
                await interaction.editReply({ content: `Something went wrong!\n\n\`\`\`${(err as Error).message}\`\`\`` });
            }
        }

    }
} as Command;
