import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction, MessageEmbed } from 'discord.js';
import Command from "../../../interfaces/Command";
import CustomClient from '../../../interfaces/CustomClient';

export const command: Command = {
  data: new SlashCommandBuilder()
    .setName('help')
    .setDescription('List all of my commands or info about a specific command')
    .addStringOption(option =>
      option.setName('command')
        .setDescription('The command to get info on')
        .setRequired(false)),
        hasToBeLinked: false,
  async execute(interaction: CommandInteraction) {
   
    const { commands } = interaction.client as CustomClient;

    const command = commands.get(interaction.options.getString('command')!) || commands.find(cmd => cmd.data.name === interaction.options.getString('command')!);

    if (!command) {
      const embed = new MessageEmbed()
        .setTitle('-=-=-=-=-= Help =-=-=-=-=-')
        .setDescription(`Here's a list of all my commands:`)
        .setColor('BLUE')
        .setTimestamp();

      commands.forEach(command => {
        embed.addFields({ name: `**/${command.data.name}**`, value: command.data.description });
      });

      return interaction.reply({ embeds: [embed] });
    }

    const embed = new MessageEmbed()
      .setTitle(`Help - ${command.data.name}`)
      .setDescription(command.data.description)
      .setColor('BLUE')
      .setTimestamp();

    if (command.data.options) {
      command.data.options.forEach(option => {
        const o = option.toJSON();
        embed.addFields({ name: `**${o.name}**`, value: o.description });
      });
    }

    return interaction.reply({ embeds: [embed] });
  }
} as Command;
