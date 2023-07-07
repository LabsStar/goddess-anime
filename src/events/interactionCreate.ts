import {
  Client,
  MessageEmbed,
  MessageActionRow,
  MessageButton,
  Interaction,
  CommandInteraction,
} from "discord.js";
import CustomClient from "../interfaces/CustomClient";
import user from "../models/user";
import config from "../config";

module.exports = {
  name: "interactionCreate",
  once: false,
  async execute(interaction: CommandInteraction, client: CustomClient) {
    if (!interaction.isCommand()) return;
    const command = client.commands.get(interaction.commandName);

    const userDoc = await user.findOne({ discordId: interaction.user.id });

    if (!userDoc) if (command?.hasToBeLinked) return interaction.reply({ content: `You don't have an account yet! Please run </${config.link.name}:${config.link.id}> to create one.`, ephemeral: true });

    try {
      await command?.execute(interaction as CommandInteraction);
    } catch (error) {
      console.error(error);

      const errorEmbed = new MessageEmbed()
        .setTitle(`Command Error - ${interaction.commandName}`)
        .setDescription(`There was an error while executing this command!`)
        .setColor("RED")
        .setTimestamp();
      await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
    }
  },
};
