import { describe, expect, it } from 'vitest';
import type { Publication } from '$lib/types/publication';
import { sortItems } from './sortUtils';

function publication(id: string, overrides: Partial<Publication> = {}): Publication {
	return {
		id,
		type: 'article',
		title: id,
		authors: ['Author'],
		date: '2024',
		dateISO: '2024-01-01',
		year: 2024,
		language: 'English',
		...overrides
	};
}

describe('sortItems', () => {
	it('sorts titles without mutating the source array', () => {
		const source = [publication('z', { title: 'Zulu' }), publication('a', { title: 'Alpha' })];

		const result = sortItems(source, 'title');

		expect(result.map(({ id }) => id)).toEqual(['a', 'z']);
		expect(source.map(({ id }) => id)).toEqual(['z', 'a']);
		expect(result).not.toBe(source);
	});

	it('sorts citation totals descending and treats missing citations as zero', () => {
		const result = sortItems(
			[
				publication('none'),
				publication('two', {
					citedBy: [
						{ authors: ['A'], year: 2024, title: 'One' },
						{ authors: ['B'], year: 2025, title: 'Two' }
					]
				}),
				publication('one', { citedBy: [{ authors: ['A'], year: 2024, title: 'One' }] })
			],
			'citations'
		);

		expect(result.map(({ id }) => id)).toEqual(['two', 'one', 'none']);
	});

	it('places forthcoming work first, alphabetically, then dates newest first', () => {
		const result = sortItems(
			[
				publication('old', { date: '2020', dateISO: '2020-01-01' }),
				publication('forthcoming-z', { title: 'Zulu', date: 'Forthcoming', dateISO: '' }),
				publication('new', { date: '2025', dateISO: '2025-01-01' }),
				publication('forthcoming-a', { title: 'Alpha', date: 'À paraître', dateISO: '' })
			],
			'date'
		);

		expect(result.map(({ id }) => id)).toEqual(['forthcoming-a', 'forthcoming-z', 'new', 'old']);
	});

	it('places missing and invalid dates after valid dates', () => {
		const result = sortItems(
			[
				publication('missing', { date: '', dateISO: '' }),
				publication('invalid', { date: 'not-a-date', dateISO: 'not-a-date' }),
				publication('valid', { date: '2024', dateISO: '2024-06-01' })
			],
			'date'
		);

		expect(result[0]?.id).toBe('valid');
		expect(result.slice(1).map(({ id }) => id)).toEqual(['missing', 'invalid']);
	});
});
