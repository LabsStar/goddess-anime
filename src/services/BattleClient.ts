import { Client, MessageEmbed, MessageActionRow, MessageButton, MessageAttachment, User } from "discord.js";
import cards from "../models/cards";
import user from "../models/user";
import BattleConfig from "../interfaces/BattleConfig";

const config: BattleConfig = {
    developerMode: false,
    debugMode: false,
    maxTurns: 10,
    maxRounds: 3,
    maxPlayers: 2,
    ownerID: "547923574833545226"
}

export default class BattleClient {
    client: Client;
    constructor(client: Client) {
        this.client = client;
    }

    async startBattle(interaction: any, user1: User, user2: User) {
        const soon_embed = new MessageEmbed()
            .setTitle(`Battle between ${user1.username} and ${user2.username}`)
            .setAuthor({
                name: `${interaction.client.users.cache.get(config.ownerID)?.username}`,
                iconURL: `${interaction.client.users.cache.get(config.ownerID)?.displayAvatarURL({ dynamic: true })}`,
                url: `https://goddessanime.com/user/${config.ownerID}`
            })
            .setURL("https://github.com/LabsStar/goddess-anime/blob/main/src/services/activity.ts")
            .setDescription("Sorry but the **battle** feature is not available yet!\n\nIf you want to help us develop this feature, please view our `src/services/BattleClient.ts` file on our GitHub repository. Thank you!\n\n[GitHub Repository](https://github.com/LabsStar/goddess-anime/blob/main/src/services/BattleClient.ts)")
            .setColor("RED")
            .setImage("https://contrib.rocks/image?repo=LabsStar/goddess-anime");

        return interaction.reply({ embeds: [soon_embed], ephemeral: true });
    }
}