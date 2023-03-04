import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";

export const data = new SlashCommandBuilder()
	.setName('test-command')
	.setDescription('Test some unfinished functionality.');

export async function execute(interaction: ChatInputCommandInteraction) {
	await interaction.reply({ content: "Hi! I don't do anything right now.", ephemeral: true });
}