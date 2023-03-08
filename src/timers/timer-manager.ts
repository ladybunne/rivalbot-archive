import { Guild, VoiceChannel } from 'discord.js';
import { channelTournamentTimerId, channelEventTimerId, channelMissionsTimerId } from '../configs/rivalbot-config.json';
import schedule from 'node-schedule';
import { handleError } from '../common';

// Setting this to "new Date(0)" introduces an hour of error.
// I have no idea why, time code is just like that.
const rolloverTime = new Date("2000-01-01");
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

export function test() {
	const now = new Date(Date.now());
	
	const tomorrow = new Date(rolloverTime);

	tomorrow.setFullYear(now.getFullYear());
	tomorrow.setMonth(now.getMonth());
	tomorrow.setDate(now.getDate() + 1);
	const untilTomorrow = timeUntil(now, tomorrow);

	const untilNextTournamentStart = timeUntilNextTournamentStart(now);
	const untilNextTournamentEnd = timeUntilNextTournamentEnd(now);
	const sinceLastEventStart = timeSinceLastEventStart(now);
	const untilNextEventEnd = timeUntilNextEventEnd(now);
	const untilNextEventStart = timeUntilNextEventStart(now);

	console.log(
		`untilTomorrow: ${untilTomorrow.text()}\n` +
		`untilNextTournamentStart: ${untilNextTournamentStart.text()}\n` +
		`untilNextTournamentEnd: ${untilNextTournamentEnd.text()}\n` +
		`sinceLastEventStart: ${sinceLastEventStart.text()}\n` +
		`untilNextEventEnd: ${untilNextEventEnd.text()}\n` +
		`untilNextEventStart: ${untilNextEventStart.text()}`
	);

	console.log(
		`rolloverTime: ${rolloverTime.toString()}\n` +
		`now: ${now.toString()}\n` +
		`tomorrow: ${tomorrow.toString()}\n`
	);
}

async function updateTimers(guild: Guild) {
	const now = new Date(Date.now());
	
	const tomorrow = new Date(rolloverTime);
	tomorrow.setFullYear(now.getFullYear());
	tomorrow.setMonth(now.getMonth());
	tomorrow.setDate(now.getDate() + 1);
	const untilTomorrow = timeUntil(now, tomorrow);

	const untilNextTournamentStart = timeUntilNextTournamentStart(now);
	const untilNextTournamentEnd = timeUntilNextTournamentEnd(now);
	const sinceLastEventStart = timeSinceLastEventStart(now);
	const untilNextEventEnd = timeUntilNextEventEnd(now);
	const untilNextEventStart = timeUntilNextEventStart(now);

	await updateTournamentTimer(guild, untilNextTournamentStart, untilNextTournamentEnd);
	await updateEventTimer(guild, sinceLastEventStart, untilNextEventStart);
	await updateMissionsTimer(guild, sinceLastEventStart, untilTomorrow, untilNextEventEnd);
}

type Duration = {
	days: number,
	hours: number,
	text: () => string
}

// Add conditional hiding of days if days == 0. (Probably make this the default.)
// Add optional force-to-days-granularity (hide hours) if days >= 1.
function timeUntil(from: Date, until: Date): Duration {
	const difference = until.getTime() - from.getTime();
	const days = Math.floor(difference / 1000 / 60 / 60 / 24);
	const hours = Math.floor(difference / 1000 / 60 / 60) % 24;
	return { days: days, hours: hours, text: () => `${days}d ${hours}h`};
}

// We'll need a "timeUntilNextTournamentStart" and probably a "timeUntilNextTournamentEnd".

function timeUntilNextTournamentStart(now: Date): Duration {
	const dayOfWeek = now.getDay();

	const daysUntilNextTournamentDay = TOURNAMENT_DAYS.reduce((acc, curr) => {
		return dayOfWeek - curr < acc && dayOfWeek - curr >= 0 ? dayOfWeek - curr : acc 
	}, Number.MAX_SAFE_INTEGER)

	const nextTournamentStart = new Date(rolloverTime);

	nextTournamentStart.setFullYear(now.getFullYear());
	nextTournamentStart.setMonth(now.getMonth());
	nextTournamentStart.setDate(now.getDate() + 1 + daysUntilNextTournamentDay);

	return timeUntil(now, nextTournamentStart);
}

function timeUntilNextTournamentEnd(now: Date): Duration {
	const dayOfWeek = now.getDay();

	const daysUntilNextTournamentDay = TOURNAMENT_DAYS.reduce((acc, curr) => {
		return dayOfWeek - curr + 1 < acc && dayOfWeek - curr + 1 >= 0 ? dayOfWeek - curr + 1 : acc 
	}, Number.MAX_SAFE_INTEGER)

	const nextTournamentEnd = new Date(rolloverTime);

	nextTournamentEnd.setFullYear(now.getFullYear());
	nextTournamentEnd.setMonth(now.getMonth());
	nextTournamentEnd.setDate(now.getDate() + 1 + daysUntilNextTournamentDay);

	return timeUntil(now, nextTournamentEnd);
}

