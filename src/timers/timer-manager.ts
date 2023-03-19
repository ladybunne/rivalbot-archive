import { Guild, VoiceChannel } from 'discord.js';
import { channelTournamentTimerId, channelEventTimerId, channelMissionsTimerId } from '../configs/rivalbot-config.json';
import schedule from 'node-schedule';
import { handleError } from '../common';
import { DateTime, Duration } from 'luxon';

// Rewrite this whoooooooole thing with Luxon.

// Setting this to "new Date(0)" introduces an hour of error.
// I have no idea why, time code is just like that.
const ROLLOVER_TIME: DateTime = DateTime.fromObject({ hour: 0 }, { zone: "utc" });
const TOURNAMENT_DAYS = [2, 5];

const EVENT_START_DAY = DateTime.utc(2023, 2, 14);
const EVENT_ACTIVE_DAYS = Duration.fromObject({ days: 14 });
const EVENT_COOLDOWN_DAYS = Duration.fromObject({ days: 7 });
const EVENT_CYCLE_LENGTH = EVENT_ACTIVE_DAYS.plus(EVENT_COOLDOWN_DAYS);

const MISSIONS_FIRST_DAY = 5;
const MISSIONS_PER_DAY = 2;
const MISSIONS_NEW_MISSION_DAYS = 7;
const MISSIONS_TOTAL = MISSIONS_FIRST_DAY + MISSIONS_PER_DAY * (MISSIONS_NEW_MISSION_DAYS);

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
		nextRollover(DateTime.now()).diffNow(['days', 'hours']).toHuman({ unitDisplay: "short" }));
}

async function updateChannel(guild: Guild, channelId: string, name: string, visible = true) {
	const channel: VoiceChannel = guild.channels.cache.get(channelId) as VoiceChannel;
	await channel.setName(name)
		.then(() => console.log(`Set channel name to ${name}.`))
		.catch(handleError);
	await channel.permissionOverwrites.edit(channel.guild.roles.everyone, { ViewChannel: visible })
}

type OldDuration = {
	days: number,
	hours: number,
	text: () => string
}

// Add conditional hiding of days if days == 0. (Probably make this the default.)
// Add optional force-to-days-granularity (hide hours) if days >= 1.
function timeUntil(from: Date, until: Date): OldDuration {
	const difference = until.getTime() - from.getTime();
	const days = Math.floor(difference / 1000 / 60 / 60 / 24);
	const hours = Math.floor(difference / 1000 / 60 / 60) % 24;
	return { days: days, hours: hours, text: () => `${days}d ${hours}h`};
}

function nextRollover(now: DateTime): DateTime {
	const rolloverToday: DateTime = ROLLOVER_TIME.set({ year: now.year, month: now.month, day: now.day });
	return rolloverToday > now ? rolloverToday : rolloverToday.plus({ days: 1 });
}

// We'll need a "timeUntilNextTournamentStart" and probably a "timeUntilNextTournamentEnd".

/** Find the time until the next rollover on Wednesday or Saturday. */
function timeUntilNextTournamentStart(now: DateTime): Duration {
	return nextRollover(now).diffNow();
}

/** Find the time until the next rollover on Thursday or Sunday. */
function timeUntilNextTournamentEnd(now: DateTime): Duration {
	return nextRollover(now).diffNow();
}

/** Find the time since the last rollover on an event start date. */
function timeSinceLastEventStart(now: DateTime): Duration {
	return nextRollover(now).diffNow();
}

/** Find the time until the next rollover on an event end date. */
function timeUntilNextEventEnd(now: DateTime): Duration {
	return nextRollover(now).diffNow();
}

/** Find the time until the next rollover on an event start date. */
function timeUntilNextEventStart(now: DateTime): Duration {
	return nextRollover(now).diffNow();
}

function getTournamentTimerText(untilNextTournamentStart: Duration, untilNextTournamentEnd: Duration) {
	if(untilNextTournamentStart.days < untilNextTournamentEnd.days) {
		return `Next: ${untilNextTournamentStart.toHuman()}`;
	}
	return `Open, ${untilNextTournamentEnd.toHuman()} left`;
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
	if(sinceLastEventStart.days < EVENT_ACTIVE_DAYS.days) {
		return `Day ${sinceLastEventStart.days + 1}/${EVENT_ACTIVE_DAYS.days}`;
	}
	return `Next: ${untilNextEventStart.toHuman()}`;
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
	if(sinceLastEventStart.days < EVENT_ACTIVE_DAYS.days) {
		const currentMissions = Math.min(MISSIONS_FIRST_DAY + MISSIONS_PER_DAY * sinceLastEventStart.days, MISSIONS_TOTAL);
		const missionsDisplay = `${currentMissions}/${MISSIONS_TOTAL}, `;
		if(sinceLastEventStart.days < MISSIONS_NEW_MISSION_DAYS) {
			return missionsDisplay + `next: ${untilTomorrow.toHuman()}`;
		}
		return missionsDisplay + `${untilNextEventEnd.toHuman()} left`;
	}
	return `(hidden)`;
}

async function updateMissionsTimer(guild: Guild, sinceLastEventStart: Duration, untilTomorrow: Duration, untilNextEventEnd: Duration) {
	if(missionsHours != untilTomorrow.hours) {
		const timerText = `🏅 ${getMissionsTimerText(sinceLastEventStart, untilTomorrow, untilNextEventEnd)}`;
		await updateChannel(guild, channelMissionsTimerId, timerText, sinceLastEventStart.days < EVENT_ACTIVE_DAYS.days)
			.then(_ => {
				missionsHours = untilTomorrow.hours;
				console.log("Updated missions timer.");
			})
			.catch(handleError);	
	}
}

async function updateTimers(guild: Guild) {
	const now = DateTime.now();
	
	const untilTomorrow = nextRollover(now).diffNow();

	const untilNextTournamentStart = timeUntilNextTournamentStart(now);
	const untilNextTournamentEnd = timeUntilNextTournamentEnd(now);
	const sinceLastEventStart = timeSinceLastEventStart(now);
	const untilNextEventEnd = timeUntilNextEventEnd(now);
	const untilNextEventStart = timeUntilNextEventStart(now);

	await updateTournamentTimer(guild, untilNextTournamentStart, untilNextTournamentEnd);
	await updateEventTimer(guild, sinceLastEventStart, untilNextEventStart);
	await updateMissionsTimer(guild, sinceLastEventStart, untilTomorrow, untilNextEventEnd);
}