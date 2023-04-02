import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { DateTime } from "luxon";
import * as coinsManager from "../coins/coins-manager";
import * as rivalManager from "../rivals/rival-manager";
import * as timerManager from "../timers/timer-manager";

export const data = new SlashCommandBuilder()
	.setName('test-command')
	.setDescription('Test some unfinished functionality.');

export async function execute(interaction: ChatInputCommandInteraction) {
	await interaction.deferReply({ ephemeral: true });

	await coinsManager.sendDummyOvertakeEmbeds(interaction.guild);

	await interaction.followUp({ content: `This is an ephemeral response.` });
	await interaction.followUp({ content: `This is a follow-up to an initial ephemeral response.` })
}