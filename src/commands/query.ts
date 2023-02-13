import { SlashCommandBuilder, CommandInteraction, InteractionResponse, ChatInputCommandInteraction } from "discord.js";

export const data: SlashCommandBuilder = new SlashCommandBuilder()
	.setName('query')
	.setDescription('Query the rabbit.');

export async function execute(interaction: ChatInputCommandInteraction) {
	await interaction.reply({ content: 'Querying the rabbit is not yet implemented.', ephemeral: true });
}