import { describe, expect, it } from 'vitest';
import { KEY_TERM_MAX_SIZE, KEY_TERM_MIN_SIZE, scaleKeyTerms, type KeyTermCount } from './keyTerms';

const term = (word: string, count: number): KeyTermCount => ({ word, count });

describe('scaleKeyTerms — the scale', () => {
	it('puts the most frequent term at max and the least at min', () => {
		const scaled = scaleKeyTerms([term('islam', 40), term('press', 12), term('campus', 3)]);

		expect(scaled[0]).toMatchObject({ word: 'islam', size: KEY_TERM_MAX_SIZE });
		expect(scaled[2]).toMatchObject({ word: 'campus', size: KEY_TERM_MIN_SIZE });
	});

	it('scales on the square root of the count, not the count', () => {
		// counts 1 and 4 have roots 1 and 2, so a count of 4 is the top of a
		// range whose midpoint (root 1.5) belongs to a count of 2.25 — not to
		// the linear midpoint of 2.5.
		const [top, mid, bottom] = scaleKeyTerms([term('a', 4), term('b', 2.25), term('c', 1)], {
			min: 10,
			max: 30
		});

		expect(top?.size).toBe(30);
		expect(mid?.size).toBe(20);
		expect(bottom?.size).toBe(10);
	});

	it('sorts by count descending, breaking ties on the term', () => {
		const scaled = scaleKeyTerms([term('zakat', 5), term('hajj', 9), term('dawa', 5)]);

		expect(scaled.map((t) => t.word)).toEqual(['hajj', 'dawa', 'zakat']);
	});

	it('fits the scale to the retained window, not the whole input', () => {
		// The 1-count tail is dropped, so the smallest *shown* term (count 4)
		// takes min rather than inheriting a size from terms nobody sees.
		const scaled = scaleKeyTerms([term('a', 16), term('b', 4), term('c', 1)], { limit: 2 });

		expect(scaled.map((t) => t.size)).toEqual([KEY_TERM_MAX_SIZE, KEY_TERM_MIN_SIZE]);
	});

	it('honours a custom min and max', () => {
		const scaled = scaleKeyTerms([term('a', 9), term('b', 1)], { min: 20, max: 40 });

		expect(scaled.map((t) => t.size)).toEqual([40, 20]);
	});

	it('never emits NaN for a zero or negative count', () => {
		const scaled = scaleKeyTerms([term('a', 4), term('b', 0), term('c', -3)]);

		expect(scaled.every((t) => Number.isFinite(t.size))).toBe(true);
	});
});

describe('scaleKeyTerms — the limit', () => {
	it('keeps the 60 most frequent terms by default', () => {
		const many = Array.from({ length: 200 }, (_, i) => term(`t${i}`, 200 - i));
		const scaled = scaleKeyTerms(many);

		expect(scaled).toHaveLength(60);
		expect(scaled.at(-1)?.word).toBe('t59');
	});

	it('honours an explicit limit and returns nothing for a non-positive one', () => {
		const items = [term('a', 3), term('b', 2), term('c', 1)];

		expect(scaleKeyTerms(items, { limit: 2 }).map((t) => t.word)).toEqual(['a', 'b']);
		expect(scaleKeyTerms(items, { limit: 0 })).toEqual([]);
	});

	it('returns nothing for an empty corpus', () => {
		expect(scaleKeyTerms([])).toEqual([]);
	});
});

describe('scaleKeyTerms — degenerate spans', () => {
	it('gives a single term the max size', () => {
		expect(scaleKeyTerms([term('islam', 7)])).toEqual([
			{ word: 'islam', count: 7, size: KEY_TERM_MAX_SIZE }
		]);
	});

	it('gives every term the max size when all counts are equal', () => {
		const scaled = scaleKeyTerms([term('a', 4), term('b', 4), term('c', 4)]);

		expect(scaled.map((t) => t.size)).toEqual([
			KEY_TERM_MAX_SIZE,
			KEY_TERM_MAX_SIZE,
			KEY_TERM_MAX_SIZE
		]);
	});

	it('preserves the original counts alongside the sizes', () => {
		const scaled = scaleKeyTerms([term('a', 9), term('b', 1)]);

		expect(scaled.map((t) => t.count)).toEqual([9, 1]);
	});
});
