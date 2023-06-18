import user from "../models/user";
import { Client, MessageEmbed, MessageActionRow, MessageButton } from "discord.js";
import logger from "../utils/logger";
import { Document } from "mongoose";
import cron from "node-cron";

// Going to fix this in a later update... Might just switch it out for UUID.

const generateActivityId = (length: number) => {
    let result = "";
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    const charactersLength = characters.length;

    for (let i = 0; i < length; i++) result += characters.charAt(Math.floor(Math.random() * charactersLength));

    return result;
};


class Activity {
    client: Client;

    constructor(client: Client) {
        this.client = client;
    }

    async setActivity(userid: string, title: string, image: string, description: string, url: string, buttons: { label: string; cb: string }[], time: string) {
        user.findOne({ discordId: userid }).then(async (userDoc: Document<any, any, any> | null) => {
            if (!userDoc) throw new Error("User not found");

            userDoc.set("activity", {
                id: generateActivityId(6),
                title: title,
                image: image,
                description: description,
                url: url,
                buttons: buttons,
                time: time,
                timestamp: Date.now()
            });

            await userDoc.save();

            console.log(`Activity set for ${this.client.users.cache.get(userid)?.tag}!`);

            const embed = new MessageEmbed()
                .setTitle(title)
                .setDescription(description)
                .setImage(image)
                .setURL(url)
                .setTimestamp()
                .setColor("RANDOM");

            const row = new MessageActionRow();

            for (const button of buttons) {
                row.addComponents(
                    new MessageButton()
                        .setLabel(button.label)
                        .setURL(button.cb)
                        .setStyle("LINK")
                )
            }

            try {
                await this.client.users.cache.get(userid)?.send({ embeds: [embed], components: [row] });
            }
            catch (err) {
                logger.error(`Failed to send activity to ${this.client.users.cache.get(userid)?.tag}!`);
            }

        });
    }

    async getActivities(userid: string, onlyIds: boolean) {
    return await user.findOne({ discordId: userid }).then((userDoc: Document<any, any, any> | null) => {
        if (!userDoc) throw new Error("User not found");

        if (onlyIds) return userDoc.get("activity").map((activity: any) => activity.id);

        return userDoc.get("activity");
    });
}

    async getActivity(userid: string, activityid: string) {
    return await user.findOne({ discordId: userid }).then((userDoc: Document<any, any, any> | null) => {
        if (!userDoc) throw new Error("User not found");

        return userDoc.get("activity").find((activity: any) => activity.id === activityid);
    });
}

}

export default Activity;
