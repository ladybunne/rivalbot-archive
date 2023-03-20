import * as timerManager from '../timer-manager';
import { DateTime, Interval } from 'luxon';

// Some sample dates.
const mondayMorning = DateTime.fromSeconds(1678658400);
const tuesdayEvening = DateTime.fromSeconds(1678777200);
const wednesdayRightBeforeRollover = DateTime.fromSeconds(1678838100);
const thursdayAtRollover = DateTime.fromSeconds(1678924800);

const TEST_DATETIMES = [mondayMorning, tuesdayEvening, wednesdayRightBeforeRollover, thursdayAtRollover];

function mapAndCheckLessThanDays(mapFunction: (dateTime: DateTime) => Interval, days: number) {
	const intervals = TEST_DATETIMES.map(mapFunction);
	return intervals.every(interval => interval.toDuration().days < days)
}

test('days until next rollover is < 1', () => {
	const mapFunction = (dateTime: DateTime) => timerManager.nextRollover(dateTime);
	const days = 1;
	expect(mapAndCheckLessThanDays(mapFunction, days)).toBe(true);
});

test('days until next tournament start is < 4', () => {
	const mapFunction = (dateTime: DateTime) => timerManager.nextTournamentStart(dateTime);
	const days = 4;
	expect(mapAndCheckLessThanDays(mapFunction, days)).toBe(true);
});

test('days until next tournament end is < 4', () => {
	const mapFunction = (dateTime: DateTime) => timerManager.nextTournamentEnd(dateTime);
	const days = 4;
	expect(mapAndCheckLessThanDays(mapFunction, days)).toBe(true);
});

test(`days since last event start is < ${timerManager.EVENT_CYCLE_LENGTH.days}`, () => {
	const mapFunction = (dateTime: DateTime) => timerManager.lastEventStart(dateTime);
	const days = timerManager.EVENT_CYCLE_LENGTH.days;
	expect(mapAndCheckLessThanDays(mapFunction, days)).toBe(true);
});

test(`days until next event start is < ${timerManager.EVENT_CYCLE_LENGTH.days}`, () => {
	const mapFunction = (dateTime: DateTime) => timerManager.nextEventStart(dateTime);
	const days = timerManager.EVENT_CYCLE_LENGTH.days;
	expect(mapAndCheckLessThanDays(mapFunction, days)).toBe(true);
});

test(`days until next event end is < ${timerManager.EVENT_CYCLE_LENGTH.days}`, () => {
	const mapFunction = (dateTime: DateTime) => timerManager.nextEventEnd(dateTime);
	const days = timerManager.EVENT_CYCLE_LENGTH.days;
	expect(mapAndCheckLessThanDays(mapFunction, days)).toBe(true);
});