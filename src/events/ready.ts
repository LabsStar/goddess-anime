import { Client } from "discord.js";
import mongoose from "mongoose";
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
const wait = require("util").promisify(setTimeout);
import guild from "../models/guild";
import VersionManager from "../services/VersionManager";
const versionManager = new VersionManager(60000); // 1 minute 

module.exports = {
  name: "ready",
  once: true,
  async execute(client: Client) {
    const cardService = new CardService(client);

    console.clear();
    await versionManager.checkVersion(false);
    console.log(`Logged in as ${client.user?.tag}! | ${client.user?.id}`);

    mongoose.connect(process.env.MONGO_URI as string);

    const pres = [
      "/link - to link your account",
      "/help - get help information",
      "goddessanime.com",
      `v${verison}`,
      `${await cards.countDocuments() - 1}+ cards!`,
      `Open Sourced since ${config.openSourceDate}`,
      `with ${client.guilds.cache.size} servers!`,
      `with ${client.users.cache.size} users!`,
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

    webServer(client);

    await cardService.start();

    //? Not needed as of now ( 3.0.0-pre.2)
    // await cardService.subscribeToUpdates();


    cron.schedule("*/1 * * * *", async () => {
      const cards = await shop.find({});

      if (!cards) return;

      const expiredCards = cards.filter((card) => {
        //@ts-ignore
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


    cron.schedule("0 6 * * *", async () => {
      for (const guilds of await guild.find({})) {
        await wait(2000); //! SAFETY MEASURE
        guilds.currentCards = [];
        await wait(2000); //! SAFETY MEASURE
        await guilds.save(); 

        console.log(`Reset cards for ${client.guilds.cache.get(guilds.guildId as string)?.name}`);
      }
    });
  },
};
