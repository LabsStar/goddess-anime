import { Client, Guild, AllowedImageSize } from "discord.js";

class GuildLoco {
    client: Client;

    constructor(client: Client) {
        this.client = client;
    }

    async getGuild(id: string) {
        const guild = await this.client.guilds.fetch(id);

        return guild;
    }

    async getGuildIcon(id: string, Isize?: number) {
        const guild = await this.client.guilds.fetch(id);

        if (!guild.icon) return "https://archive.org/download/discordprofilepictures//discordred_thumb.jpg";

        const size: AllowedImageSize | undefined = Isize as AllowedImageSize | undefined;

        return guild.iconURL({ dynamic: true, size: size || 4096 });
    }

    async getGuildName(id: string) {
        const guild = await this.client.guilds.fetch(id);

        return guild.name;
    }
}

export default GuildLoco;
