import * as timerManager from '../timer-manager';
import { DateTime, Duration, Interval } from 'luxon';

// Some sample dates.
const mondayMorning 			= DateTime.utc(2023, 3, 13, 9, 0);
const tuesdayEvening 			= DateTime.utc(2023, 3, 14, 18, 0);
const wednesdayBeforeRollover 	= DateTime.utc(2023, 3, 15, 23, 55);
const thursdayAtRollover 		= DateTime.utc(2023, 3, 16, 0, 0);
const sundayNextWeekAtRollover 	= DateTime.utc(2023, 3, 26, 0, 0);
const sundayWeekAfterAtRollover	= DateTime.utc(2023, 4, 2, 0, 0);

const tournamentTextRegex = /^((Next: ([0-6]d )?([12]?[0-9]h))|(Open, ([0-6]d )?([12]?[0-9]h) left))/
const eventTextRegex = /^((Day [0-9]{1,2}\/14)|(Next: ([0-9]d )?([12]?[0-9]h)))/
const missionsTextRegex = /^(([0-9]{1,2}\/19, ((next: ([0-9]d )?([12]?[0-9]h))|(([0-9]d )?([12]?[0-9]h) left)))|(\(hidden\)))/

const durationTextRegex = /([0-9]d )?([12]?[0-9]h)/

const TEST_DATETIMES = [mondayMorning, tuesdayEvening, wednesdayBeforeRollover, thursdayAtRollover,
	sundayNextWeekAtRollover, sundayWeekAfterAtRollover];

function mapAndCheckLessThanOrEqualToDays(mapFunction: (dateTime: DateTime) => Interval, days: number) {
	const intervals = TEST_DATETIMES.map(mapFunction);
	// console.log(intervals.map(interval => timerManager.formatIntervalToDuration(interval)));
	return intervals.every(interval => interval.toDuration() <= Duration.fromObject({ days: days }));
}

test('duration until next rollover is always <= 1 day', () => {
	const mapFunction = (dateTime: DateTime) => timerManager.nextRollover(dateTime);
	const days = 1;
	expect(mapAndCheckLessThanOrEqualToDays(mapFunction, days)).toBe(true);
});

test('duration until next tournament start is always <= 4 days', () => {
	const mapFunction = (dateTime: DateTime) => timerManager.nextTournamentStart(dateTime);
	const days = 4;
	expect(mapAndCheckLessThanOrEqualToDays(mapFunction, days)).toBe(true);
});

test('duration until next tournament end is always <= 4 days', () => {
	const mapFunction = (dateTime: DateTime) => timerManager.nextTournamentEnd(dateTime);
	const days = 4;
	expect(mapAndCheckLessThanOrEqualToDays(mapFunction, days)).toBe(true);
});

test(`duration since last event start is always <= ${timerManager.EVENT_CYCLE_LENGTH.days} days`, () => {
	const mapFunction = (dateTime: DateTime) => timerManager.lastEventStart(dateTime);
	const days = timerManager.EVENT_CYCLE_LENGTH.days;
	expect(mapAndCheckLessThanOrEqualToDays(mapFunction, days)).toBe(true);
});

test(`duration until next event start is always <= ${timerManager.EVENT_CYCLE_LENGTH.days} days`, () => {
	const mapFunction = (dateTime: DateTime) => timerManager.nextEventStart(dateTime);
	const days = timerManager.EVENT_CYCLE_LENGTH.days;
	expect(mapAndCheckLessThanOrEqualToDays(mapFunction, days)).toBe(true);
});

test(`duration until next event end is always <= ${timerManager.EVENT_CYCLE_LENGTH.days} days`, () => {
	const mapFunction = (dateTime: DateTime) => timerManager.nextEventEnd(dateTime);
	const days = timerManager.EVENT_CYCLE_LENGTH.days;
	expect(mapAndCheckLessThanOrEqualToDays(mapFunction, days)).toBe(true);
});

