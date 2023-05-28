import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v9';
import { readdirSync } from 'fs';
import { join } from 'path';
import { config } from 'dotenv';
import Command from './interfaces/Command'; // Import the Command interface

config();

const getClientId = () => {
  const clientID = process.env.BOT_ID;
  if (!clientID) return "1108925960952217610";
  return clientID;
};

const commands: Array<Command['data']> = []; // Specify the type of the commands array

const commandFolders = readdirSync(join(__dirname, 'commands', 'Interaction'));

for (const folder of commandFolders) {
  const commandFiles = readdirSync(join(__dirname, 'commands', 'Interaction', folder)).filter((file) => file.endsWith('.ts') || file.endsWith('.js')); // Get all the files in the folder
  for (const file of commandFiles) {
    const { command } = require(join(__dirname, 'commands', 'Interaction', folder, file)); // Destructure the command object
    commands.push(command.data.toJSON());
  }
}

const rest = new REST({ version: '9' }).setToken(process.env.token as string || ''); // Set the token

const args = process.argv.slice(2);

const clientID = args[0] || getClientId(); // Get the client ID from the .env file
const guildID = args[1];

if (!clientID) throw new Error('Please provide a client ID');
if (!guildID) {
  console.warn('No guild ID provided, registering global commands.');
  rest
    .put(Routes.applicationCommands(clientID), { body: commands })
    .then(() => {
      console.log('Successfully registered application commands. (GLOBAL)');
    })
    .catch(console.error);
} else {
  rest
    .put(Routes.applicationGuildCommands(clientID, guildID), { body: commands })
    .then(() => {
      console.log(`Successfully registered application commands. (GUILD: ${guildID})`);
    })
    .catch(console.error);
}
