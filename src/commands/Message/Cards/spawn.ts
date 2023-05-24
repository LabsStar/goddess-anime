import { Message, MessageEmbed, MessageActionRow, MessageButton } from "discord.js";
import CustomClient from "../../../interfaces/CustomClient";
import MessageCommand from "../../../interfaces/MessageCommand";
import CardService from "../../../services/card";

export const command: MessageCommand = {
    name: "spawn-card",
    description: "Force spawn a card in the current channel",
    async execute(message: Message, client: CustomClient, args: string[]) {
        const cardService = new CardService(client);
    
        await cardService.spawnCard_force(message.guild?.id as string, message.channel.id);

        return message.reply("Spawned a card in this channel");
    }
    
}

export default command;
