import { Client, Collection } from 'discord.js';
import Command from './Command';
import MessageCommand from './MessageCommand';

interface CustomClient extends Client {
    commands: Collection<string, Command>;
    messageCommands: Collection<string, MessageCommand>;
}

export default CustomClient;