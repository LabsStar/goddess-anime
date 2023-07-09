import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction, MessageEmbed, MessageActionRow, MessageButton, MessageSelectMenu } from 'discord.js';
import Command from "../../../interfaces/Command";
import CustomClient from '../../../interfaces/CustomClient';
import user from '../../../models/user';
import BattleClient from '../../../services/BattleClient';

export const command: Command = {
  data: new SlashCommandBuilder()
    .setName('battle')
    .setDescription('Battle with another player')
    .addUserOption(option =>
        option.setName('user')
            .setDescription('The user to battle with')
            .setRequired(true)),
        hasToBeLinked: true,
  async execute(interaction: CommandInteraction) {
    const userAuthor = await user.findOne({ discordId: interaction.user.id });
    const userTarget = await user.findOne({ discordId: interaction.options.getUser('user')!.id });
    const battleClient = new BattleClient(interaction.client as CustomClient);

    if (!userAuthor) return interaction.reply({ content: 'You need to link your account first!', ephemeral: true });

    if (!userTarget) return interaction.reply({ content: 'The user you are trying to battle with has not linked their account yet!', ephemeral: true });

    if (interaction.user.id === interaction.options.getUser('user')!.id) return interaction.reply({ content: 'You cannot battle with yourself!', ephemeral: true });

    await battleClient.startBattle(interaction, interaction.user, interaction.options.getUser('user')!);
  }
} as Command;
