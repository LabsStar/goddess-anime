import { Client, MessageEmbed, MessageActionRow, MessageButton, Guild, GuildChannel, TextChannel } from "discord.js";
import CustomClient from "../interfaces/CustomClient";
import guild from "../models/guild";
import config from "../config";
import logger from "../utils/logger";

module.exports = {
  name: "guildCreate",
  once: false,
  async execute(guildcreated: Guild, client: CustomClient) {

    const guildDoc = await guild.findOne({ guildId: guildcreated.id });

    if (!guildDoc) {
        const newGuild = new guild({
            guildId: guildcreated.id,
            spawnChannel: null,
            currentCards: [],
            updateChannel: null,
        });

        await newGuild.save();
    }

    const embed = new MessageEmbed()
        .setTitle("Thanks for adding me!")
        .setDescription(`Thanks for adding me to your server! My prefix is \`${config.prefix}\` and you can use </${config.help.name}:${config.help.id}> to get started!`)
        .setColor("GREEN")
        .addFields(
            { name: "Link Your Account", value: `</${config.link.name}:${config.link.id}> ` },
            { name: "View Source Code", value: "[GitHub](https://github.com/LabsStar/goddess-anime)" },
            { name: "Support Server", value: "[Discord](https://discord.gg/u9cudxBVTG)" },
        )
        .setFooter({
            text: "Made with ❤️ by Hylia and the Goddess Anime Open Source Team",
            iconURL: `https://cdn.discordapp.com/avatars/${config.BOT_ID}/${client.user?.avatar}.png?size=256`,
        });
        
    const row = new MessageActionRow()
        .addComponents(
            new MessageButton()
                .setLabel("Invite Me")
                .setStyle("LINK")
                .setURL(`https://discord.com/oauth2/authorize?client_id=${config.BOT_ID}&permissions=8&scope=bot%20applications.commands`),
            new MessageButton()
                .setLabel("Support Server")
                .setStyle("LINK")
                .setURL("https://discord.gg/u9cudxBVTG"),
        );

    const channel = await guildcreated.channels.fetch(guildcreated.systemChannelId as string);

    // Check if the channel exists and if the bot has permission to send messages in the channel
    if (channel && channel.type === "GUILD_TEXT" && channel.permissionsFor(guildcreated.client.user!)?.has("SEND_MESSAGES")) {
        channel.send({ embeds: [embed], components: [row] });
    } else {
        
        const guildChannels = guildcreated.channels.cache.filter((channel) => channel.type === "GUILD_TEXT");

        if (guildChannels.size > 0) {
            const firstChannel = guildChannels.first() as TextChannel;
            firstChannel.send({ embeds: [embed], components: [row] });
        }
        else {
            logger.error(`No channels found in guild ${guildcreated.name} (${guildcreated.id})`);
        }
        
    }



  },
};
