import { Client, Collection } from 'discord.js';
import Command from './Command';
import MessageCommand from './MessageCommand';

interface CustomClient extends Client {
    commands: Collection<string, Command>;
    messageCommands: Collection<string, MessageCommand>;
    betaCommands: Collection<string, Command>;
    setBetaCommands: (guildId: string, msg: any) => Promise<void>;
}

export default CustomClient;