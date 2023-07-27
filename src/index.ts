import { Client, Collection, Intents, TextBasedChannel, MessageEmbed } from 'discord.js';
import { config } from 'dotenv';
import CustomClient from './interfaces/CustomClient';
import Command from './interfaces/Command';
import { readdirSync } from 'fs';
import { join } from 'path';
import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v9';
import guild from './models/guild';

const client = new Client({
    intents: [
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_MESSAGES,
        Intents.FLAGS.GUILD_PRESENCES,
        Intents.FLAGS.GUILD_MEMBERS,
    ],
    partials: ["MESSAGE", "CHANNEL", "REACTION"],
    allowedMentions: { parse: ["users", "roles"], repliedUser: true },
}) as CustomClient;


client.commands = new Collection();
client.messageCommands = new Collection();
client.betaCommands = new Collection();
config();

const commandFolders = readdirSync(join(__dirname, "commands", 'Interaction'));

for (const folder of commandFolders) {
    const commandFiles = readdirSync(join(__dirname, "commands", 'Interaction', folder)).filter(file => file.endsWith(".ts") || file.endsWith(".js"));
    for (const file of commandFiles) {
        const command = require(join(__dirname, "commands", 'Interaction', folder, file));
        client.commands.set(command.command.data.name, command.command);
    }
}

const commandFolders_BETA = readdirSync(join(__dirname, "commands", 'Beta'));

for (const folder of commandFolders_BETA) {
    const commandFiles = readdirSync(join(__dirname, "commands", 'Beta', folder)).filter(file => file.endsWith(".ts") || file.endsWith(".js"));
    for (const file of commandFiles) {
        const command = require(join(__dirname, "commands", 'Beta', folder, file));
        client.commands.set(command.command.data.name, command.command);
    }
}

const messageCommandFolders = readdirSync(join(__dirname, "commands", 'Message'));

for (const folder of messageCommandFolders) {
    const commandFiles = readdirSync(join(__dirname, "commands", 'Message', folder)).filter(file => file.endsWith(".ts") || file.endsWith(".js"));
    for (const file of commandFiles) {
        const command = require(join(__dirname, "commands", 'Message', folder, file));
        client.messageCommands.set(command.command.name, command.command);
    }
}


const eventFiles = readdirSync(join(__dirname, "events")).filter(file => file.endsWith(".ts") || file.endsWith(".js"));

for (const file of eventFiles) {
    const event = require(join(__dirname, "events", file));
    if (event.once) {
        client.once(event.name, (...args) => event.execute(...args, client));
    } else {
        client.on(event.name, (...args) => event.execute(...args, client));
    }
}

process.on("unhandledRejection", (error: any) => {
    const embed = new MessageEmbed()
        .setTitle("Unhandled Rejection")
        .setDescription(`\`\`\`${error}\`\`\``)
        .setColor("RED")
        .setTimestamp();

    client.channels.fetch(process.env.LOGGING_CHANNEL as string).then((channel) => {
        (channel as TextBasedChannel).send({ embeds: [embed] });
    });

    console.error(error);
});

process.on("uncaughtException", (error: any) => {
    const embed = new MessageEmbed()
        .setTitle("Uncaught Exception")
        .setDescription(`\`\`\`${error}\`\`\``)
        .setColor("RED")
        .setTimestamp();

    client.channels.fetch(process.env.LOGGING_CHANNEL as string).then((channel) => {
        (channel as TextBasedChannel).send({ embeds: [embed] });
    });

    console.error(error);
});

client.setBetaCommands = async (guildId: string, msg: any) => {
    const commandFolders_BETA = readdirSync(join(__dirname, "commands", 'Beta'));
    //@ts-ignore
    const rest = new REST({ version: '9' }).setToken(process.env.token); // Set the token

    const settingCommands = new Collection<string, Command>();

    for (const folder of commandFolders_BETA) {
        const commandFiles = readdirSync(join(__dirname, "commands", 'Beta', folder)).filter(file => file.endsWith(".ts") || file.endsWith(".js"));
        for (const file of commandFiles) {
            const command = require(join(__dirname, "commands", 'Beta', folder, file));
            settingCommands.set(command.command.data.name, command.command);
        }
    }

    const guildData = client.guilds.cache.get(guildId);

    if (!guildData) return;


    const guildDocs = await guild.find({ guildId: guildData.id });

    if (!guildDocs) return;

    const guildDoc = guildDocs[0];

    if (guildDoc.isBeta === false) return msg.channel.send({ content: "This server is not a beta server!" });

    const botId = process.env.BOT_ID || '1045919089048178828'; // Provide a default value if process.env.BOT_ID is undefined
    await rest.put(Routes.applicationGuildCommands(botId, guildDoc.guildId), { body: settingCommands.map((command) => command.data.toJSON()) });

    if (msg) msg.channel.send({ content: `Successfully set beta commands for guild \`${guildData.name}\`!` });

};

client.login(process.env.token as string || "");