import { SlashCommandBuilder, CommandInteraction, InteractionResponse, ChatInputCommandInteraction, DataResolver, EmbedBuilder } from "discord.js";
import * as coinsManager from "../coins/coins-manager"
import { channelCoinsLeaderboardId } from '../configs/rivalbot-config.json'
import * as rivalManager from "../rivals/rival-manager";

export const data = new SlashCommandBuilder()
	.setName('lifetime-coins')
	.setDescription('Update your lifetime coins.')
	.addStringOption(option =>
		option.setName("coins")
			.setDescription("The exact string your game shows your lifetime coins as (e.g. 272.56B).")
			.setRequired(true))

export async function execute(interaction: ChatInputCommandInteraction) {
	await interaction.deferReply({ ephemeral: true });

	const coins = interaction.options.getString("coins");

	let outcome: string;
	let outcomeSuccess = true;

	await coinsManager.update(interaction.user.id, coins, interaction.createdTimestamp, interaction.guild)
		.then((updateOutcome) => {
			if(updateOutcome) {
				outcome = `Success! Lifetime coins updated.\n` +
					`See the leaderboard channel here: <#${channelCoinsLeaderboardId}>`
			}
			else {
				outcome = `Failure. Lifetime coins not updated.\n\n` +
					`**Reason**: The coins manager refused the data. Please double-check your data is correct and try again.`;
				outcomeSuccess = false;
			}	
		})
		.catch((error) => {
			outcome = `Failure. Lifetime coins not updated.\n\n` +
				`**Reason**: ${error}`;
			outcomeSuccess = false;
			console.error(error);
		});

	const description = `**User**: ${interaction.user.username} / ${interaction.user}\n` +
		`**Coins**: ${coins}\n\n` +
		`**Outcome**: ${outcome}`;

	const embed = new EmbedBuilder()
		.setColor(outcomeSuccess ? "Green" : "Red")
		.setTitle('Lifetime Coins Update')
		.setDescription(description)
		.setTimestamp()
		.setFooter({ text: 'This is a work in progress. Please expect bugs.' });

	await interaction.editReply({ embeds: [embed] });

	// Update Rival Card.
	await rivalManager.createOrUpdateRivalCard(interaction.user.id, interaction.guild);
}
