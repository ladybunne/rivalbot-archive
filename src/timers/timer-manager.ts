import { Guild, GuildChannel, GuildMember, GuildVoiceChannelResolvable, PermissionsBitField, VoiceChannel } from 'discord.js';
import { channelTournamentTimerId, channelEventTimerId, channelMissionsTimerId } from '../configs/rivalbot-config.json';
import schedule from 'node-schedule';
import { handleError, timeUntil } from '../common';

const rolloverTime = new Date(0);
const tomorrow = new Date(rolloverTime);
const TOURNAMENT_DAYS = [2, 5];

const EVENT_START_DAY = new Date("2023-02-14");
const EVENT_ACTIVE_DAYS = 14;
const EVENT_COOLDOWN_DAYS = 7;
const EVENT_CYCLE_LENGTH = EVENT_ACTIVE_DAYS + EVENT_COOLDOWN_DAYS;

const MISSIONS_FIRST_DAY = 5;
const MISSIONS_PER_DAY = 2;
const MISSIONS_NEW_MISSION_DAYS = 7;
const MISSIONS_TOTAL = MISSIONS_FIRST_DAY + MISSIONS_PER_DAY * (MISSIONS_NEW_MISSION_DAYS);

let tournamentHours: number = -1;
let eventDay: number = -1;
let missionsHours: number = -1;

export async function start(guild: Guild) {
	const update = async () => await updateTimers(guild);
	schedule.scheduleJob("*/10 * * * *", update);
	console.log("Scheduled timers to update every ten minutes.");
	// await updateTimers(guild);
}

async function updateTimers(guild: Guild) {
	const now = new Date(Date.now());
	await updateTournamentTimer(guild, now);
	await updateEventTimer(guild, now);
	await updateMissionsTimer(guild, now);
}

async function updateTournamentTimer(guild: Guild, now: Date) {
	tomorrow.setFullYear(now.getFullYear());
	tomorrow.setMonth(now.getMonth());
	tomorrow.setDate(now.getDate() + 1);
	const hoursUntilTomorrow = Math.floor((tomorrow.getTime() - now.getTime()) / 1000 / 60 / 60);
	// const minutesUntilTomorrow = Math.floor((tomorrow.getTime() - now.getTime()) / 1000 / 60 - hoursUntilTomorrow * 60);
	if(tournamentHours != hoursUntilTomorrow) {
		const timerText = `🏆 Live, ~${hoursUntilTomorrow}h left`;
		await updateChannel(guild, channelTournamentTimerId, timerText)
			.then(_ => {
				tournamentHours = hoursUntilTomorrow;
				console.log("Updated tournament timer.")
			})
			.catch(handleError);	
	}
}

// Refactor this to take Date objects, to get per-hour granularity.
// const daysSinceEventStart = Math.floor((now.getTime() - EVENT_START_DAY.getTime()) / 1000 / 60 / 60 / 24);
function getEventTimerText(daysSinceEventStart: number, hours: number) {
	const daysWrapped = daysSinceEventStart % EVENT_CYCLE_LENGTH;
	if(daysWrapped < EVENT_ACTIVE_DAYS) {
		return `Day ${daysWrapped + 1}/${EVENT_ACTIVE_DAYS}`;
	}
	return `Next: ${EVENT_CYCLE_LENGTH - daysWrapped - 1}d ${hours}h`;
}

async function updateEventTimer(guild: Guild, now: Date) {
	const daysSinceEventStart = Math.floor((now.getTime() - EVENT_START_DAY.getTime()) / 1000 / 60 / 60 / 24);
	const hoursUntilTomorrow = Math.floor((tomorrow.getTime() - now.getTime()) / 1000 / 60 / 60);
	if(eventDay != daysSinceEventStart) {
		const timerText = `⭐ ${getEventTimerText(daysSinceEventStart, hoursUntilTomorrow)}`;
		await updateChannel(guild, channelEventTimerId, timerText)
			.then(_ => {
				eventDay = daysSinceEventStart;
				console.log("Updated event timer.")
			})
			.catch(handleError);
	}
}

export function getMissionsTimerText(daysSinceEventStart: number, hours: number) {
	const daysWrapped = daysSinceEventStart % EVENT_CYCLE_LENGTH;
	if(daysWrapped < EVENT_ACTIVE_DAYS) {
		let output = `${Math.min(MISSIONS_FIRST_DAY + MISSIONS_PER_DAY * daysWrapped, MISSIONS_TOTAL)}/${MISSIONS_TOTAL}, `;
		if(daysWrapped < MISSIONS_NEW_MISSION_DAYS) {
			return output + `next: ${hours}h`;
		}
		return output + `${hours}h left`;
	}
	return `(hidden)`;
}

async function updateMissionsTimer(guild: Guild, now: Date) {
	tomorrow.setFullYear(now.getFullYear());
	tomorrow.setMonth(now.getMonth());
	tomorrow.setDate(now.getDate() + 1);
	const daysSinceEventStart = Math.floor((now.getTime() - EVENT_START_DAY.getTime()) / 1000 / 60 / 60 / 24);
	const hoursUntilTomorrow = Math.floor((tomorrow.getTime() - now.getTime()) / 1000 / 60 / 60);
	// const minutesUntilTomorrow = Math.floor((tomorrow.getTime() - now.getTime()) / 1000 / 60 - hoursUntilTomorrow * 60);
	if(missionsHours != hoursUntilTomorrow) {
		const timerText = `🏅 ${getMissionsTimerText(daysSinceEventStart, hoursUntilTomorrow)}`;
		const daysWrapped = daysSinceEventStart % EVENT_CYCLE_LENGTH;
		await updateChannel(guild, channelMissionsTimerId, timerText, daysWrapped < EVENT_ACTIVE_DAYS)
			.then(_ => {
				missionsHours = hoursUntilTomorrow;
				console.log("Updated missions timer.");
			})
			.catch(handleError);	
	}
}

async function updateChannel(guild: Guild, channelId: string, name: string, visible: boolean = true) {
	const channel: VoiceChannel = guild.channels.cache.get(channelId) as VoiceChannel;
	await channel.setName(name)
		.then(channel => {})
		.catch(handleError);
	await channel.permissionOverwrites.edit(channel.guild.roles.everyone, { ViewChannel: visible })
}
