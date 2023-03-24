import { Guild, VoiceChannel } from 'discord.js';
import { channelTournamentTimerId, channelEventTimerId, channelMissionsTimerId } from '../configs/rivalbot-config.json';
import schedule from 'node-schedule';
import { handleError } from '../common';
import { DateTime, Duration, Interval, WeekdayNumbers } from 'luxon';

const ROLLOVER_TIME: DateTime = DateTime.fromObject({ hour: 0 }, { zone: "utc" });

// one-indexed because WeekdayNumbers are also one-indexed
const TOURNAMENT_DAYS = [3, 6];

const EVENT_START_DAY = DateTime.utc(2023, 2, 14);
const EVENT_ACTIVE_DAYS = Duration.fromObject({ days: 14 });
const EVENT_COOLDOWN_DAYS = Duration.fromObject({ days: 7 });
export const EVENT_CYCLE_LENGTH = EVENT_ACTIVE_DAYS.plus(EVENT_COOLDOWN_DAYS);

const MISSIONS_FIRST_DAY = 5;
const MISSIONS_PER_DAY = 2;
const MISSIONS_NEW_MISSION_DAYS = Duration.fromObject({ days: 7 });
const MISSIONS_TOTAL = MISSIONS_FIRST_DAY + MISSIONS_PER_DAY * (MISSIONS_NEW_MISSION_DAYS.days);

const FORMAT_STRING = "d'd' h'h";
const FORMAT_STRING_LESS_THAN_DAY = "h'h"

let tournamentHours = -1;
let eventDay = -1;
let missionsHours = -1;

export function start(guild: Guild) {
	const update = async () => await updateTimers(guild);
	schedule.scheduleJob("*/10 * * * *", update);
	console.log("Scheduled timers to update every ten minutes.");
	// await updateTimers(guild);
}

async function updateChannel(guild: Guild, channelId: string, name: string, visible = true) {
	const channel: VoiceChannel = guild.channels.cache.get(channelId) as VoiceChannel;
	await channel.setName(name)
		.then(() => console.log(`Set channel name to ${name}.`))
		.catch(handleError);
	await channel.permissionOverwrites.edit(channel.guild.roles.everyone, { ViewChannel: visible })
}

export function formatIntervalToDuration(interval: Interval): string {
	if(interval.toDuration('days').days < 1) {
		return interval.toDuration('hours').toFormat(FORMAT_STRING_LESS_THAN_DAY, { floor: true }); 
	}
	return interval.toDuration(['days', 'hours']).toFormat(FORMAT_STRING, { floor: true });
}

export function nextRollover(now: DateTime): Interval {
	const rolloverToday: DateTime = ROLLOVER_TIME.set({ year: now.year, month: now.month, day: now.day });
	return Interval.fromDateTimes(now, (rolloverToday > now ? rolloverToday : rolloverToday.plus({ days: 1 })));
}

export function lastRollover(now: DateTime): Interval {
	return Interval.fromDateTimes(nextRollover(now).end.minus({ days: 1 }), now);
}

function currentMissionCount(sinceLastEventStart: Interval): number {
	if(sinceLastEventStart.toDuration() > EVENT_ACTIVE_DAYS) return 0;
	return Math.min(MISSIONS_FIRST_DAY + MISSIONS_PER_DAY * sinceLastEventStart.toDuration('days').days, MISSIONS_TOTAL);
}

/** Find the time until the next rollover on Wednesday or Saturday. */
export function nextTournamentStart(now: DateTime): Interval {
	const rollover = nextRollover(now);
	
	const dayDifference = TOURNAMENT_DAYS.reduce((acc, curr) => {
		let difference = curr - rollover.end.weekday;
		if(difference < 0) difference += 7;
		return difference < acc ? difference : acc;
	}, 7);	

	return rollover.set({ end: rollover.end.plus({ days: dayDifference }) });
}

/** Find the time until the next rollover on Thursday or Sunday. */
export function nextTournamentEnd(now: DateTime): Interval {
	const rollover = nextRollover(now);
	
	const dayDifference = TOURNAMENT_DAYS.reduce((acc, curr) => {
		let difference = curr + 1 - rollover.end.weekday;
		if(difference < 0) difference += 7;
		return difference < acc ? difference : acc;
	}, 7);	

	return rollover.set({ end: rollover.end.plus({ days: dayDifference }) });
}

/** Find the time since the last rollover on an event start date. */
export function lastEventStart(now: DateTime): Interval {
	const rollover = nextRollover(now);

	const intervalSinceEventStartDay = Interval.fromDateTimes(EVENT_START_DAY, now);

	const dayDifference = Math.floor(intervalSinceEventStartDay.toDuration('days').days % EVENT_CYCLE_LENGTH.days);

	return Interval.fromDateTimes(rollover.end.minus({ days: dayDifference }), now);
}

/** Find the time until the next rollover on an event start date. */
export function nextEventStart(now: DateTime): Interval {
	const rollover = nextRollover(now);

	const intervalSinceEventStartDay = Interval.fromDateTimes(EVENT_START_DAY, now);

	const dayDifference = Math.floor(EVENT_CYCLE_LENGTH.days - intervalSinceEventStartDay.toDuration('days').days % EVENT_CYCLE_LENGTH.days);

	return rollover.set({ end: rollover.end.plus({ days: dayDifference }) });
	// return Interval.fromDateTimes(now, rollover.start.plus({ days: days }));
}

/** Find the time until the next rollover on an event end date. */
export function nextEventEnd(now: DateTime): Interval {
	const rollover = nextRollover(now);

	const intervalSinceEventStartDay = Interval.fromDateTimes(EVENT_START_DAY, now);

	let dayDifference = Math.floor(EVENT_ACTIVE_DAYS.days - intervalSinceEventStartDay.toDuration('days').days % EVENT_CYCLE_LENGTH.days);
	if(dayDifference < 0) dayDifference += EVENT_CYCLE_LENGTH.days;

	return rollover.set({ end: rollover.end.plus({ days: dayDifference }) });
	// return Interval.fromDateTimes(now, rollover.start.plus({ days: dayDifference }));
}

export function getTournamentTimerText(untilNextTournamentStart: Interval, untilNextTournamentEnd: Interval) {
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

export function getEventTimerText(sinceLastEventStart: Interval, untilNextEventStart: Interval) {
	if(sinceLastEventStart.toDuration() < EVENT_ACTIVE_DAYS) {
		return `Day ${sinceLastEventStart.toDuration('days').days + 1}/${EVENT_ACTIVE_DAYS.days}`;
	}
	return `Next: ${formatIntervalToDuration(untilNextEventStart)}`;
}

async function updateEventTimer(guild: Guild, sinceLastEventStart: Interval, untilNextEventStart: Interval) {
	if(eventDay != sinceLastEventStart.toDuration('days').days) {
		const timerText = `⭐ ${getEventTimerText(sinceLastEventStart, untilNextEventStart)}`;
		await updateChannel(guild, channelEventTimerId, timerText)
			.then(() => {
				eventDay = sinceLastEventStart.toDuration('days').days;
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