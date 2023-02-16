import { SlashCommandBuilder, CommandInteraction, InteractionResponse, ChatInputCommandInteraction } from "discord.js";
import * as coinManager from "../lifetime-coins/lifetime-coins-manager";

export const data: SlashCommandBuilder = new SlashCommandBuilder()
	.setName('coins-leaderboard')
	.setDescription('Shows the lifetime coins leaderboard.');

export async function execute(interaction: ChatInputCommandInteraction) {
	await interaction.reply({ embeds: [coinManager.embed(interaction.guild)], ephemeral: false });
}