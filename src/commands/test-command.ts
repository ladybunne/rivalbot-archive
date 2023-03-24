import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { DateTime } from "luxon";
import * as rivalManager from "../rivals/rival-manager";
import * as timerManager from "../timers/timer-manager";

export const data = new SlashCommandBuilder()
	.setName('test-command')
	.setDescription('Test some unfinished functionality.');

export async function execute(interaction: ChatInputCommandInteraction) {
	await interaction.deferReply({ ephemeral: true });

	const now = DateTime.now();
	
	const untilNextRollover = timerManager.nextRollover(now);

	const untilNextTournamentStart = timerManager.nextTournamentStart(now);
	const untilNextTournamentEnd = timerManager.nextTournamentEnd(now);
	const sinceLastEventStart = timerManager.lastEventStart(now);
	const untilNextEventEnd = timerManager.nextEventEnd(now);
	const untilNextEventStart = timerManager.nextEventStart(now);

	const tournamentText = timerManager.getTournamentTimerText(untilNextTournamentStart, untilNextTournamentEnd);
	const eventText = timerManager.getEventTimerText(sinceLastEventStart, untilNextEventStart);
	const missionsText = timerManager.getMissionsTimerText(sinceLastEventStart, untilNextRollover, untilNextEventEnd);

	console.log(tournamentText, eventText, missionsText);

	await interaction.editReply({ content: `This command does nothing yet... or does it?` });
}