import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction, MessageEmbed, MessageActionRow, MessageButton } from 'discord.js';
import Command from "../../../interfaces/Command";
import user from '../../../models/user';
import cards from '../../../models/cards';

export const command: Command = {
    data: new SlashCommandBuilder()
        .setName('transfer')
        .setDescription('Transfer money to your wallet -> bank or bank -> wallet')
        .addStringOption(option =>
            option
            .setName('from')
            .setDescription('Where to transfer from')
            .setRequired(true)
            .addChoices(
                { name: "Wallet", value: "wallet" },
                { name: "Bank", value: "bank" }
            )
        )
        .addNumberOption(option =>
            option
            .setName('amount')
            .setDescription('Amount to transfer')
            .setRequired(true)
        ),
        hasToBeLinked: true,
    async execute(interaction: CommandInteraction) {

        const { channel, guild, client } = interaction;


        const userDoc = await user.findOne({ discordId: interaction.user.id });

        if (!userDoc) return interaction.reply({ content: "You don't have an account yet! Please run `/link` to create one.", ephemeral: true });

        const from = interaction.options.getString('from', true);
        const amount = interaction.options.getNumber('amount', true);

        switch (from) {
            case 'wallet':
                if (userDoc.wallet < amount) return interaction.reply({ content: "You don't have enough money in your wallet!", ephemeral: true });
                userDoc.wallet -= amount;
                userDoc.bank += amount;
                break;
            case 'bank':
                if (userDoc.bank < amount) return interaction.reply({ content: "You don't have enough money in your bank!", ephemeral: true });
                userDoc.wallet += amount;
                userDoc.bank -= amount;
                break;
            default:
                return interaction.reply({ content: "Invalid option!", ephemeral: true });
        }

        await userDoc.save();

        const embed = new MessageEmbed()
            .setTitle(`Transfer`)
            .setDescription(`You have successfully transferred ${amount} ${amount === 1 ? 'coin' : 'coins'} from your ${from} to your ${from === 'wallet' ? 'bank' : 'wallet'}.`)

        await interaction.reply({ embeds: [embed] });


    }
} as Command;