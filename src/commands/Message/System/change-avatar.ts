import { Message, MessageEmbed, MessageActionRow, MessageButton, MessageAttachment, Collection } from "discord.js";
import CustomClient from "../../../interfaces/CustomClient";
import MessageCommand from "../../../interfaces/MessageCommand";
import config from "../../../config";
import axios from "axios";

const { COMMUNITY_UPDATES_CHANNEL, IS_IN_DEV_MODE } = config;

function avatarWithoutPrefix(avatar: string): string {
    const prefixes = ["http://", "https://"]; // Add more prefixes if needed

    for (const prefix of prefixes) {
        if (avatar.startsWith(prefix)) {
            return avatar.slice(prefix.length);
        }
    }

    return avatar;
}

export const command: MessageCommand = {
    name: "change-avatar",
    description: "Change the avatar on the bot.",
    usage: "<avatar>",
    example: "https://example.com/image.png",
    author: "547923574833545226",
    category: "System",
    async execute(message: Message, client: CustomClient, args: string[]) {
        let avatar;
        const oldAvatar = message.client.user?.avatar;

        const attachmentSize = message.attachments.size;

        //@ts-ignore
        if (args.length === 0) {
            return message.reply(`Please provide an avatar.`);
        }

        avatar = args[0];


        const newava = avatarWithoutPrefix(avatar as string);

        if (!avatar?.startsWith("https://")) {
            return message.reply(
                `:x: You must provide a valid avatar. Please use \`https://${newava}/\` instead of \`${avatar}/\``
            );
        }

        const options = {
            avatarURL: avatar,
        };

        try {
            await client.user?.setAvatar(options.avatarURL);
            message.reply("Avatar changed successfully!");
        } catch (error) {
            console.error("Error changing avatar:", error);
            message.reply("An error occurred while changing the avatar.");
        }
    },
};

export default command;
