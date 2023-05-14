import { SlashCommandBuilder, CommandInteraction, InteractionResponse, ChatInputCommandInteraction, DataResolver, EmbedBuilder } from "discord.js";
import * as rivalManager from "../rivals/rival-manager";
import * as tournamentManager from "../tournament/tournament-manager";

export const data = new SlashCommandBuilder()
	.setName('champ-pb')
	.setDescription('Update your Champion tournament PB.')
	.addIntegerOption(option =>
		option.setName("waves")
			.setDescription("The wave count of your PB.")
			.setRequired(true));

export async function execute(interaction: ChatInputCommandInteraction) {
	await interaction.deferReply({ ephemeral: true });

	const waves = interaction.options.getInteger("waves");

    const outcome = await tournamentManager.update(interaction.user.id, waves, interaction.createdTimestamp, interaction.guild);

	// Pull the proper version.
	await interaction.editReply({ content: `Submitted a new champ PB of ${waves} waves for version ${"0.18.21"}.` });

    // Update Rival Card.
	await rivalManager.createOrUpdateRivalCard(interaction.user.id, interaction.guild);
}