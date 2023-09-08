import { SlashCommandBuilder, CommandInteraction, InteractionResponse, ChatInputCommandInteraction, DataResolver, EmbedBuilder, ButtonComponent, ButtonBuilder, ButtonStyle, ActionRowBuilder } from "discord.js";

// Change this to use IDs.
const forbiddenUsernames = ["ladybunne", "rivalbot", "adversaryautomaton"];

export const data = new SlashCommandBuilder()
	.setName('nickname-all')
	.setDescription('Set all users\' nicknames.');

// Swap to defer -> edit if this command ever times out. Otherwise stick with this feature.
// Defer -> edit is undesirable since you can't change ephemeral on an editReply.
export async function execute(interaction: ChatInputCommandInteraction) {
	// await interaction.deferReply({ ephemeral: false });

	// Write some better handling for when nicknaming fails due to permissions.
	// Thanks, Skye.

	const description = `**User**: ${interaction.user.username} / ${interaction.user}\n` +
		`**Target**: EVERYBODY.\n` +
		`**Nicknames**: 0 nicknames entered; please click one of the buttons below to start nicknaming.\n\n` +
		`**Outcome**: ${"Awaiting final confirmation."}`;
		
	const embed = new EmbedBuilder()
	// .setColor(outcomeSuccess ? "Green" : "Red")
    .setColor("Yellow")
	.setTitle('Nickname Change - Super Deluxe Edition')
	.setDescription(description)
	.setTimestamp()
	.setFooter({ text: 'This is probably going to hit the character limit, lmfao.' });

    const buttons1 = [1, 2, 3, 4, 5].map(label => new ButtonBuilder()
        .setCustomId(`${label}-button-asdf`)
        .setLabel(`Group ${label}`)
        .setStyle(ButtonStyle.Secondary))

    const buttons2 = [6, 7, 8, 9, 10].map(label => new ButtonBuilder()
        .setCustomId(`${label}-button-asdf`)
        .setLabel(`Group ${label}`)
        .setStyle(ButtonStyle.Secondary))

    const row1 = new ActionRowBuilder<ButtonBuilder>()
        .addComponents(buttons1)

    const row2 = new ActionRowBuilder<ButtonBuilder>()
        .addComponents(buttons2)

    const rows = [row1, row2]

    // Alternatively, make it a dropdown / select menu.

	// await interaction.editReply({ embeds: [embed] });
    // We'll want this to be ephemeral to avoid ruining the surprise.
	await interaction.reply({ embeds: [embed], components: rows, ephemeral: false });
}