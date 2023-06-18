import { Client, MessageEmbed, MessageActionRow, MessageButton, Guild, GuildChannel, TextChannel } from "discord.js";
import CustomClient from "../interfaces/CustomClient";
import guild from "../models/guild";
import config from "../config";
import logger from "../utils/logger";

module.exports = {
  name: "guildDelete",
  once: false,
  async execute(guilddeleted: Guild, client: CustomClient) {

    const guildDoc = await guild.findOne({ guildId: guilddeleted.id });

    if (!guildDoc) return;
    await guildDoc.delete();


    console.warn(`${client.user?.username} has left ${guilddeleted.name} :(`)



  },
};
