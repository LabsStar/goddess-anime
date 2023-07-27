import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v9';
import { readdirSync } from 'fs';
import { join } from 'path';
import { config } from 'dotenv';
import Command from './interfaces/Command'; // Import the Command interface
import guild from './models/guild';
import mongoose from 'mongoose';

config();

const getClientId = () => {
  const clientID = process.env.BOT_ID;
  if (!clientID) return "1009790799619301396";
  return clientID;
};

const commands: Array<Command['data']> = []; // Specify the type of the commands array
const betaCommands: Array<Command['data']> = []; // Specify the type of the commands array

const commandFolders_BETA = readdirSync(join(__dirname, 'commands', 'Beta')); // Get all the folders in the commands folder
const commandFolders = readdirSync(join(__dirname, 'commands', 'Interaction'));

for (const folder of commandFolders) {
  const commandFiles = readdirSync(join(__dirname, 'commands', 'Interaction', folder)).filter((file) => file.endsWith('.ts') || file.endsWith('.js')); // Get all the files in the folder
  for (const file of commandFiles) {
    const { command } = require(join(__dirname, 'commands', 'Interaction', folder, file)); // Destructure the command object
    commands.push(command.data.toJSON());
  }
}

for (const folder of commandFolders_BETA) {
  const commandFiles = readdirSync(join(__dirname, 'commands', 'Beta', folder)).filter((file) => file.endsWith('.ts') || file.endsWith('.js')); // Get all the files in the folder
  for (const file of commandFiles) {
    const { command } = require(join(__dirname, 'commands', 'Beta', folder, file)); // Destructure the command object
    betaCommands.push(command.data.toJSON());
  }
}

const rest = new REST({ version: '9' }).setToken(process.env.token as string || ''); // Set the token

const args = process.argv.slice(2);

const clientID = args[0] || getClientId(); // Get the client ID from aruments passed in the command line
const guildID = args[1]; // Get the guild ID from aruments passed in the command line

async function SetPublic() {
  if (!clientID) throw new Error('Please provide a client ID');
  if (!guildID) {
    console.warn('No guild ID provided, registering global commands.');
    rest
      .put(Routes.applicationCommands(clientID), { body: commands })
      .then(() => {
        console.log('[PUBLIC] Successfully registered application commands. (GLOBAL)');
      })
      .catch(console.error);
  } else {
    rest
      .put(Routes.applicationGuildCommands(clientID, guildID), { body: commands })
      .then(() => {
        console.log(`[PUBLIC] Successfully registered application commands. (GUILD: ${guildID})`);
      })
      .catch(console.error);
  }
}

async function SetBeta() {
  if (!clientID) throw new Error('Please provide a client ID');
  const guildDocs = await guild.find({ isBeta: true });

  for (const guildDoc of guildDocs) {
    if (!guildDoc.guildId) continue;
    try {
      await rest.put(Routes.applicationGuildCommands(clientID, guildDoc.guildId), { body: betaCommands });
      console.log(`[BETA] Successfully registered application commands. (GUILD: ${guildDoc.guildId})`);
    } catch (error) {
      console.error(error);
      continue;
    }
  }
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

(async () => {
  try {
    await SetPublic();
    mongoose.connect(process.env.MONGO_URI as string);
    const db = mongoose.connection;


    db.on("error", (error) => {
      console.error(error);
      process.exit(1);
    });

    db.once("open", () => {
      console.log("Connected to MongoDB");
    });
    await sleep(2000);
    await SetBeta();
    process.exit(0);
  } catch (error) {
    console.error('Error during command registration:', error);
  }
})();