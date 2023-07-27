import { Message, MessageEmbed, MessageActionRow, MessageButton, MessageAttachment, Collection, User } from "discord.js";
import CustomClient from "../../../interfaces/CustomClient";
import MessageCommand from "../../../interfaces/MessageCommand";
import config from "../../../config";
import axios from "axios";
import guild from "../../../models/guild";

const { AUTOMATED_USERS } = config;

export const command: MessageCommand = {
    name: "set-beta",
    description: "Set a server to beta or set beta commands to a server",
    author: "547923574833545226",
    usage: "[-s]",
    category: "Misc",
    async execute(message: Message, client: CustomClient, args: string[]) {

        const SetBeta_Beta = args[0] === "-s";

        const guildDoc = await guild.findOne({ guildId: message.guild?.id });

        if (!guildDoc) return message.reply(":x: Guild not found");

        // If guildDoc.isBeta is true, then set it to false and vice versa
        switch (guildDoc.isBeta) {
            case true:
                guildDoc.isBeta = false;
                await guildDoc.save();
                message.reply("Set this server to not beta");
                break;
            case false:
                guildDoc.isBeta = true;
                await guildDoc.save();
                message.reply("Set this server to beta");
                break;
            default:
                message.reply(":x: Something went wrong");
                break;
        }

        const betaCommands = client.setBetaCommands(message.guild?.id as string, message);
        // If SetBeta_Beta is true, then set beta commands to the server
        const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

        await sleep(3000);
        if (SetBeta_Beta) await betaCommands;

    },
};

export default command;
