import * as timerManager from '../timer-manager';
import { DateTime, Duration, Interval } from 'luxon';

// Some sample dates.
const mondayMorning 			= DateTime.utc(2023, 3, 13, 9, 0);
const tuesdayEvening 			= DateTime.utc(2023, 3, 14, 18, 0);
const wednesdayBeforeRollover 	= DateTime.utc(2023, 3, 15, 23, 55);
const thursdayAtRollover 		= DateTime.utc(2023, 3, 16, 0, 0)
const sundayNextWeekAtRollover 	= DateTime.utc(2023, 3, 26, 0, 0)
const sundayWeekAfterAtRollover	= DateTime.utc(2023, 4, 2, 0, 0)

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
	const values = [ '0d 15h', '0d 6h', '0d 0h', '1d 0h', '1d 0h', '1d 0h' ];
	expect(mapAndCheckFormattedString(mapFunction)).toEqual(values);
});

test('duration until next tournament start matches expected values', () => {
	const mapFunction = (dateTime: DateTime) => timerManager.nextTournamentStart(dateTime);
	const values = [ '1d 15h', '0d 6h', '2d 0h', '2d 0h', '3d 0h', '3d 0h' ];
	expect(mapAndCheckFormattedString(mapFunction)).toEqual(values);
});

test('duration until next tournament end matches expected values', () => {
	const mapFunction = (dateTime: DateTime) => timerManager.nextTournamentEnd(dateTime);
	const values = [ '2d 15h', '1d 6h', '0d 0h', '3d 0h', '4d 0h', '4d 0h' ];
	expect(mapAndCheckFormattedString(mapFunction)).toEqual(values);
});

test('duration since last event start matches expected values', () => {
	const mapFunction = (dateTime: DateTime) => timerManager.lastEventStart(dateTime);
	const values = [ '5d 9h', '6d 18h', '7d 23h', '8d 0h', '18d 0h', '4d 0h' ];
	expect(mapAndCheckFormattedString(mapFunction)).toEqual(values);
});

test('duration until next event start matches expected values', () => {
	const mapFunction = (dateTime: DateTime) => timerManager.nextEventStart(dateTime);
	const values = [ '13d 15h', '12d 6h', '11d 0h', '12d 0h', '2d 0h', '16d 0h' ];
	expect(mapAndCheckFormattedString(mapFunction)).toEqual(values);
});

test('duration until next event end matches expected values', () => {
	const mapFunction = (dateTime: DateTime) => timerManager.nextEventEnd(dateTime);
	const values = [ '6d 15h', '5d 6h', '4d 0h', '5d 0h', '16d 0h', '9d 0h' ];
	expect(mapAndCheckFormattedString(mapFunction)).toEqual(values);
});