function mapAndCheckFormattedString(mapFunction: (dateTime: DateTime) => Interval) {
	const intervals = TEST_DATETIMES.map(mapFunction);
	return intervals.map(interval => timerManager.formatIntervalToDuration(interval));
}

test('duration until next rollover matches expected values', () => {
	const mapFunction = (dateTime: DateTime) => timerManager.nextRollover(dateTime);
	const values = [ '15h', '6h', '0h', '1d 0h', '1d 0h', '1d 0h' ];
	expect(mapAndCheckFormattedString(mapFunction)).toEqual(values);
});

test('duration until next tournament start matches expected values', () => {
	const mapFunction = (dateTime: DateTime) => timerManager.nextTournamentStart(dateTime);
	const values = [ '1d 15h', '6h', '2d 0h', '2d 0h', '3d 0h', '3d 0h' ];
	expect(mapAndCheckFormattedString(mapFunction)).toEqual(values);
});

test('duration until next tournament end matches expected values', () => {
	const mapFunction = (dateTime: DateTime) => timerManager.nextTournamentEnd(dateTime);
	const values = [ '2d 15h', '1d 6h', '0h', '3d 0h', '4d 0h', '4d 0h' ];
	expect(mapAndCheckFormattedString(mapFunction)).toEqual(values);
});

test('duration since last event start matches expected values', () => {
	const mapFunction = (dateTime: DateTime) => timerManager.lastEventStart(dateTime);
	const values = ['6d 9h', '7d 18h', '8d 23h', '9d 0h', '19d 0h', '5d 0h'];
	expect(mapAndCheckFormattedString(mapFunction)).toEqual(values);
});

test('duration until next event start matches expected values', () => {
	const mapFunction = (dateTime: DateTime) => timerManager.nextEventStart(dateTime);
	const values = [ '14d 15h', '13d 6h', '12d 0h', '13d 0h', '3d 0h', '17d 0h' ];
	expect(mapAndCheckFormattedString(mapFunction)).toEqual(values);
});

test('duration until next event end matches expected values', () => {
	const mapFunction = (dateTime: DateTime) => timerManager.nextEventEnd(dateTime);
	const values = [ '7d 15h', '6d 6h', '5d 0h', '6d 0h', '17d 0h', '10d 0h' ];
	expect(mapAndCheckFormattedString(mapFunction)).toEqual(values);
});

test('tournament timer strings match expected regex', () => {
	const timerStrings = TEST_DATETIMES.map((dateTime: DateTime) => {
		const untilNextTournamentStart = timerManager.nextTournamentStart(dateTime);
		const untilNextTournamentEnd = timerManager.nextTournamentEnd(dateTime);
		return timerManager.getTournamentTimerText(untilNextTournamentStart, untilNextTournamentEnd);
	});
	const allMatch = timerStrings.every(timerString => tournamentTextRegex.test(timerString));
	expect(allMatch).toBe(true);
});

test('event timer strings match expected regex', () => {
	const timerStrings = TEST_DATETIMES.map((dateTime: DateTime) => {
		const sinceLastEventStart = timerManager.lastEventStart(dateTime);
		const untilNextEventStart = timerManager.nextEventStart(dateTime);
		return timerManager.getEventTimerText(sinceLastEventStart, untilNextEventStart);
	});
	console.log(timerStrings);
	const allMatch = timerStrings.every(timerString => eventTextRegex.test(timerString));
	expect(allMatch).toBe(true);
});

test('missions timer strings match expected regex', () => {
	const timerStrings = TEST_DATETIMES.map((dateTime: DateTime) => {
		const sinceLastEventStart = timerManager.lastEventStart(dateTime);
		const untilTomorrow = timerManager.nextRollover(dateTime);
		const untilNextEventEnd = timerManager.nextEventEnd(dateTime);
		return timerManager.getMissionsTimerText(sinceLastEventStart, untilTomorrow, untilNextEventEnd);
	});
	console.log(timerStrings);
	const allMatch = timerStrings.every(timerString => missionsTextRegex.test(timerString));
	expect(allMatch).toBe(true);
});