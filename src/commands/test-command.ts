import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import * as rivalManager from "../rivals/rival-manager";

export const data = new SlashCommandBuilder()
	.setName('test-command')
	.setDescription('Test some unfinished functionality.');

export async function execute(interaction: ChatInputCommandInteraction) {
	await interaction.deferReply({ ephemeral: false });

	const rivalCard = await rivalManager.rivalCard(interaction.guild, interaction.user.id);
	if(rivalCard) {
		await interaction.editReply({ embeds: [rivalCard] });
	}
	else {
		await interaction.editReply({ content: `Rival card failed for some reason.` });
	}
}