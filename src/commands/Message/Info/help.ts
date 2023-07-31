import { Message, MessageEmbed, MessageActionRow, MessageButton } from "discord.js";
import CustomClient from "../../../interfaces/CustomClient";
import MessageCommand from "../../../interfaces/MessageCommand";
import config from "../../../config";

export const command: MessageCommand = {
    name: "help",
    description: "Get help with the bot",
    author: "547923574833545226",
    usage: "(command)",
    example: "verify",
    category: "Info",
    async execute(message: Message, client: CustomClient, args: string[]) {

        const { messageCommands } = message.client as CustomClient;

        const noArgs = args.length === 0;


        if (noArgs) {
            const embed = new MessageEmbed()
                .setTitle("Help")
                .setDescription(`Use \`${config.DEVELOPER_PREFIX}help <command>\` to get help with a specific command or category.`)
                .setColor("BLUE")
                .setTimestamp();

            const categories = messageCommands.map(command => command.category).filter((category, index, self) => self.indexOf(category) === index);

            for (let i = 0; i < categories.length; i++) {
                const category = categories[i];

                const commands = messageCommands.filter(command => command.category === category);

                const commandNames = commands.map(command => `\`${command.name}\``).join(", ");

                embed.addFields({ name: category, value: commandNames });
            }

            return message.reply({ embeds: [embed] });
        }

        const commandName = args[0].toLowerCase();

        const command = messageCommands.find(command => command.name === commandName);

        if (!command) return message.reply(`\`${commandName}\` is not a valid command`);

        const embed = new MessageEmbed()
            .setTitle(`Help - ${command.name}`)
            .setDescription(`${command.description}`)
            .setColor("BLUE")
            .setTimestamp();

        if (command.usage) embed.addFields({ name: "Usage", value: `\`${config.DEVELOPER_PREFIX}${command.name} ${command.usage}\`` });

        if (command.category) embed.addFields({ name: "Category", value: command.category });

        if (command.example) embed.addFields({ name: "Example", value: `\`${config.DEVELOPER_PREFIX}${command.name} ${command.example}\`` });

        embed.addFields({ name: "Author", value: `<@${command.author}>` });

        return message.reply({ embeds: [embed] });

    }
}

export default command;
