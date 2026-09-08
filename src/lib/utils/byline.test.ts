import { describe, expect, it } from 'vitest';
import { formatByline } from './byline';

describe('formatByline', () => {
	it('returns an empty string for empty input', () => {
		expect(formatByline(undefined)).toBe('');
		expect(formatByline(null)).toBe('');
		expect(formatByline('')).toBe('');
		expect(formatByline([])).toBe('');
	});

	it('prints a single name as-is', () => {
		expect(formatByline(['Frédérick Madore'])).toBe('Frédérick Madore');
	});

	it('joins two names with "and"', () => {
		expect(formatByline(['Frédérick Madore', 'Vincent Hiribarren'])).toBe(
			'Frédérick Madore and Vincent Hiribarren'
		);
	});

	it('joins three or more names with commas and a final "and"', () => {
		expect(formatByline(['A', 'B', 'C'])).toBe('A, B and C');
		expect(formatByline(['A', 'B', 'C', 'D'])).toBe('A, B, C and D');
	});

	it('typesets apostrophes in names', () => {
		// Names carry straight apostrophes in the data; the byline curls them.
		expect(formatByline(["Kadidiatou N'Dri"])).toBe('Kadidiatou N’Dri');
		expect(formatByline(["King's College", 'Someone Else'])).toBe(
			'King’s College and Someone Else'
		);
	});

	it('accepts a pre-joined string (the editors case)', () => {
		expect(formatByline("Ousmane Kane and King's College")).toBe('Ousmane Kane and King’s College');
	});
});
