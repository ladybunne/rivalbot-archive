import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
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

	// Do this properly, a la /lifetime-coins.
	await interaction.editReply({ content: `Submitted a new champ PB of ${waves} waves for version ${tournamentManager.getTournamentVersion()} or newer.` });

    // Update Rival Card.
	await rivalManager.createOrUpdateRivalCard(interaction.user.id, interaction.guild);
}