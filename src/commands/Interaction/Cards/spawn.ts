import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction, MessageEmbed, TextChannel } from 'discord.js';
import Command from "../../../interfaces/Command";
import user from '../../../models/user';
import guild from '../../../models/guild';
import cards from '../../../models/cards';
import Activity from '../../../services/activity';
import config from '../../../config';

import { generateCardId } from '../../../utils/generate';

const createCaptcha = (length: number) => {
    let result = "";
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    const charactersLength = characters.length;

    for (let i = 0; i < length; i++) result += characters.charAt(Math.floor(Math.random() * charactersLength));

    return result;
};


export const command: Command = {
    data: new SlashCommandBuilder()
        .setName('spawn')
        .setDescription('Spawn a card'),
    hasToBeLinked: true,
    async execute(interaction: CommandInteraction) {

        const cardId = generateCardId();
        const captcha = createCaptcha(6);

        const guildDoc = await guild.findOne({ guildId: interaction?.guild?.id });

        if (!guildDoc) return interaction.reply({ content: "This guild is not linked to a channel!", ephemeral: true });

        const randomcard = await cards.aggregate([{ $sample: { size: 1 } }]);
        const card = randomcard[0];

        const embed = new MessageEmbed()
            .setTitle(`New Card Spawned!`)
            .setDescription(`<@${interaction.user.id}> has spawned a card for the community to catch!\n${card.name} has spawned!\nUse </${config.catch.name}:${config.catch.id}> \`${captcha}\` to catch it!`)
            .setImage(card.image)
            .setColor("RANDOM");

        interaction.reply({ embeds: [embed] });

        console.log(`Spawned card ${card.name} in ${interaction?.guild?.name} (${interaction?.guild?.id}) [COMMAND]`);

        guild.findOne({ guildId: interaction?.guild?.id }).then((doc) => {
            if (!doc) return;

            doc.currentCards.push({
                id: card._id,
                captcha: captcha,
                time_until_despawn: config.TIME_TO_DELETE,
                time_spawned: Date.now(),
                //@ts-ignore
                refrence_id: interaction.channel.id,
            });

            doc.save();

            console.log(`Added card ${card.name} to ${interaction?.guild?.name} (${interaction?.guild?.id}) [COMMAND]`);
        });
    }
} as Command;