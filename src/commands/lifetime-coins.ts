import { SlashCommandBuilder, CommandInteraction, InteractionResponse, ChatInputCommandInteraction, DataResolver } from "discord.js";
import * as coinsManager from "../coins/coins-manager"
import { channelCoinsLeaderboardId } from '../configs/rivalbot-config.json'


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
	coinsManager.update(interaction.user.id, interaction.options.getString("coins"), interaction.createdTimestamp, interaction.guild)
		.then(async (outcome) => {
			if(outcome) {
				response = `User <@${interaction.user.id}> submitted \`${interaction.options.getString("coins")}\` coins at ${timestampPrettyText}.` +
					`\n\nSee the leaderboard channel here: <#${channelCoinsLeaderboardId}>`;
				await interaction.editReply({ content: response });
			}
			else {
				response = `User <@${interaction.user.id}> failed to submit \`${interaction.options.getString("coins")}\` coins at ${timestampPrettyText}.` +
					`\n\nCheck the format of your submission and try again.`;
				await interaction.editReply({ content: response });
			}
		});
}