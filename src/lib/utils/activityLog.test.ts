import { describe, it, expect } from 'vitest';
import { summariseActivityLog } from './activityLog';
import { activitiesByDate } from '#lib/data/activities/index.ts';

const entry = (id: string, dateISO: string) => ({ id, title: `T ${id}`, dateISO });

describe('summariseActivityLog', () => {
	it('keeps the newest entries, trimmed to what the feed prints', () => {
		const log = summariseActivityLog(
			[entry('a', '2026-10-08'), entry('b', '2025-05-01'), entry('c', '2025-04-01')],
			2
		);
		expect(log.total).toBe(3);
		expect(log.latest).toEqual([
			{ id: 'a', title: 'T a', dateISO: '2026-10-08' },
			{ id: 'b', title: 'T b', dateISO: '2025-05-01' }
		]);
	});

	it('reads an empty log as empty', () => {
		expect(summariseActivityLog([], 5)).toEqual({ total: 0, latest: [] });
	});

	it('takes the newest entries of the dataset, with their ISO dates', () => {
		const log = summariseActivityLog(activitiesByDate, 4);
		expect(log.total).toBe(activitiesByDate.length);
		expect(log.latest.map(({ id }) => id)).toEqual(
			activitiesByDate.slice(0, 4).map(({ id }) => id)
		);
		for (const { dateISO } of log.latest) expect(dateISO).toMatch(/^\d{4}-\d{2}-\d{2}$/);
	});
});
