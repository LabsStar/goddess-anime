import { Client, MessageEmbed, MessageActionRow, MessageButton, Message, Channel, TextChannel, Guild } from "discord.js";
import CustomClient from "../interfaces/CustomClient";
import config from "../config";
import axios from "axios";
import guild from "../models/guild";
import user from "../models/user";


const { DEVELOPER_PREFIX, COMMUNITY_UPDATES_CHANNEL, BOT_ID, COINS } = config;

const supportServer = process.env.SUPPORT_SERVER;
const staffRole = process.env.STAFF_ROLE;

const generateCoins = async (u: string): Promise<boolean> => {
  console.log(`Generating coins for user: ${u}`);

  // Step 1: Retrieve the user document from the database
  const userDoc = await user.findOne({ discordId: u });

  // If the user document doesn't exist, return false
  if (!userDoc) {
    console.warn('User document not found.');
    return false;
  }

  // Assign the user's bank value to user_bank
  let user_bank = userDoc.bank;

  // Assign the verification status to isVerified
  const isVerified = userDoc.verified;

  // Set coinsToAdd to 0
  let coinsToAdd = 0;

  // Step 2: Generate random coins based on verification status
  if (isVerified) {
    const verifiedMultiplier = Math.random() < 0.02 ? 5 : 1; // 2% chance to get 5 times more coins
    coinsToAdd = Math.floor(Math.random() * 5) + 1; // Random number between 1 and 5 (inclusive)
    coinsToAdd *= verifiedMultiplier;
    console.log(`Generated ${coinsToAdd} coins for verified user.`);
  } else {
    const unverifiedMultiplier = Math.random() < 0.01 ? 10 : 1; // 1% chance to get 10 times more coins
    coinsToAdd = Math.floor(Math.random() * 3) + 1; // Random number between 1 and 3 (inclusive)
    coinsToAdd *= unverifiedMultiplier;
    console.log(`Generated ${coinsToAdd} coins for unverified user.`);
  }

  // Step 3: Add coinsToAdd to user_bank
  if (!user_bank) user_bank = 0; // If user_bank is null, set it to 0 (this should never happen though)
  user_bank += coinsToAdd;

  // Step 4: Update the user's bank value in the user document to user_bank
  userDoc.bank = user_bank;

  // Step 5: Save the updated user document
  await userDoc.save();

  console.log(`Coins generated and saved for user: ${u}`);

  return true;
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

    if (message.author.bot) return;

    const checkMsg = () => {
      // Check if the message is empty, emojis, or a link
      if (message.content === "" || message.content === null || message.content === undefined) return false;
      if (message.content.match(/<a?:.+?:\d+>/g)) return false;
      if (message.content.match(/https?:\/\/\S+/g)) return false;
      return true;
    };

    if (checkMsg()) await generateCoins(message.author.id);

  },
};
