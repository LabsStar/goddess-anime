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

    // const userDoc = await user.findOne({ discordId: interaction.user.id });

    // if (!userDoc) if (command?.hasToBeLinked) return interaction.reply({ content: `You don't have an account yet! Please run </${config.link.name}:${config.link.id}> to create one.`, ephemeral: true });

    try {
      // const embed = new MessageEmbed()
      //   .setTitle(`Project Shutdown...`)
      //   .setURL("https://www.hyperstar.cloud/blog/the-end-of-goddess")
      //   .setDescription(`It is with a heavy heart that we announce the closure of our beloved project, Goddess Anime. After an incredible journey filled with excitement and innovation, we have reached a point where we must bid our final farewell. The decision to close the project has been made due to a significant drop in user engagement and interactions.\n\n[Blog Post](https://www.hyperstar.cloud/blog/the-end-of-goddess)`)
      //   .setColor("RED")
      //   .setImage("https://media.discordapp.net/attachments/1020761875979452457/1120253435758002176/image.png?width=484&height=363")
      //   .setTimestamp();
      // await interaction.reply({ embeds: [embed], ephemeral: true });
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
