import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction, MessageEmbed, MessageActionRow, MessageButton } from 'discord.js';
import Command from "../../../interfaces/Command";
import user from '../../../models/user';
import cards from '../../../models/cards';

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

        // await interaction.deferReply();

        const { channel, guild, client } = interaction;

        const userDoc = await user.findOne({ discordId: interaction.user.id });

        if (!userDoc) return interaction.reply({ content: "You don't have an account yet! Please run `/link` to create one.", ephemeral: true });

        let userCards = await cards.find({ _id: { $in: userDoc?.cards.map((card) => card.id) } });
        let currentPage = 0 || interaction.options.getNumber('page')! - 1;
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
                            .setLabel('Previous')
                            .setStyle('PRIMARY'),
                        new MessageButton()
                            .setURL(`https://goddessanime.com/card/${_._id}`)
                            .setLabel('View Card')
                            .setStyle('LINK'),
                        new MessageButton()
                            .setCustomId('next')
                            .setLabel('Next')
                            .setStyle('PRIMARY')
                    )

            }
        }) as { embeds: MessageEmbed[], row: MessageActionRow }[];

        if (pages.length === 0) return interaction.reply({ content: 'You have no cards.', ephemeral: true });

        await interaction.reply({ embeds: pages[currentPage].embeds, components: [pages[currentPage].row] });



        const collector = interaction.channel?.createMessageComponentCollector({ componentType: 'BUTTON', time: 60000 });

        collector?.on('collect', async (i) => {
            if (i.customId === 'previous') {
                if (currentPage === 0) return i.reply({ content: 'You are already on the first page.', ephemeral: true });
                currentPage--;
                await i.update({ embeds: pages[currentPage].embeds, components: [pages[currentPage].row] });
            }
            else if (i.customId === 'next') {
                if (currentPage === pages.length - 1) return i.reply({ content: 'You are already on the last page.', ephemeral: true });
                currentPage++;
                await i.update({ embeds: pages[currentPage].embeds, components: [pages[currentPage].row] });
            }
        });

        collector?.on('end', async (collected, reason) => {
            if (reason === 'time') {
                await interaction.editReply({ content: 'Inventory closed due to inactivity.', components: [] });
            }
        });
    }
} as Command; // console.log(`Current Page: ${currentPage}. Total Pages: ${pages.length}. Pages Left: ${pages.length - currentPage}`);