function timeSinceLastEventStart(now: Date): Duration {
	const currentEventDay = timeUntil(EVENT_START_DAY, now).days % EVENT_CYCLE_LENGTH;
	const lastEventStart = new Date(rolloverTime);
	lastEventStart.setFullYear(now.getFullYear());
	lastEventStart.setMonth(now.getMonth());
	lastEventStart.setDate(now.getDate() - currentEventDay);
	return timeUntil(lastEventStart, now);
}

function timeUntilNextEventEnd(now: Date): Duration {
	const currentEventDay = timeUntil(EVENT_START_DAY, now).days % EVENT_CYCLE_LENGTH;
	const nextEventEnd = new Date(rolloverTime);
	
	let day = EVENT_ACTIVE_DAYS - currentEventDay;
	if(day < 0) day += EVENT_CYCLE_LENGTH;

	nextEventEnd.setFullYear(now.getFullYear());
	nextEventEnd.setMonth(now.getMonth());
	nextEventEnd.setDate(now.getDate() + day);
	return timeUntil(now, nextEventEnd);
}

function timeUntilNextEventStart(now: Date): Duration {
	const currentEventDay = timeUntil(EVENT_START_DAY, now).days % EVENT_CYCLE_LENGTH;
	const nextEventStart = new Date(rolloverTime);
	nextEventStart.setFullYear(now.getFullYear());
	nextEventStart.setMonth(now.getMonth());
	nextEventStart.setDate(now.getDate() + (EVENT_CYCLE_LENGTH - currentEventDay));
	return timeUntil(now, nextEventStart);
}

function getTournamentTimerText(untilNextTournamentStart: Duration, untilNextTournamentEnd: Duration) {
	if(untilNextTournamentStart.days < untilNextTournamentEnd.days) {
		return `Next: ${untilNextTournamentStart.text()}`;
	}
	return `Open, ${untilNextTournamentEnd.text()} left`;
}

async function updateTournamentTimer(guild: Guild, untilNextTournamentStart: Duration, untilNextTournamentEnd: Duration) {
	if(tournamentHours != untilNextTournamentStart.hours) {
		const timerText = `🏆 ${getTournamentTimerText(untilNextTournamentStart, untilNextTournamentEnd)}`;
		await updateChannel(guild, channelTournamentTimerId, timerText)
			.then(_ => {
				tournamentHours = untilNextTournamentStart.hours;
				console.log("Updated tournament timer.")
			})
			.catch(handleError);	
	}
}

function getEventTimerText(sinceLastEventStart: Duration, untilNextEventStart: Duration) {
	if(sinceLastEventStart.days < EVENT_ACTIVE_DAYS) {
		return `Day ${sinceLastEventStart.days + 1}/${EVENT_ACTIVE_DAYS}`;
	}
	return `Next: ${untilNextEventStart.text()}`;
}

async function updateEventTimer(guild: Guild, sinceLastEventStart: Duration, untilNextEventStart: Duration) {
	if(eventDay != sinceLastEventStart.days) {
		const timerText = `⭐ ${getEventTimerText(sinceLastEventStart, untilNextEventStart)}`;
		await updateChannel(guild, channelEventTimerId, timerText)
			.then(_ => {
				eventDay = sinceLastEventStart.days;
				console.log("Updated event timer.")
			})
			.catch(handleError);
	}
}

export function getMissionsTimerText(sinceLastEventStart: Duration, untilTomorrow: Duration, untilNextEventEnd: Duration) {
	if(sinceLastEventStart.days < EVENT_ACTIVE_DAYS) {
		const currentMissions = Math.min(MISSIONS_FIRST_DAY + MISSIONS_PER_DAY * sinceLastEventStart.days, MISSIONS_TOTAL);
		const missionsDisplay = `${currentMissions}/${MISSIONS_TOTAL}, `;
		if(sinceLastEventStart.days < MISSIONS_NEW_MISSION_DAYS) {
			return missionsDisplay + `next: ${untilTomorrow.text()}`;
		}
		return missionsDisplay + `${untilNextEventEnd.text()} left`;
	}
	return `(hidden)`;
}

async function updateMissionsTimer(guild: Guild, sinceLastEventStart: Duration, untilTomorrow: Duration, untilNextEventEnd: Duration) {
	if(missionsHours != untilTomorrow.hours) {
		const timerText = `🏅 ${getMissionsTimerText(sinceLastEventStart, untilTomorrow, untilNextEventEnd)}`;
		await updateChannel(guild, channelMissionsTimerId, timerText, sinceLastEventStart.days < EVENT_ACTIVE_DAYS)
			.then(_ => {
				missionsHours = untilTomorrow.hours;
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
