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

module.exports = {
  name: "ready",
  once: true,
  async execute(client: Client) {
    const cardService = new CardService(client);
    const activity = new Activity(client);

    console.clear();
    logger.info(`Logged in as ${client.user?.tag}!`);

    mongoose.connect(process.env.MONGO_URI as string);

    const pres = [
      "/link - to link your account",
      "/help - get help information",
      "goddessanime.com",
    ]

    client.user?.setActivity("goddessanime.com", { type: "WATCHING" });

    setInterval(() => {
      const randomActivity = pres[Math.floor(Math.random() * pres.length)];
      client.user?.setActivity(randomActivity, { type: "WATCHING" });
    }, 5000)


    const db = mongoose.connection;

    db.on("error", console.error.bind(console, "connection error:"));

    db.once("open", () => {
      logger.info("Connected to MongoDB");
    });

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

  },
};
