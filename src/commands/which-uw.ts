import { SlashCommandBuilder, CommandInteraction, InteractionResponse, ChatInputCommandInteraction } from "discord.js";

export const data: SlashCommandBuilder = new SlashCommandBuilder()
	.setName('which-uw')
	.setDescription('Get help with picking your next ultimate weapon.');

export async function execute(interaction: ChatInputCommandInteraction) {
	await interaction.reply({ content: 'https://what-uw-should-i-pick.netlify.app/' });
}