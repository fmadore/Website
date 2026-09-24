import { describe, it, expect } from 'vitest';
import { sortPublicationsByDate } from './order';

describe('sortPublicationsByDate', () => {
	it('floats forthcoming works above the newest dated one, each group newest first', () => {
		const items = [
			{ id: 'old', dateISO: '2019-01-01', date: '2019' },
			{ id: 'soon', dateISO: '2027-01-01', date: 'Forthcoming' },
			{ id: 'new', dateISO: '2025-06-01', date: '2025' },
			{ id: 'bientot', dateISO: '2026-01-01', date: 'À paraître' }
		];
		expect(sortPublicationsByDate(items).map((i) => i.id)).toEqual([
			'soon',
			'bientot',
			'new',
			'old'
		]);
	});
});
