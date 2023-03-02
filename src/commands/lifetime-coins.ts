import { SlashCommandBuilder, CommandInteraction, InteractionResponse, ChatInputCommandInteraction, DataResolver } from "discord.js";
import * as coinManager from "../coins/coins-manager"
import { channelCoinsLeaderboard } from '../configs/rivalbot-config.json'


export const data = new SlashCommandBuilder()
	.setName('lifetime-coins')
	.setDescription('Update your lifetime coins.')
	.addStringOption(option =>
		option.setName("coins")
			.setDescription("The exact string your game shows your lifetime coins as (e.g. 272.56B).")
			.setRequired(true))

export async function execute(interaction: ChatInputCommandInteraction) {
	await interaction.deferReply({ ephemeral: true });

	const timestamp = interaction.createdTimestamp;
	const timestampPrettyText = new Date(timestamp).toString();
	let response: string;

	// Refactor this, it's garbage.
	coinManager.update(interaction.user.id, interaction.options.getString("coins"), interaction.createdTimestamp, interaction.guild)
		.then(async (outcome) => {
			if(outcome) {
				response = `User <@${interaction.user.id}> submitted \`${interaction.options.getString("coins")}\` coins at ${timestampPrettyText}.` +
					`\n\nSee the leaderboard channel here: <#${channelCoinsLeaderboard}>`;
				await interaction.editReply({ content: response });
			}
			else {
				response = `User <@${interaction.user.id}> failed to submit \`${interaction.options.getString("coins")}\` coins at ${timestampPrettyText}.` +
					`\n\nCheck the format of your submission and try again.`;
				await interaction.editReply({ content: response });
			}
		});
}