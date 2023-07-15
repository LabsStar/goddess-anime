import { Message, MessageEmbed, MessageActionRow, MessageButton, MessageAttachment, Collection, User } from "discord.js";
import CustomClient from "../../../interfaces/CustomClient";
import MessageCommand from "../../../interfaces/MessageCommand";
import config from "../../../config";
import axios from "axios";
import user from "../../../models/user";

export const command: MessageCommand = {
    name: "verify-user",
    description: "Verify a user",
    author: "547923574833545226",
    usage: "<user>",
    category: "User",
    async execute(message: Message, client: CustomClient, args: string[]) {
        const member = message.mentions.users.first()?.id || message.client.users.fetch(args[0]);
        const users = message.client.users.cache;
        const randomUser = users.random();


        if (!member) return message.reply(`:x: Please give a vaild user like: \`@${randomUser?.username}\` or you can do: \`${randomUser?.id}\``);

        const userDoc = await user.findOne({ discordId: member })

        if (!userDoc) return message.reply(`:x: <@!${member}> could not be found. \nReasons might be:\n :one:: User does not exist.\n :two:: User does not have a Discord Account.\n :three:: User was banned from the service.`)


        const isVerified = userDoc.verified;

        if (isVerified) {
            // If already verified, set verified to false
            await user.findOneAndUpdate({ discordId: member }, { verified: false });
            message.reply(`<@!${member}> has been marked as \`unverified.\``);
        } else {
            // If not verified, set verified to true
            await user.findOneAndUpdate({ discordId: member }, { verified: true });
            message.reply(`<@!${member}> has been marked as \`verified.\``);
        }

    },
};

export default command;
