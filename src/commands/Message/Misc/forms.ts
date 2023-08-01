import { Message, MessageEmbed, MessageActionRow, MessageButton, MessageAttachment, Collection, User } from "discord.js";
import CustomClient from "../../../interfaces/CustomClient";
import MessageCommand from "../../../interfaces/MessageCommand";
import config from "../../../config";
import axios from "axios";
import beta from "../../../models/Forms/beta";


export const command: MessageCommand = {
    name: "forms",
    description: "List all forms",
    author: "547923574833545226",
    usage: "[-t <type>] [-c <formId>]",
    example: "-t beta -c 64c8200baa21e29c31a9c7b0",
    category: "Misc",
    async execute(message: Message, client: CustomClient, args: string[]) {
        if (args.length === 0) return await message.reply("Please provide a type and a case id. You can refer to the docs for more info\nhttps://docs.goddessanime.com/developers/commands/misc/forms");
        function getType() {
            if (args[0] !== "-t") return false;
            if (!args[1]) return false;
            return args[1];
        }

        function getCaseId() {
            if (args[2] !== "-c") return false;
            if (!args[3]) return false;
            return args[3];
        }


        const type = getType();
        const CaseId = getCaseId();

        if (!type) return await message.reply("Please provide a type. You can refer to the docs for more info\nhttps://docs.goddessanime.com/developers/commands/misc/forms#types");

        if (!CaseId) return await message.reply("Please provide a case id. You can refer to the docs for more info\nhttps://docs.goddessanime.com/developers/commands/misc/forms#case-id");

        switch (type) {
            case "beta": {
                try {
                    const form = await beta.findOne({ _id: CaseId });
                    if (!form) return await message.reply("Form not found");
                    const embed = new MessageEmbed()
                        .setTitle(`Beta form for ${message.client.guilds.cache.get(form.serverId)?.name}`)
                        .setDescription(`Form ID: ${form._id}\nServer ID: ${form.serverId}\nUser: ${message.client.users.cache.get(form.userId)?.tag} (${form.userId})\nReason: ${form.reason}`)
                        .setColor("RANDOM")
                        .setTimestamp();

                    return await message.reply({ embeds: [embed] });
                } catch (err) {
                    return await message.reply(`An error occured: ${err}`);
                }

                break;
            }
            default:
                return await message.reply("Please provide a valid type. You can refer to the docs for more info\nhttps://docs.goddessanime.com/developers/commands/misc/forms#types");
        }

    },
};

export default command;
