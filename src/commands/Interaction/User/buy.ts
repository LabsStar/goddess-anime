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
        .setName('buy')
        .setDescription('Buy a card')
        .addStringOption(option =>
            option
            .setName('card')
            .setDescription('Your card id (personal id)')
            .setRequired(true)
        ),
        hasToBeLinked: true,
    async execute(interaction: CommandInteraction) {

        const { channel, guild, client } = interaction;

        const activity = new Activity(client);


        const userDoc = await user.findOne({ discordId: interaction.user.id });

        if (!userDoc) throw new Error("User not found");

        const cardId = interaction.options.getString('card');


        

        const shopDoc = await shop.findOne({ id: cardId });

        if (!shopDoc) return interaction.reply({ content: `Sorry, but the card \`${cardId}\` is not on the shop!`, ephemeral: true });

        const cardDoc = await cards.findOne({ _id: shopDoc.card });

        if (!cardDoc) throw new Error("Card not found");

        // @ts-ignore
        if (userDoc.wallet < shopDoc.price) return interaction.reply({ content: `Sorry, but you don't have enough coins in your wallet to buy this card!`, ephemeral: true });

        // Add the card to the user's cards
        userDoc.cards.push({
            id: cardDoc._id,
            personal_id: shopDoc.personal_id,
        });

        // Remove the card from the shop
        await shopDoc.deleteOne();

        // Remove the price from the user's wallet
        // @ts-ignore
        userDoc.wallet -= shopDoc.price;

        // Save the user's document

        await userDoc.save();

        // Send the embed
        const embed = new MessageEmbed()
            .setTitle(`You bought ${cardDoc.name}!`)
            .setDescription(`You bought the card \`${cardDoc.name}\` for \`${formatPrice(shopDoc.price as number)}\`!`)
            .setColor('GREEN')
            .setImage(cardDoc.image as string)
            .setFooter({ text: `You now have ${formatPrice(userDoc.wallet)} coins in your wallet!` });

            await activity.setActivity(
                interaction.user.id,
                `Card Bought`, 
                cardDoc.image as string,
                `You bought the card ${cardDoc.name} for ${formatPrice(shopDoc.price as number)}!`,
                `https://goddessanime.com/card/${cardDoc._id}`,
                [{ label: 'View Card', cb: `https://goddessanime.com/card/${cardDoc._id}` }],
                new Date(Date.now()).toLocaleString(),
              );

        await interaction.reply({ embeds: [embed] });



    }
} as Command;