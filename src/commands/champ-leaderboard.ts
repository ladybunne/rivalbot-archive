import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { channelTournamentLeaderboardId } from '../configs/rivalbot-config.json';
import * as tournamentManager from "../tournament/tournament-manager";

export const data = new SlashCommandBuilder()
	.setName('champ-leaderboard')
	.setDescription('Shows the champ PB leaderboard.')
	.addBooleanOption(option =>
		option.setName("force-post")
			.setDescription("Force posting of the leaderboard to this channel (the old behaviour). (Default: false)."));

export async function execute(interaction: ChatInputCommandInteraction) {
	const forcePost = interaction.options.getBoolean('force-post') ?? false;
	if(forcePost) {
		await interaction.reply({ embeds: [await tournamentManager.leaderboardEmbed()], ephemeral: false });
	}
	else {
		const response =  `Please see <#${channelTournamentLeaderboardId}> for a live-updating version of the champ leaderboard!` + 
			"\n\nOtherwise, if you'd like to post the leaderboard to this channel, re-run this command with `force-post: true`.";		
		await interaction.reply({ content: response, ephemeral: true });
	}
	
	await tournamentManager.updateLeaderboard(interaction.guild);
}