import { ChatInputCommandInteraction, SlashCommandBuilder, User } from "discord.js";
import * as rivalManager from "../rivals/rival-manager";

export const data = new SlashCommandBuilder()
	.setName('rival-card')
	.setDescription('Post a rival card.')
	.addUserOption(option =>
		option.setName("user")
			.setDescription("Which user to post the rival card for."));

export async function execute(interaction: ChatInputCommandInteraction) {
	await interaction.deferReply({ ephemeral: false });

	const rival: User = interaction.options.getUser("user") ?? interaction.user;

	// const rivalCard = await rivalManager.rivalCard(rival.id, interaction.guild);

	await rivalManager.createOrUpdateRivalCard(rival.id, interaction.guild);
	
	await interaction.followUp({ content: `Done.` });
}