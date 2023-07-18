import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction, MessageEmbed, MessageActionRow, MessageButton } from 'discord.js';
import Command from "../../../interfaces/Command";
import CustomClient from '../../../interfaces/CustomClient';
import user from '../../../models/user';

export const command: Command = {
  data: new SlashCommandBuilder()
    .setName('vote')
    .setDescription('Vote for the bot on top.gg!'),
    hasToBeLinked: true,
  async execute(interaction: CommandInteraction) {

    //return await interaction.reply({ content: "We are currently getting approved by:\n\nhttps://top.gg", ephemeral: true })
   
    const userDoc = await user.findOne({ discordId: interaction.user.id });

    if (!userDoc) return interaction.reply({ content: "You need to link your account first!", ephemeral: true });

    // Check if user has voted in the last 12 hours
    if (userDoc.lastVoted && userDoc.lastVoted > Date.now() - 43200000) {
        const embed = new MessageEmbed()
            .setTitle("Vote")
            .setDescription("Sorry, you can only vote once every 12 hours!")
            .setColor("RED")
            .setTimestamp();
    
        return interaction.reply({ embeds: [embed] });
    }

    const embed = new MessageEmbed()
        .setTitle("Vote")
        .setDescription("Your daily vote is available!")
        .setColor("GREEN")
        .setImage("https://cdn.top.gg/web-assets/social-preview.png")
        .setTimestamp();

    const row = new MessageActionRow()
        .addComponents(
            new MessageButton()
                .setLabel("Vote")
                .setStyle("LINK")
                .setURL(`https://top.gg/bot/${interaction.client.user?.id}/vote`)
        );

    interaction.reply({ embeds: [embed], components: [row] });
    

  }
} as Command;
