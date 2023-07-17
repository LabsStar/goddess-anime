import { Client, MessageEmbed, MessageActionRow, MessageButton, Guild, GuildChannel, TextChannel } from "discord.js";
import CustomClient from "../interfaces/CustomClient";
import guild from "../models/guild";
import config from "../config";


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
        .setDescription(`Thanks for adding me to your server! My prefix is \`${config.prefix}\` and you can use \`${config.prefix}help\` to see all my commands!`)
        .setColor("GREEN")
        .setFooter({
            text: "Made with ❤️ by Hylia and the Goddess Anime Open Source Team",
            iconURL: `https://cdn.discordapp.com/avatars/${config.BOT_ID}/${client.user?.avatar}.png?size=256`,
        });
        
    const row = new MessageActionRow()
        .addComponents(
            new MessageButton()
                .setLabel("Invite Me")
                .setStyle("LINK")
                .setEmoji("🔗")
                .setURL(`https://discord.com/oauth2/authorize?client_id=${config.BOT_ID}&permissions=8&scope=bot%20applications.commands`),
            new MessageButton()
                .setLabel("Features")
                .setEmoji("🔥")
                .setStyle("LINK")
                .setURL("https://g-features.hylia.dev"),
            new MessageButton()
                .setLabel("Source Code")
                .setEmoji("📁")
                .setStyle("LINK")
                .setURL("https://github.com/LabsStar/goddess-anime"),
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
            console.error(`No channels found in guild ${guildcreated.name} (${guildcreated.id})`);
        }
        
    }



  },
};
