import { Message, MessageEmbed, MessageActionRow, MessageButton } from "discord.js";
import CustomClient from "../../../interfaces/CustomClient";
import MessageCommand from "../../../interfaces/MessageCommand";
import config from "../../../config";
import CommunityForums from "../../../models/CommunityForums";

let ACTIONS = ["delete", "lock", "unlock"]

export const command: MessageCommand = {
    name: "forum-moderate",
    description: "Moderate the forums",
    author: "547923574833545226",
    usage: "[forum id] (action) (reason)",
    example: "64b9d2f7a261cfd6b5b62864 warn spam",
    category: "Forums",
    async execute(message: Message, client: CustomClient, args: string[]) {

        const fourmId = args[0];
        const action = args[1];
        const reason = args.slice(2).join(" ");

        if (!fourmId) return message.reply("Please provide a forum ID");

        if (!action) return message.reply(`Please provide an action. Valid actions: \`${ACTIONS.join(", ")}\``);

        if (!reason) return message.reply("Please provide a reason");

        if (!ACTIONS.includes(action)) return message.reply(`Please provide a valid action. Valid actions: \`${ACTIONS.join(", ")}\``);

        const embed = new MessageEmbed()
            .setTitle("Forum Moderation")
            .setDescription(`Are you sure you want to ${action} this forum?`)
            .setColor("BLUE")
            .setTimestamp();

        const row = new MessageActionRow()
            .addComponents(
                new MessageButton()
                    .setCustomId("yes")
                    .setLabel("Yes")
                    .setStyle("SUCCESS"),
                new MessageButton()
                    .setCustomId("no")
                    .setLabel("No")
                    .setStyle("DANGER")
            );

        const msg = await message.reply({ embeds: [embed], components: [row] });

        const filter = (i: any) => i.user.id === message.author.id;

        const collector = msg.createMessageComponentCollector({ filter, time: 15000 });

        collector.on("collect", async (i) => {
            if (i.customId === "yes") {
                switch (action) {
                    case "delete":
                        try {
                            await CommunityForums.findOneAndDelete({ _id: fourmId });

                           i.reply({ embeds: [embed.setDescription(`Forum ${action}d`)], components: [] });
                        }
                        catch (err) {
                            i.reply({ embeds: [embed.setDescription(`Forum not ${action}d`)], components: [] });
                        }
                        break;
                    case "lock":
                        try {
                            await CommunityForums.findOneAndUpdate({ _id: fourmId }, { locked: true, lockedReason: reason });

                            i.reply({ embeds: [embed.setDescription(`Forum ${action}ed`)], components: [] });
                        }
                        catch (err) {
                            i.reply({ embeds: [embed.setDescription(`Forum not ${action}ed`)], components: [] });
                        }
                        break;
                    case "unlock":
                        try {
                            await CommunityForums.findOneAndUpdate({ _id: fourmId }, { locked: false, lockedReason: "" });

                            i.reply({ embeds: [embed.setDescription(`Forum ${action}ed`)], components: [] });
                        }
                        catch (err) {
                            i.reply({ embeds: [embed.setDescription(`Forum not ${action}ed`)], components: [] });
                        }
                        break;
                }
            } else if (i.customId === "no") {
                await i.update({ embeds: [embed.setDescription(`Forum not ${action}d`)], components: [] });
            }
        });
    }
}

export default command;
