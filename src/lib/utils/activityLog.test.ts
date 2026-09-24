import { describe, it, expect } from 'vitest';
import { summariseActivityLog } from './activityLog';
import { activitiesByDate } from '$lib/data/activities';

const entry = (id: string, year: number) => ({ id, title: `T ${id}`, date: `1 May ${year}`, year });

describe('summariseActivityLog', () => {
	it('keeps the newest entries, trimmed to what a ledger row prints', () => {
		const log = summariseActivityLog([entry('a', 2026), entry('b', 2025), entry('c', 2025)], 2);
		expect(log.total).toBe(3);
		expect(log.latest).toEqual([
			{ id: 'a', title: 'T a', date: '1 May 2026' },
			{ id: 'b', title: 'T b', date: '1 May 2025' }
		]);
	});

	it('meters each year against the busiest, newest year first', () => {
		const log = summariseActivityLog(
			[entry('a', 2024), entry('b', 2026), entry('c', 2024), entry('d', 2025)],
			5
		);
		expect(log.years).toEqual([
			{ year: 2026, count: 1, pct: 50 },
			{ year: 2025, count: 1, pct: 50 },
			{ year: 2024, count: 2, pct: 100 }
		]);
	});

	it('reads an empty log as empty', () => {
		expect(summariseActivityLog([], 5)).toEqual({ total: 0, latest: [], years: [] });
	});

	it('counts every activity in the dataset once', () => {
		const log = summariseActivityLog(activitiesByDate, 5);
		expect(log.years.reduce((sum, row) => sum + row.count, 0)).toBe(activitiesByDate.length);
		expect(log.latest.map(({ id }) => id)).toEqual(
			activitiesByDate.slice(0, 5).map(({ id }) => id)
		);
	});
});
