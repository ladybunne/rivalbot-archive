import { Guild, VoiceChannel } from 'discord.js';
import { channelTournamentTimerId, channelEventTimerId, channelMissionsTimerId } from '../configs/rivalbot-config.json';
import schedule from 'node-schedule';
import { handleError } from '../common';
import { DateTime, Duration, Interval } from 'luxon';

// Rewrite this whoooooooole thing with Luxon.

// Setting this to "new Date(0)" introduces an hour of error.
// I have no idea why, time code is just like that.
const ROLLOVER_TIME: DateTime = DateTime.fromObject({ hour: 0 }, { zone: "utc" });
const TOURNAMENT_DAYS = [2, 5];

const EVENT_START_DAY = DateTime.utc(2023, 2, 14);
const EVENT_ACTIVE_DAYS = Duration.fromObject({ days: 14 });
const EVENT_COOLDOWN_DAYS = Duration.fromObject({ days: 7 });
export const EVENT_CYCLE_LENGTH = EVENT_ACTIVE_DAYS.plus(EVENT_COOLDOWN_DAYS);

const MISSIONS_FIRST_DAY = 5;
const MISSIONS_PER_DAY = 2;
const MISSIONS_NEW_MISSION_DAYS = Duration.fromObject({ days: 7 });
const MISSIONS_TOTAL = MISSIONS_FIRST_DAY + MISSIONS_PER_DAY * (MISSIONS_NEW_MISSION_DAYS.days);

const FORMAT_STRING = "d'd' h'h";

let tournamentHours = -1;
let eventDay = -1;
let missionsHours = -1;

export function start(guild: Guild) {
	const update = async () => await updateTimers(guild);
	schedule.scheduleJob("*/10 * * * *", update);
	console.log("Scheduled timers to update every ten minutes.");
	// await updateTimers(guild);
}

/*
function oldTest() {
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
*/

export function test() {
	console.log(ROLLOVER_TIME.toISOTime(),
		nextRollover(DateTime.now()).toDuration().toHuman({ unitDisplay: "short" }));
}

async function updateChannel(guild: Guild, channelId: string, name: string, visible = true) {
	const channel: VoiceChannel = guild.channels.cache.get(channelId) as VoiceChannel;
	await channel.setName(name)
		.then(() => console.log(`Set channel name to ${name}.`))
		.catch(handleError);
	await channel.permissionOverwrites.edit(channel.guild.roles.everyone, { ViewChannel: visible })
}

function formatIntervalToDuration(interval: Interval): string {
	return interval.toDuration().toFormat(FORMAT_STRING, { floor: true });
}

export function nextRollover(now: DateTime): Interval {
	const rolloverToday: DateTime = ROLLOVER_TIME.set({ year: now.year, month: now.month, day: now.day });
	return Interval.fromDateTimes(now, (rolloverToday > now ? rolloverToday : rolloverToday.plus({ days: 1 })));
}

function currentMissionCount(sinceLastEventStart: Interval): number {
	if(sinceLastEventStart.toDuration() > EVENT_ACTIVE_DAYS) return 0;
	return Math.min(MISSIONS_FIRST_DAY + MISSIONS_PER_DAY * sinceLastEventStart.toDuration().days, MISSIONS_TOTAL);
}

// We'll need a "timeUntilNextTournamentStart" and probably a "timeUntilNextTournamentEnd".

/** Find the time until the next rollover on Wednesday or Saturday. */
export function nextTournamentStart(now: DateTime): Interval {
	return nextRollover(now);
}

/** Find the time until the next rollover on Thursday or Sunday. */
export function nextTournamentEnd(now: DateTime): Interval {
	return nextRollover(now);
}

/** Find the time since the last rollover on an event start date. */
export function lastEventStart(now: DateTime): Interval {
	return nextRollover(now);
}

/** Find the time until the next rollover on an event end date. */
export function nextEventEnd(now: DateTime): Interval {
	return nextRollover(now);
}

/** Find the time until the next rollover on an event start date. */
export function nextEventStart(now: DateTime): Interval {
	return nextRollover(now);
}

