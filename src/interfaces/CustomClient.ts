import { Client, Collection } from 'discord.js';
import Command from './Command';
import MessageCommand from './MessageCommand';

interface CustomClient extends Client {
    commands: Collection<string, Command>;
    messageCommands: Collection<string, MessageCommand>;
    getUser: (id: string) => Promise<unknown>;
    getGuild: (id: string) => Promise<unknown>;
    formatDate: (date: Date) => string;
    getMember: (guild: unknown, id: string) => Promise<unknown>;
    checkForVerified: (id: string) => Promise<boolean>;
    checkForSpawn: (id: string) => Promise<boolean>;
    checkIfStaff: (id: string) => Promise<boolean>;
    staff: () => void;
}

export default CustomClient;