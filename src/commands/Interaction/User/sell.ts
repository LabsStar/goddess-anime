import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction, MessageEmbed, MessageActionRow, MessageButton } from 'discord.js';
import Command from "../../../interfaces/Command";
import user from '../../../models/user';
import cards from '../../../models/cards';
import { Document, DocumentDefinition } from 'mongoose';
import shop from '../../../models/shop';
import Activity from '../../../services/activity';

const formatPrice = (price: number) => {
    if (price === 0) return "Free"; // If the price is 0, return "Free"

    return price.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,'); // https://stackoverflow.com/a/2901298
};

export const command: Command = {
    data: new SlashCommandBuilder()
        .setName('sell')
        .setDescription('Sell a card')
        .addStringOption(option =>
            option
                .setName('card')
                .setDescription('Your card id (personal id)')
                .setRequired(true)
        )
        .addNumberOption(option =>
            option
                .setName('amount')
                .setDescription('Amount to sell')
                .setRequired(true)
        ),
    hasToBeLinked: true,
    async execute(interaction: CommandInteraction) {

        const { channel, guild, client } = interaction;

        const activity = new Activity(client);

        const userDoc = await user.findOne({ discordId: interaction.user.id });

        if (!userDoc) throw new Error("User not found");

        const cardId = interaction.options.getString('card');
        const amount = interaction.options.getNumber('amount');

        const card = userDoc?.cards.find((card) => card.personal_id === cardId);

        if (!card) return interaction.reply({ content: "You don't have this card!", ephemeral: true });


        // @ts-ignore
        if (amount < 0) return interaction.reply({ content: "You can't have a negative amount!", ephemeral: true });


        const cardDoc = await cards.findOne({ _id: card.id });

        if (!cardDoc) throw new Error("Card not found");

        const shopDoc = await shop.findOne({ personal_id: card.personal_id });



        if (!shopDoc) {
            const newShopDoc = await shop.create({
                card: card.id,
                price: amount,
                seller: interaction.user.id,
            });

            await newShopDoc.save();

            // Remove card from user
            userDoc.cards = userDoc.cards.filter((card) => card.personal_id !== cardId);

            await userDoc.save();


            const embed = new MessageEmbed()
                .setTitle(`Card put on sale!`)
                .setDescription(`Your card has been put on sale for ${formatPrice(amount as number)} coins!`)
                .setColor("GREEN")
                .setImage(cardDoc.image as string)

            const row = new MessageActionRow()
                .addComponents(
                    new MessageButton()
                        // @ts-ignore
                        .setURL(`https://shop.goddessanime.com/${newShopDoc._id}`)
                        .setLabel('View card')
                        .setStyle('LINK'),
                );

            await activity.setActivity(
                interaction.user.id,
                `Card Sold`, cardDoc.image as string,
                `Your card has been sold for ${formatPrice(amount as number)} coins!`,
                `https://goddessanime.com/card/${cardDoc._id}`,
                [{ label: 'View Card', cb: `https://goddessanime.com/card/${cardDoc._id}` }, { label: 'View Shop', cb: `https://shop.goddessanime.com/${newShopDoc._id}` }],
                new Date(Date.now()).toLocaleString(),
            );

            return interaction.reply({ embeds: [embed], components: [row] });
        }
        else {
            const embed = new MessageEmbed()
                .setTitle(`Card already on sale!`)
                .setDescription(`Your card is already on sale!`)
                .setColor("RED")
                .setImage(cardDoc.image as string)

            const row = new MessageActionRow()
                .addComponents(
                    new MessageButton()
                        // @ts-ignore
                        .setURL(`https://shop.goddessanime.com/${newShopDoc._id}`)
                        .setLabel('View card')
                        .setStyle('LINK'),
                );

            return interaction.reply({ embeds: [embed], components: [row] });
        }



    }
} as Command;