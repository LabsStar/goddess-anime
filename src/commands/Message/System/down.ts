import { Message, MessageEmbed, MessageActionRow, MessageButton } from "discord.js";
import CustomClient from "../../../interfaces/CustomClient";
import MessageCommand from "../../../interfaces/MessageCommand";
import system from "../../../models/system";
import config from "../../../config";

const { COMMUNITY_UPDATES_CHANNEL, IS_IN_DEV_MODE } = config;

const generateDowntime = () => {
    const date = new Date();

    if (IS_IN_DEV_MODE) {
        date.setMinutes(date.getMinutes() + 1);
    }
    else {
        date.setHours(date.getHours() + 1);
    }
    return date;
}

export const command: MessageCommand = {
    name: "set-downtime",
    description: "Force downtime on the bot and website.",
    usage: "<message>",
    async execute(message: Message, client: CustomClient, args: string[]) {

        const systemDoc = await system.findOne({});

        if (!systemDoc) {
            await system.create({});
        }


        const downtimeMessage = args.slice(0).join(" ");

        if (!downtimeMessage) return message.reply("Please provide a downtime message.");

        function convertTimeToRaw(time: any) {
            return Math.floor(Date.parse(time) / 1000);
        }


        if (systemDoc?.isDown) {
            systemDoc.isDown = false;
            systemDoc.downtimeMessage = "";
            systemDoc.downtimePusher = "";
            
            await systemDoc.save();

            const embed = new MessageEmbed()
                .setTitle(`Downtime Lifted`)
                .setAuthor({ name: `Downtime Lifted by ${message.author.tag}`, iconURL: message.author.displayAvatarURL({ dynamic: true }), url: `https://users.goddessanime.com/${message.author.id}` })
                .setURL(`https://status.goddessanime.com`)
                .setThumbnail(`https://cdn.discordapp.com/avatars/${client.user?.id}/${client.user?.avatar}.${client.user?.avatar?.startsWith('a_') ? 'gif' : 'png'}?size=1024`)
                .setDescription(`The bot and website are no longer in downtime`)
                .setColor("GREEN")
                .setTimestamp();

            const row = new MessageActionRow()
                .addComponents(
                    new MessageButton()
                        .setLabel("View Status Page")
                        .setStyle("LINK")
                        .setEmoji("📊")
                        .setURL("https://status.goddessanime.com")
                );

            const channel = await client.channels.fetch(COMMUNITY_UPDATES_CHANNEL);

            if (!channel?.isText()) return;

            let encounteredError = false;

            try {
                await channel.send({ embeds: [embed], components: [row] });
            }
            catch (err) {
                console.log(err);
                encounteredError = true;
            }



            return message.reply(`The bot and website are no longer in downtime. ${encounteredError ? "However, there was an error sending the downtime message to the community updates channel." : ""}`);
        }

        if (!systemDoc) return message.reply("There was an error getting the system document from the database.");

        
        systemDoc.isDown = true;
        systemDoc.downtimeMessage = downtimeMessage;
        systemDoc.downtimePusher = message.author.id;
        systemDoc.expectedDowntime = generateDowntime();

        await systemDoc.save();


        const embed = new MessageEmbed()
            .setTitle(`Downtime Scheduled`)
            .setAuthor({ name: `Downtime Planned by ${message.author.tag}`, iconURL: message.author.displayAvatarURL({ dynamic: true }), url: `https://users.goddessanime.com/${message.author.id}` })
            .setURL(`https://status.goddessanime.com`)
            .setThumbnail(`https://cdn.discordapp.com/avatars/${client.user?.id}/${client.user?.avatar}.${client.user?.avatar?.startsWith('a_') ? 'gif' : 'png'}?size=1024`)
            .setDescription(`${downtimeMessage}\n \nThis downtime will begin <t:${convertTimeToRaw(systemDoc?.expectedDowntime)}:R>`)
            .setColor("RED")
            .setTimestamp();

        const row = new MessageActionRow()
            .addComponents(
                new MessageButton()
                    .setURL(`https://status.goddessanime.com/`)
                    .setLabel("Status Page")
                    .setEmoji("📊")
                    .setStyle("LINK"),
            );

        const channel = await client.channels.fetch(COMMUNITY_UPDATES_CHANNEL);

        if (!channel?.isText()) return;

        let encounteredError = false;

        try {
            await channel.send({ embeds: [embed], components: [row] });
        }
        catch (err) {
            console.log(err);
            encounteredError = true;
        }

        return message.reply(`The bot and website are now in downtime. ${encounteredError ? "However, there was an error sending the downtime message to the community updates channel." : ""}`);




    }

}

export default command;
