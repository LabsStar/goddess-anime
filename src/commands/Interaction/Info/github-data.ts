import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction, MessageEmbed } from 'discord.js';
import Command from "../../../interfaces/Command";
import CustomClient from '../../../interfaces/CustomClient';
import axios from 'axios';

const github_repo = "https://api.github.com/repos/LabsStar/goddess-anime";

const getGithubData = async () => {
    const basicData = await axios.get(github_repo);

    const issues = await axios.get(`${github_repo}/issues`);


    const setSize = (size: number) => {
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        if (size == 0) return 'n/a';
        const i = Math.floor(Math.log(size) / Math.log(1024));
        if (i == 0) return size + ' ' + sizes[i];
        return (size / Math.pow(1024, i)).toFixed(1) + ' ' + sizes[i];
    };

    const getSocialImage = async () => {
        // Using axios and html parsing we need to get the social image of the repo
        // This is because the github api doesn't provide the social image

        const html = await axios.get(github_repo.replace('api.', '').replace('/repos', ''));

        const image = html.data.split('<meta property="og:image" content="')[1].split('"')[0];

        return image;
    }

    function convertTimeToRaw(time: any) {
        return Math.floor(Date.parse(time) / 1000);
    }

    const data = {
        name: basicData.data.name,
        description: basicData.data.description,
        language: basicData.data.language,
        size: setSize(basicData.data.size),
        stars: basicData.data.stargazers_count,
        forks: basicData.data.forks_count,
        license: basicData.data.license?.name,
        lastCommit: basicData.data.updated_at,
        _formatedLastCommit: `<t:${convertTimeToRaw(basicData.data.updated_at)}:R>`,
        link: basicData.data.html_url,
        issues: {
            open: issues.data.filter((issue: any) => !issue.pull_request).length,
            closed: issues.data.filter((issue: any) => !issue.pull_request).length,
            recent: issues.data.filter((issue: any) => !issue.pull_request).sort((a: any, b: any) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())[0],
        }
    };

    return data;
}

export const command: Command = {
    data: new SlashCommandBuilder()
        .setName('opensource')
        .setDescription('Get the link to the bot\'s open source code')
        .addSubcommand(subcommand =>
            subcommand
                .setName('data')
                .setDescription('Get the information about the bot\'s open source code')
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('link')
                .setDescription('Get the link to the bot\'s open source code')
        ),
    hasToBeLinked: false,
    async execute(interaction: CommandInteraction) {
        const command = interaction.options.getSubcommand();
        await interaction.deferReply();

        if (command === 'data') {
            const data = await getGithubData();

            const embed = new MessageEmbed()
                .setTitle(data.name)
                .setDescription(data.description)
                .addFields({
                    name: 'Language',
                    value: `${data.language}`,
                })
                .addFields({
                    name: 'Size',
                    value: `${data.size}`,
                })
                .addFields({
                    name: 'Stars',
                    value: `${data.stars}`,
                })
                .addFields({
                    name: 'Forks',
                    value: `${data.forks}`,
                })
                .addFields({
                    name: 'License',
                    value: `${data.license}`,
                })
                .addFields({
                    name: 'Last Commit',
                    value: `${data._formatedLastCommit}`,
                })
                .addFields({
                    name: 'Link',
                    value: `${data.link}`,
                })
                .addFields({
                    name: 'Issues',
                    value: `Open: ${data.issues.open}\nClosed: ${data.issues.closed}\nRecent: ${data.issues.recent.title}`,
                })
                .setTimestamp(new Date(data.lastCommit))

            await interaction.editReply({
                embeds: [embed],
            });
        } else if (command === 'link') {
            const link = github_repo.replace('api.', '').replace('/repos', '');
            await interaction.editReply({
                content: `Here is the link to the bot's open source code: ${link}`
            });
        }
    }
} as Command;
