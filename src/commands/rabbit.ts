import { SlashCommandBuilder, CommandInteraction, InteractionResponse, ChatInputCommandInteraction } from "discord.js";

export const data: SlashCommandBuilder = new SlashCommandBuilder()
	.setName('rabbit')
	.setDescription('🐰');

export async function execute(interaction: ChatInputCommandInteraction) {
	await interaction.reply({ content: '🐰' });
}