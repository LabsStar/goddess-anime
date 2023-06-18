import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction, MessageEmbed, TextChannel } from 'discord.js';
import Command from "../../../interfaces/Command";
import user from '../../../models/user';
import guild from '../../../models/guild';
import cards from '../../../models/cards';
import Activity from '../../../services/activity';

import { generateCardId } from '../../../utils/generate';

export const command: Command = {
  data: new SlashCommandBuilder()
    .setName('catch')
    .setDescription('Catch a card')
    .addStringOption(option =>
      option
        .setName('captcha')
        .setDescription('The captcha of the card you want to catch')
        .setRequired(true)),
  hasToBeLinked: true,
  async execute(interaction: CommandInteraction) {
    const activity = new Activity(interaction.client);

    if (!interaction.guild) return;

    const captcha = interaction.options.getString('captcha')!;

    const userDB = await user.findOne({ discordId: interaction.user.id });

    if (!userDB) return;

    const guildDB = await guild.findOne({ guildId: interaction.guild.id });

    if (!guildDB)
      return interaction.reply({
        content: "This guild doesn't exist in the database! This is a bug, please report it to the developers!",
        ephemeral: true
      });

    const card = guildDB.currentCards.find((card) => card.captcha.toLowerCase() === captcha.toLowerCase());

    if (!card)
      return interaction.reply({ content: `There is no card with the captcha \`${captcha.toLowerCase()}\`!`, ephemeral: true });

    const cardDB = await cards.findOne({ _id: card.id });

    if (!cardDB)
      return interaction.reply({
        content: "This card doesn't exist in the database! This is a bug, please report it to the developers!",
        ephemeral: true
      });

    userDB.cards.push({
      id: cardDB._id,
      personal_id: generateCardId()
    });

    await userDB.save();

    if (!cardDB) throw new Error("No Card.")

    const embed = new MessageEmbed()
      .setTitle('Card Caught!')
      .setDescription(`You caught a **${cardDB.name}**!`)
      .setImage(cardDB.image as string)
      .setColor('GREEN')
      .setTimestamp(card.time_spawned);

    interaction.reply({ embeds: [embed], ephemeral: true });

    await activity.setActivity(
      interaction.user.id,
      `Card Claimed`,
      cardDB.image as string,
      `You caught a ${cardDB.name}!`,
      `https://goddessanime.com/card/${cardDB._id}`,
      [{ label: 'View Card', cb: `https://goddessanime.com/card/${cardDB._id}` }],
      new Date(Date.now()).toLocaleString(),
    );

    const referenceChannel = card.refrence_id;

    const channel = interaction.client.channels.cache.get(referenceChannel) as TextChannel;

    if (!channel) return;

    const messages = await channel.messages.fetch({ limit: 100 });

    const message = messages.find((message) => message.embeds[0]?.footer?.text === captcha);

    if (!message) return;

    const embed2 = new MessageEmbed()
      .setTitle('Card Caught!')
      .setDescription(`This card has been caught by <@${interaction.user.id}>!`)
      .setImage(cardDB.image as string)
      .setColor('RED')
      .setTimestamp(card.time_spawned);

    message.edit({ embeds: [embed2] });

    for (let i = 0; i < guildDB.currentCards.length; i++) {
      if (guildDB.currentCards[i].captcha === captcha) {
        guildDB.currentCards.splice(i, 1); // I wish there was a easier way...
      }
    }

    await guildDB.save();

    
    return;
  }
} as Command;
