import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction, MessageEmbed, MessageActionRow, MessageButton } from 'discord.js';
import Command from "../../../interfaces/Command";
import CustomClient from '../../../interfaces/CustomClient';
import user from '../../../models/user';
import axios from 'axios';
const wait = require('util').promisify(setTimeout);

export const command: Command = {
  data: new SlashCommandBuilder()
    .setName('guides')
    .setDescription('View all the guides available on the website.'),
    hasToBeLinked: true,
  async execute(interaction: CommandInteraction) {

    await interaction.deferReply({ ephemeral: false });


    const API_URL = () => {
        if (process.env.NODE_ENV === "development") return "http://localhost/api/guides";
        else if (process.env.NODE_ENV === "production" || process.env.NODE_ENV === null) return "https://goddessanime.com/api/guides";
    };

    const URL = () => {
        if (process.env.NODE_ENV === "development") return "http://localhost";
        else if (process.env.NODE_ENV === "production" || process.env.NODE_ENV === null) return "https://goddessanime.com";
    };

    const options = {
        url: API_URL(),
        method: "GET",
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json;charset=UTF-8"
        }
    };

    const { data } = await axios(options);

    const embed = new MessageEmbed()
        .setTitle(`Guide${data.length > 1 ? "s" : ""} ${data.length > 0 ? `(${data.length})` : ""} available`)
        .setDescription(`Here are all the guides available on the website.\n\n[View all guides](https://goddessanime.com/guide)`)
        .setColor("RANDOM")
        .setFooter({
            text: `Requested by ${interaction.user.username}`,
            iconURL: `${interaction.user.displayAvatarURL({ dynamic: true })}`
        })

    const row = new MessageActionRow()
        .addComponents(
            new MessageButton()
                .setLabel("View all guides")
                .setStyle("LINK")
                .setURL("https://goddessanime.com/guide")
        )


        for (let i = 0; i < data.length; i++) {
            const guide = data[i];

            embed.addFields({
                name: `${guide.title}`,
                value: `${URL()}/guide/${guide.id}`,
                inline: true
            })
        }

    await interaction.editReply({ embeds: [embed], components: [row] });



  }
} as Command;

