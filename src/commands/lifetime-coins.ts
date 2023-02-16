import { SlashCommandBuilder, CommandInteraction, InteractionResponse, ChatInputCommandInteraction, DataResolver } from "discord.js";
import * as coinManager from "../lifetime-coins/lifetime-coins-manager"


export const data = new SlashCommandBuilder()
	.setName('lifetime-coins')
	.setDescription('Update your lifetime coins.')
	.addStringOption(option =>
		option.setName("coins")
			.setDescription("The exact string your game shows your lifetime coins as (e.g. 272.56B).")
			.setRequired(true))
	.addBooleanOption(option =>
		option.setName("ephemeral")
			.setDescription("Ephemeral messages are only visible to the sender. (Default: true)."));

export async function execute(interaction: ChatInputCommandInteraction) {
	await interaction.deferReply({ ephemeral: interaction.options.getBoolean('ephemeral') ?? true });

	const timestamp = interaction.createdTimestamp;
	const timestampPrettyText = new Date(timestamp).toString();
	await coinManager.update(interaction.user.id, interaction.options.getString("coins"), interaction.createdTimestamp);
	await interaction.editReply({ content: `User <@${interaction.user.id}> submitted \`${interaction.options.getString("coins")}\` coins at ${timestampPrettyText}.` });
}