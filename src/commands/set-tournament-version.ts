import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import * as tournamentManager from "../tournament/tournament-manager";

export const data = new SlashCommandBuilder()
	.setName('set-tournament-version')
	.setDescription('Set the current tournament version.')
	.addStringOption(option =>
		option.setName("version")
			.setDescription("The current version tournaments are locked to.")
			.setRequired(true));

export async function execute(interaction: ChatInputCommandInteraction) {
	await interaction.deferReply({ ephemeral: false });

    const version = interaction.options.getString("version");

    await tournamentManager.setTournamentVersion(version, interaction.guild);

	await interaction.followUp({ content: `Updated the current tournament version to ${version}.` });

	// Ideally this should update all rival cards.
}