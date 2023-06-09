import { Client, Collection, Intents, TextBasedChannel, MessageEmbed } from 'discord.js';
import { config } from 'dotenv';
import CustomClient from './interfaces/CustomClient';
import Command from './interfaces/Command';
import { readdirSync } from 'fs';
import { join } from 'path';

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
config();

const commandFolders = readdirSync(join(__dirname, "commands", 'Interaction'));

for (const folder of commandFolders) {
    const commandFiles = readdirSync(join(__dirname, "commands", 'Interaction', folder)).filter(file => file.endsWith(".ts") || file.endsWith(".js"));
    for (const file of commandFiles) {
        const command = require(join(__dirname, "commands", 'Interaction', folder, file));
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

client.login(process.env.token as string || "");