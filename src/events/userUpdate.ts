import { Client } from "discord.js";
import user from "../models/user";

module.exports = {
    name: "userUpdate",
    once: false,
    async execute(oldUser: any, newUser: any, client: Client) {

        const userDoc = await user.findOne({ discordId: oldUser.id });

        console.log(`User ${oldUser.id} updated`);

        if (!userDoc) return;

        if (oldUser.username !== newUser.username) {
            userDoc.username = newUser.username;
            console.log(`User ${oldUser.id} updated username`);
        }

        if (oldUser.discriminator !== newUser.discriminator) {
            userDoc.discriminator = newUser.discriminator;
            console.log(`User ${oldUser.id} updated discriminator`);
        }

        if (oldUser.avatar !== newUser.avatar) {
            userDoc.avatar = `https://cdn.discordapp.com/avatars/${newUser.id}/${newUser.avatar}.${newUser.avatar?.startsWith('a_') ? 'gif' : 'png'}?size=1024`;
            console.log(`User ${oldUser.id} updated avatar`);
        }

        await userDoc.save();

    },
};
