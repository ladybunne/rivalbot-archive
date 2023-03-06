import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import * as rivalManager from "../rivals/rival-manager";
import * as timerManager from "../timers/timer-manager";

export const data = new SlashCommandBuilder()
	.setName('test-command')
	.setDescription('Test some unfinished functionality.');

export async function execute(interaction: ChatInputCommandInteraction) {
	await interaction.deferReply({ ephemeral: true });

	[...Array(22).keys()].map((number) => console.log(`Day ${number + 1} => 🏅 ${timerManager.getMissionsTimerText(number, 5)}`));

	await interaction.editReply({ content: `This command does nothing yet... or does it?` });
}