function getTournamentTimerText(untilNextTournamentStart: Interval, untilNextTournamentEnd: Interval) {
	if(untilNextTournamentStart < untilNextTournamentEnd) {
		return `Next: ${formatIntervalToDuration(untilNextTournamentStart)}`;
	}
	return `Open, ${formatIntervalToDuration(untilNextTournamentEnd)} left`;
}

async function updateTournamentTimer(guild: Guild, untilNextTournamentStart: Interval, untilNextTournamentEnd: Interval) {
	if(tournamentHours != untilNextTournamentStart.toDuration().hours) {
		const timerText = `🏆 ${getTournamentTimerText(untilNextTournamentStart, untilNextTournamentEnd)}`;
		await updateChannel(guild, channelTournamentTimerId, timerText)
			.then(_ => {
				tournamentHours = untilNextTournamentStart.toDuration().hours;
				console.log("Updated tournament timer.")
			})
			.catch(handleError);	
	}
}

function getEventTimerText(sinceLastEventStart: Interval, untilNextEventStart: Interval) {
	if(sinceLastEventStart.toDuration() < EVENT_ACTIVE_DAYS) {
		return `Day ${sinceLastEventStart.toDuration().days + 1}/${EVENT_ACTIVE_DAYS.days}`;
	}
	return `Next: ${formatIntervalToDuration(untilNextEventStart)}`;
}

async function updateEventTimer(guild: Guild, sinceLastEventStart: Interval, untilNextEventStart: Interval) {
	if(eventDay != sinceLastEventStart.toDuration().days) {
		const timerText = `⭐ ${getEventTimerText(sinceLastEventStart, untilNextEventStart)}`;
		await updateChannel(guild, channelEventTimerId, timerText)
			.then(() => {
				eventDay = sinceLastEventStart.toDuration().days;
				console.log("Updated event timer.")
			})
			.catch(handleError);
	}
}

export function getMissionsTimerText(sinceLastEventStart: Interval, untilTomorrow: Interval, untilNextEventEnd: Interval) {
	if(sinceLastEventStart.toDuration() < EVENT_ACTIVE_DAYS) {
		const currentMissions = currentMissionCount(sinceLastEventStart);
		const missionsDisplay = `${currentMissions}/${MISSIONS_TOTAL}, `;
		if(sinceLastEventStart.toDuration() < MISSIONS_NEW_MISSION_DAYS) {
			return missionsDisplay + `next: ${formatIntervalToDuration(untilTomorrow)}`;
		}
		return missionsDisplay + `${formatIntervalToDuration(untilNextEventEnd)} left`;
	}
	return `(hidden)`;
}

async function updateMissionsTimer(guild: Guild, sinceLastEventStart: Interval, untilTomorrow: Interval, untilNextEventEnd: Interval) {
	if(missionsHours != untilTomorrow.toDuration().hours) {
		const timerText = `🏅 ${getMissionsTimerText(sinceLastEventStart, untilTomorrow, untilNextEventEnd)}`;
		await updateChannel(guild, channelMissionsTimerId, timerText, sinceLastEventStart.toDuration() < EVENT_ACTIVE_DAYS)
			.then(() => {
				missionsHours = untilTomorrow.toDuration().hours;
				console.log("Updated missions timer.");
			})
			.catch(handleError);	
	}
}

async function updateTimers(guild: Guild) {
	const now = DateTime.now();
	
	const untilNextRollover = nextRollover(now);

	const untilNextTournamentStart = nextTournamentStart(now);
	const untilNextTournamentEnd = nextTournamentEnd(now);
	const sinceLastEventStart = lastEventStart(now);
	const untilNextEventEnd = nextEventEnd(now);
	const untilNextEventStart = nextEventStart(now);

	await updateTournamentTimer(guild, untilNextTournamentStart, untilNextTournamentEnd);
	await updateEventTimer(guild, sinceLastEventStart, untilNextEventStart);
	await updateMissionsTimer(guild, sinceLastEventStart, untilNextRollover, untilNextEventEnd);
}