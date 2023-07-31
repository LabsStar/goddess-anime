import { Message, MessageEmbed, MessageActionRow, MessageButton, MessageAttachment, Collection, User } from "discord.js";
import CustomClient from "../../../interfaces/CustomClient";
import MessageCommand from "../../../interfaces/MessageCommand";
import config from "../../../config";
import axios from "axios";
import user from "../../../models/user";

const { AUTOMATED_USERS } = config;

export const command: MessageCommand = {
    name: "dm",
    description: "Dm a User",
    author: "547923574833545226",
    usage: "<user> <message>",
    example: "@Goddess#0001 YOU SHALL NOT PASS!",
    category: "User",
    async execute(message: Message, client: CustomClient, args: string[]) {

        if (args.length < 2) return message.reply("Please enter a user and a message `<user>` `<message>`");
        const member = message.mentions.users.first()?.id || args[0];
        const users = message.client.users.cache;
        const randomUser = users.random();
        const messageContent = args[1].split(' ')[0];


        if (!member) return message.reply(`:x: Please give a vaild user like: \`@${randomUser?.username}\` or you can do: \`${randomUser?.id}\``);
        if (!messageContent) return message.reply(`:x: Please give a vaild message like: \`YOU SHALL NOT PASS!\``);

        const checkIfAutomated = () => {
            if (AUTOMATED_USERS.includes(message.author.id)) {
                return {
                    name: "Automated System",
                    iconURL: message.client.user?.avatarURL() || undefined,
                    url: `https://users.goddessanime.com/${message.client.user?.id}`,
                };
            } else {
                return {
                    name: message.author.username,
                    iconURL: message.author.displayAvatarURL({ dynamic: true }) || undefined,
                    url: `https://users.goddessanime.com/${message.author.id}`,
                };
            }
        };

        const embed = new MessageEmbed()
            .setColor("AQUA")
            .setTitle(`New Message`)
            .setAuthor(checkIfAutomated())
            .setDescription(messageContent)
            .setFooter({
                text: `Sent from ${message.guild?.name}`
            })
            .setTimestamp();

        try {
            const u = await message.client.users.fetch(member);

            if (!u) return message.reply(":x: User not found");

            u.send({ embeds: [embed] });

            message.reply(`Sent ${u.username}#${u.discriminator} the message!`);
        }
        catch (e) {
            const errorEmbed = new MessageEmbed()
                .setTitle(`Error sending message to user`)
                .setDescription(`An error occurred while sending the message to the user: ${e}`);

            message.reply({ embeds: [errorEmbed] });
        }








    },
};

export default command;
