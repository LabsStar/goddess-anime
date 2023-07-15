import { Message, MessageEmbed, MessageActionRow, MessageButton } from "discord.js";
import CustomClient from "../../../interfaces/CustomClient";
import MessageCommand from "../../../interfaces/MessageCommand";
import user from "../../../models/user";
import config from "../../../config";
import badges from "../../../models/badges";

function checkIfBsonId(id: string) {
    const bjsonRegex = /^[0-9a-fA-F]{24}$/;

    if (bjsonRegex.test(id)) return true;
    else return false;
}

export const command: MessageCommand = {
    name: "remove-badge",
    description: "Remove a badge from your profile",
    usage: "<user> <badge id>",
    author: "547923574833545226",
    category: "Badges",
    async execute(message: Message, client: CustomClient, args: string[]) {
        const userId = message.mentions.users.first()?.id || args[0];
        const badgeId = args[1];

        if (!userId) return message.reply("You need to mention a user or provide a user ID");
        if (!badgeId) return message.reply("You need to provide a badge ID");

        const userDoc = await user.findOne({ discordId: userId });

        if (!userDoc) return message.reply("That user doesn't have a profile");

        if (!checkIfBsonId(badgeId)) return message.reply("That's not a valid badge ID");

        const badgeDoc = await badges.findOne({ _id: badgeId });

        if (!badgeDoc) return message.reply("That badge doesn't exist");


        if (!userDoc.badges.includes(badgeId)) return message.reply("That user doesn't have that badge");

        userDoc.badges = userDoc.badges.filter(badge => badge !== badgeId);
        await userDoc.save();

        const embed = new MessageEmbed()
            .setTitle("Badge Removed")
            .setDescription(`Removed the \`${badgeDoc.name}\` badge from ${userDoc.username}`)
            .setThumbnail(badgeDoc.image || "")
            .setColor("RED")
            .setTimestamp();

        const userEmbed = new MessageEmbed()
            .setTitle("Badge Removed")
            .setDescription(`The \`${badgeDoc.name}\` badge has been removed from your profile`)
            .setAuthor({ name: message.author.username, iconURL: message.author.displayAvatarURL(), url: `https://users.goddessanime.com/${message.author.id}` })
            .setThumbnail(badgeDoc.image || "")
            .setColor("RED")
            .setTimestamp();

        try {
            await client.users.cache.get(userId)?.send({ embeds: [userEmbed] });
        } catch (error) {
            console.log(`There was an error sending a DM to ${client.users.cache.get(userId)?.username}`);
            embed.addFields({ name: "Error", value: `There was an error sending a DM to ${client.users.cache.get(userId)?.username}. However, the badge was still added to their profile` });
        }

        return message.reply({ embeds: [embed] });
    }
    
}

export default command;
