import { SlashCommandBuilder, CommandInteraction, InteractionResponse, ChatInputCommandInteraction } from "discord.js";
import * as coinManager from "../lifetime-coins/lifetime-coins-manager";
import { channelCoinsLeaderboard } from '../configs/rivalbot-config.json'

export const data = new SlashCommandBuilder()
	.setName('coins-leaderboard')
	.setDescription('Shows the lifetime coins leaderboard.')
	.addBooleanOption(option =>
		option.setName("force-post")
			.setDescription("Force posting of the leaderboard to this channel (the old behaviour). (Default: false)."));

export async function execute(interaction: ChatInputCommandInteraction) {
	const forcePost = interaction.options.getBoolean('force-post') ?? false;
	if(forcePost) {
		await interaction.reply({ embeds: [await coinManager.embed(interaction.guild)], ephemeral: false });
	}
	else {
		const response =  `Please see <#${channelCoinsLeaderboard}> for a live-updating version of the coins leaderboard!` + 
			"\n\nOtherwise, if you'd like to post the leaderboard to this channel, re-run this command with `force-post: true`.";		
		await interaction.reply({ content: response, ephemeral: true });
	}
	
	await coinManager.updateLeaderboard(interaction.guild);
}