import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction, MessageEmbed, MessageActionRow, MessageButton } from 'discord.js';
import Command from "../../../interfaces/Command";
import user from '../../../models/user';
import cards from '../../../models/cards';
import { ObjectId } from 'mongodb';
const wait = require('util').promisify(setTimeout);


const shouldDisable = (currentPage: number, pageLength: number, isNext: boolean) => {
    if (!isNext) return currentPage === 0 || currentPage >= pageLength;
    else return currentPage === 0 || currentPage >= pageLength - 1;
};

export const command: Command = {
    data: new SlashCommandBuilder()
        .setName('inventory')
        .setDescription('Check your inventory (Cards)')
        .addNumberOption(option => option.setName('page').setDescription('The page you want to go to.').setRequired(false)),
    hasToBeLinked: true,
    async execute(interaction: CommandInteraction) {
        const page = interaction.options.getNumber('page') || 1;
        await interaction.deferReply();

        const { channel, guild, client } = interaction;

        const userDoc = await user.findOne({ discordId: interaction.user.id });

        if (!userDoc) return interaction.reply({ content: "You don't have an account yet! Please run `/link` to create one.", ephemeral: true });

        let UCAARDS: () => Promise<any[]> = async () => {
            let userCards: any[] = [];
            for (const card of userDoc.cards) {
                userCards.push(await cards.findOne({ _id: new ObjectId(card.id) }));
            }
            return Promise.all(userCards);
        };

        let userCards = await UCAARDS();
        let currentPage = page - 1;
        let pages = [] as { embeds: MessageEmbed[], row: MessageActionRow }[];

        pages = userCards.map((_, index) => {
            return {
                embeds: [new MessageEmbed()
                    .setTitle(`${interaction.user.username}'s Inventory (${index + 1}/${userCards.length})`)
                    .setDescription(`${_.name}\nPersonal ID: ${userDoc?.cards[index].personal_id}`)
                    .setColor('RANDOM')
                    .setImage(_.image || '')
                    .setTimestamp(),
                ],
                row: new MessageActionRow()
                    .addComponents(
                        new MessageButton()
                            .setCustomId('previous')
                            .setEmoji("<:6321appdirectorylarrowblokdark:1126645289164484679>")
                            .setStyle('PRIMARY'),
                        new MessageButton()
                            .setURL(`https://goddessanime.com/card/${_._id}?utm_source=discord&utm_medium=bot&utm_campaign=inventory&user=${interaction.user.id}`)
                            .setLabel('View Card')
                            .setStyle('LINK'),
                        new MessageButton()
                            .setCustomId('next')
                            .setEmoji("<:3409appdirectoryrarrowblokdark:1126645287667126333>")
                            .setStyle('PRIMARY')
                    )

            }
        }) as { embeds: MessageEmbed[], row: MessageActionRow }[];

        if (pages.length === 0) return interaction.reply({ content: 'You have no cards.', ephemeral: true });

        await interaction.editReply({ embeds: pages[currentPage].embeds, components: [pages[currentPage].row] });


        client.on('interactionCreate', async (i) => {
            if (!i.isButton()) return;

            if (i.user.id !== interaction.user.id) return i.reply({ content: `Sorry, but only ${interaction.user.username} can use this button!`, ephemeral: true });

            if (i.customId === 'previous') {
                if (currentPage === 0) return i.reply({ content: 'You are already on the first page.', ephemeral: true });
                currentPage--;
                await i.update({ embeds: pages[currentPage].embeds, components: [pages[currentPage].row] });
            }

            if (i.customId === 'next') {
                if (currentPage === pages.length - 1) return i.reply({ content: 'You are already on the last page.', ephemeral: true });
                currentPage++;
                await i.update({ embeds: pages[currentPage].embeds, components: [pages[currentPage].row] });
            }
        });
    }
} as Command;
