import cards from "../models/cards";
import { MessageEmbed, MessageActionRow, MessageButton, Client, TextChannel, MessageCollector, CommandInteraction, GuildChannel, TextBasedChannel } from "discord.js";
import logger from "../utils/logger";
import guild from "../models/guild";
import cron from "node-cron";
import config from "../config";

const TIME_TO_DELETE = 60000; // 1 minute

const cronJobs = { // Cron jobs for spawning and despawning cards (in cron format) [ https://crontab.guru/ ]
    spawn: "*/5 * * * *", // Every 5 minutes
    despawn: "*/1 * * * *" // Every minute
}

const createCaptcha = (length: number) => {
    let result = "";
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    const charactersLength = characters.length;

    for (let i = 0; i < length; i++) result += characters.charAt(Math.floor(Math.random() * charactersLength));

    return result;
};

class CardService {
    client: Client;

    constructor(client: Client) {
        this.client = client;
    }

    async spawnCard() {
        const randomcard = await cards.aggregate([{ $sample: { size: 1 } }]);

        const card = randomcard[0];

        const randomGuild = await guild.aggregate([{ $sample: { size: 1 } }]);

        const guildDoc = randomGuild[0];

        const spawnChannel = await this.client.channels.fetch(guildDoc.spawnChannel) as TextChannel;

        if (!spawnChannel) return;

        const captcha = createCaptcha(6);

        const embed = new MessageEmbed()
            .setTitle(`New Card Spawned!`)
            .setDescription(`${card.name} has spawned!\nUse </${config.catch.name}:${config.catch.id}> \`${captcha}\` to catch it!`)
            .setImage(card.image)
            .setFooter({ text: captcha, iconURL: this.client.user?.displayAvatarURL() || "" })
            .setColor("RANDOM");

        try {
            spawnChannel.send({ embeds: [embed] });

            console.log(`Spawned card ${card.name} in ${spawnChannel.guild.name} (${spawnChannel.guild.id})`);

            guild.findOne({ guildId: spawnChannel.guild.id }).then((doc) => {
                if (!doc) return;

                doc.currentCards.push({
                    id: card._id,
                    captcha: captcha,
                    time_until_despawn: TIME_TO_DELETE,
                    time_spawned: Date.now(),
                    refrence_id: spawnChannel.id
                });

                doc.save();

                console.log(`Added card ${card.name} to ${spawnChannel.guild.name} (${spawnChannel.guild.id})`);
            });
        }

        catch (err) {
            console.error(`Failed to spawn card in ${spawnChannel.guild.name} (${spawnChannel.guild.id})\n${err}`);
        }

    }

    async spawnCard_force(guild_id: string, channel_id: string) {
        const randomcard = await cards.aggregate([{ $sample: { size: 1 } }]);

        const card = randomcard[0];

        const guildDoc = await guild.findOne({ guildId: guild_id });

        if (!guildDoc) return;

        const spawnChannel = await this.client.channels.fetch(channel_id) as TextChannel;

        if (!spawnChannel) return;

        const captcha = createCaptcha(6);

        const embed = new MessageEmbed()
            .setTitle(`New Card Spawned!`)
            .setDescription(`${card.name} has spawned!\nUse </${config.catch.name}:${config.catch.id}> ${captcha} to catch it!`)
            .setImage(card.image)
            .setFooter({ text: captcha, iconURL: this.client.user?.displayAvatarURL() || "" })
            .setColor("RANDOM");

        spawnChannel.send({ embeds: [embed] });

        console.log(`Spawned card ${card.name} in ${spawnChannel.guild.name} (${spawnChannel.guild.id}) [FORCED]`);

        guild.findOne({ guildId: spawnChannel.guild.id }).then((doc) => {
            if (!doc) return;

            doc.currentCards.push({
                id: card._id,
                captcha: captcha,
                time_until_despawn: TIME_TO_DELETE,
                time_spawned: Date.now(),
                refrence_id: spawnChannel.id
            });

            doc.save();

            console.log(`Added card ${card.name} to ${spawnChannel.guild.name} (${spawnChannel.guild.id}) [FORCED]`);
        });
    }

    async spawn_command(interaction: CommandInteraction) {
        const guildDoc = await guild.findOne({ guildId: interaction?.guild?.id });

        const randomcard = await cards.aggregate([{ $sample: { size: 1 } }]);
        const card = randomcard[0];

        const captcha = createCaptcha(6);

        const embed = new MessageEmbed()
            .setTitle(`New Card Spawned!`)
            .setDescription(`<@${interaction.user.id}> has spawned a card for the community to catch!\n${card.name} has spawned!\nUse </${config.catch.name}:${config.catch.id}> ${captcha} to catch it!`)
            .setImage(card.image)
            .setFooter({ text: captcha, iconURL: this.client.user?.displayAvatarURL() || "" })
            .setColor("RANDOM");

        interaction.reply({ embeds: [embed] });

        console.log(`Spawned card ${card.name} in ${interaction?.guild?.name} (${interaction?.guild?.id}) [COMMAND]`);

        guild.findOne({ guildId: interaction?.guild?.id }).then((doc) => {
            if (!doc) return;

            doc.currentCards.push({
                id: card._id,
                captcha: captcha,
                time_until_despawn: TIME_TO_DELETE,
                time_spawned: Date.now(),
                refrence_id: interaction?.guild?.id
            });

            doc.save();

            console.log(`Added card ${card.name} to ${interaction?.guild?.name} (${interaction?.guild?.id}) [COMMAND]`);
        });
    }


    async start() {
        cron.schedule(cronJobs.spawn, async () => {
            await this.spawnCard();
        });

        cron.schedule("0 6 * * *", async () => {
            const guilds = await guild.find();

            guilds.forEach((guild) => {
                if (guild.currentCards.length === 0) return;


                guild.currentCards.forEach(async () => {
                    // Remove all cards that have been spawned
                    guild.currentCards = [];

                    setTimeout(async () => {
                        await guild.save();
                    }, 2000);
                });
            });
        });
    }

    async subscribeToUpdates() {
        cards.watch().on("change", async (change) => {
            if (change.operationType === "insert") {
                const card = change.fullDocument;

                const author = await this.client.users.fetch(card.creator || "1045919089048178828");

                const embed = new MessageEmbed()
                    .setTitle(`New Card Added!`)
                    .setDescription(`A new card has been added to the database!\n${card.name} has been added!`)
                    .setImage(card.image)
                    .setAuthor({ name: `${author.tag}`, iconURL: author.displayAvatarURL({ dynamic: true }), url: `https://users.goddessanime.com/${author.id}` })
                    .setFooter({ text: `${card.tagLine.substring(0, 50)}...`, iconURL: this.client.user?.displayAvatarURL() })
                    .setColor("RANDOM")
                    .setTimestamp();

                const row = new MessageActionRow()
                    .addComponents(
                        new MessageButton()
                            .setURL(`https://cards.goddessanime.com/${card._id}`)
                            .setLabel("View Card")
                            .setEmoji("📄")
                            .setStyle("LINK"),
                    );

                this.client.channels.fetch(process.env.CARD_UPDATE_CHANNEL as string).then((channel) => {
                    (channel as TextBasedChannel).send({ embeds: [embed], components: [row] });
                });


            }
        });
    }
}

export default CardService;