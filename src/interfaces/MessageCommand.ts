import { Message } from "discord.js";
import CustomClient from "./CustomClient";

interface MessageCommand {
    name: string;
    description: string;
    usage?: string;
    author: string;
    category: string;
    example?: string;
    execute: (message: Message<boolean>, client: CustomClient, args: string[]) => Promise<void | Message<boolean> | undefined>;
}
export default MessageCommand;