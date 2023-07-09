import { Client } from "discord.js";
import mongoose from "mongoose";
import logger from '../utils/logger';
import webServer from "../web/webServer";
import CardService from "../services/card";
import Activity from "../services/activity";
import config from "../config";
import system from "../models/system";
import cron from "node-cron";
import { MessageEmbed, MessageActionRow, MessageButton } from "discord.js";
import shop from "../models/shop";
import cards from "../models/cards";
const verison = require("../../package.json").version;
import user from "../models/user";
import generateStats from "../utils/generateStats";
const wait = require("util").promisify(setTimeout);
import guild from "../models/guild";

module.exports = {
  name: "ready",
  once: true,
  async execute(client: Client) {
    const cardService = new CardService(client);
    const activity = new Activity(client);

    console.clear();
    console.log(`Logged in as ${client.user?.tag}!`);

    mongoose.connect(process.env.MONGO_URI as string);

    const pres = [
      "/link - to link your account",
      "/help - get help information",
      "goddessanime.com",
      `v${verison}`,
      "your heart",
      `${await cards.countDocuments() - 1}+ cards!`,
      `Open Sourced since ${config.openSourceDate}`,
      `${client.guilds.cache.size} servers!`,
      `${client.users.cache.size} users!`,
      `Made with ❤️ by hylia.dev & hyperstar.cloud`,
      `View our source code at: g.hylia.dev`
    ]


    client.user?.setActivity("goddessanime.com", { type: "WATCHING" });

    setInterval(() => {
      const randomActivity = pres[Math.floor(Math.random() * pres.length)];
      const randomType = Math.random() < 0.5 ? "WATCHING" : "PLAYING"; // 50% chance of watching, 50% chance of playing
      client.user?.setActivity(randomActivity, { type: randomType });
    }, 5000)


    const db = mongoose.connection;

    db.on("error", console.error.bind(console, "connection error:"));

    db.once("open", () => {
      console.log("Connected to MongoDB");
    });

    console.error("Test")
    console.warn("Test")

    webServer(client);


    cron.schedule("*/1 * * * *", async () => {
      const systemStatus = await system.findOne({});

      if (systemStatus?.isDown) {
        if (systemStatus.expectedDowntime.getTime() < Date.now()) {
          await system.updateOne({ isDown: false });

          const server = client.guilds.cache.get(process.env.SUPPORT_SERVER as string);

          if (!server) return;

          const pusher = server.members.cache.get(systemStatus.downtimePusher as string);

          const embed = new MessageEmbed()
            .setTitle("System Status")
            .setAuthor({ name: `${pusher?.user.tag}`, iconURL: pusher?.user.displayAvatarURL({ dynamic: true }), url: `https://users.goddessanime.com/${pusher?.user.id}` })
            .setDescription("The system is now back online!")
            .setColor("GREEN")
            .setTimestamp();

          const row = new MessageActionRow()
            .addComponents(
              new MessageButton()
                .setURL(`https://status.goddessanime.com/`)
                .setLabel("Status Page")
                .setEmoji("📊")
                .setStyle("LINK"),
            );

          const channel = await client.channels.fetch(config.COMMUNITY_UPDATES_CHANNEL);

          if (!channel?.isText()) return;


          try {
            await channel.send({ embeds: [embed], components: [row] });
          }
          catch (err) {
            console.log(err);
          }

        }
      }
    });

    await cardService.start();

    await cardService.subscribeToUpdates();


    cron.schedule("*/1 * * * *", async () => {
      const cards = await shop.find({});

      if (!cards) return;

      const expiredCards = cards.filter((card) => {
        return card.expires.getTime() < Date.now();
      });

      if (expiredCards.length > 0) {
        for (const card of expiredCards) {
          await shop.deleteOne({ _id: card._id });
        }
      } else {
        return;
      }
    });


    for (const guilds of client.guilds.cache.values()) {
      if (!guilds.available) continue;

      const guildData = await guild.findOne({ guildID: guilds.id });

      if (!guildData) {
        const newGuild = new guild({
          guildId: guilds.id,
          spawnChannel: null,
          currentCards: [],
          updateChannel: null,
        });

        await newGuild.save();
      }
    }
    


  },
};
