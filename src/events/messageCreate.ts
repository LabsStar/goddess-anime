import { Client, MessageEmbed, MessageActionRow, MessageButton, Message, Channel, TextChannel, Guild } from "discord.js";
import CustomClient from "../interfaces/CustomClient";
import config from "../config";
import axios from "axios";
import guild from "../models/guild";
import user from "../models/user";
import logger from "../utils/logger";

const { DEVELOPER_PREFIX, COMMUNITY_UPDATES_CHANNEL, BOT_ID, COINS } = config;

const supportServer = process.env.SUPPORT_SERVER;
const staffRole = process.env.STAFF_ROLE;

const generateCoins = async (u: string) => {
  console.log(`Generating coins for user: ${u}`);

  // Step 1: Retrieve the user document from the database
  const userDoc = await user.findOne({ discordId: u });

  // If the user document doesn't exist, return
  if (!userDoc) {
    logger.warn('User document not found.');
    return;
  }

  // Assign the user's bank value to user_bank
  let user_bank = userDoc.bank;

  // Assign the verification status to isVerified
  const isVerified = userDoc.verified;

  // Set coinsToAdd to 0
  let coinsToAdd = 0;

  // Step 2: Generate random coins based on verification status
  if (isVerified) {
    coinsToAdd = Math.floor(Math.random() * COINS.verified) + 1; // Random number between 1 and 100 (inclusive)
    console.log(`Generated ${coinsToAdd} coins for verified user.`);
  } else {
    coinsToAdd = Math.floor(Math.random() * COINS.unverified) + 1; // Random number between 1 and 40 (inclusive)
    console.log(`Generated ${coinsToAdd} coins for unverified user.`);
  }

  // Step 3: Add coinsToAdd to user_bank
  user_bank += coinsToAdd;

  // Step 4: Update the user's bank value in the user document to user_bank
  userDoc.bank = user_bank;

  // Step 5: Save the updated user document
  await userDoc.save();

  console.log(`Coins generated and saved for user: ${u}`);
};


module.exports = {
  name: "messageCreate",
  once: false,
  async execute(message: Message, client: CustomClient) {


    if (message.channel.type === "DM") {
      return;
    }


    if (message.content.startsWith(DEVELOPER_PREFIX)) {
      const server = client.guilds.cache.get(supportServer as string);
      const member = await server?.members.fetch(message.author.id);
      if (!member?.roles.cache.has(staffRole as string)) {
        return;
      }

      const args = message.content.slice(DEVELOPER_PREFIX.length).trim().split(/ +/);
      const commandName = args.shift()?.toLowerCase();

      if (!commandName) {
        return;
      }

      const command = client.messageCommands.get(commandName);

      if (!command) {
        return;
      }

      try {
        await command.execute(message, client, args);
      } catch (error) {
        console.error(error);
        message.reply("There was an error executing that command");
      }
    }

    // if (message.channel.id === COMMUNITY_UPDATES_CHANNEL) {
    //   const checkIfWebhook = message.webhookId;
    //   if (message.author.id != BOT_ID && !checkIfWebhook) {
    //     try {
    //       await message.delete();
    //     }
    //     catch (err) {
    //       console.log(`Error deleting message: ${err}`);
    //     }
    //   }

    //   const embed = message.embeds[0];
    //   const buttons = message.components[0].components;
    //   const attachments = message.attachments;

    //   const guilds = await guild.find({});

    //   for (const guildData of guilds) {
    //     const guild_ = client.guilds.cache.get(guildData.guildId);

    //     if (!guild_) continue;

    //     const channel = guild_.channels.cache.get(guildData.updateChannel as Channel["id"]);

    //     if (!channel || !(channel instanceof TextChannel)) continue;

    //     const getImages = async () => {
    //       const images = [];
    //       for (const attachment of attachments.values()) {
    //         const { data } = await axios.get(attachment.url, { responseType: "arraybuffer" });
    //         images.push({ name: attachment.name, data });
    //       }
    //       return images;
    //     };

    //     await channel.send({ embeds: [embed], components: [new MessageActionRow().addComponents(buttons)], files: await getImages() as any });
    //   }

    // }

    if (message.author.bot) return;

    await generateCoins(message.author.id);


  },
};
