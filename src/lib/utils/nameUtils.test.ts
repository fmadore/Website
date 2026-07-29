import { describe, it, expect } from 'vitest';
import {
	joinNames,
	formatAuthorsCompact,
	formatAuthorsWithEtAl,
	splitNames,
	toLastFirstFormat
} from './nameUtils';

describe('joinNames — defaults (citation/CV style)', () => {
	it('returns an empty string for no names', () => {
		expect(joinNames([])).toBe('');
	});

	it('returns a single name as-is', () => {
		expect(joinNames(['Jane Doe'])).toBe('Jane Doe');
	});

	it('joins two names with " and "', () => {
		expect(joinNames(['Jane Doe', 'John Smith'])).toBe('Jane Doe and John Smith');
	});

	it('joins three or more names with ", " and a final " and " (no serial comma)', () => {
		expect(joinNames(['A', 'B', 'C'])).toBe('A, B and C');
		expect(joinNames(['A', 'B', 'C', 'D'])).toBe('A, B, C and D');
	});
});

describe('joinNames — serial comma (CV editor style)', () => {
	it('does not add a serial comma for two names', () => {
		expect(joinNames(['A', 'B'], { serialComma: true })).toBe('A and B');
	});

	it('adds ", and " before the last of three or more names', () => {
		expect(joinNames(['A', 'B', 'C'], { serialComma: true })).toBe('A, B, and C');
		expect(joinNames(['A', 'B', 'C', 'D'], { serialComma: true })).toBe('A, B, C, and D');
	});
});

describe('joinNames — custom separator/conjunction', () => {
	it('honours a custom conjunction', () => {
		expect(joinNames(['A', 'B'], { conjunction: ' & ' })).toBe('A & B');
		expect(joinNames(['A', 'B', 'C'], { conjunction: ' & ' })).toBe('A, B & C');
	});

	it('honours a custom separator, including its serial-comma form', () => {
		expect(joinNames(['A', 'B', 'C'], { separator: '; ' })).toBe('A; B and C');
		expect(joinNames(['A', 'B', 'C'], { separator: '; ', serialComma: true })).toBe('A; B; and C');
	});
});

describe('joinNames — et al. collapsing', () => {
	it('renders up to the threshold in full', () => {
		expect(joinNames(['A'], { maxBeforeEtAl: 2 })).toBe('A');
		expect(joinNames(['A', 'B'], { maxBeforeEtAl: 2 })).toBe('A and B');
	});

	it('collapses to "First et al." beyond the threshold', () => {
		expect(joinNames(['A', 'B', 'C'], { maxBeforeEtAl: 2 })).toBe('A et al.');
		expect(joinNames(['A', 'B', 'C', 'D'], { maxBeforeEtAl: 2 })).toBe('A et al.');
	});

	it('keeps several names ahead of "et al." when asked', () => {
		expect(joinNames(['A', 'B', 'C', 'D', 'E'], { maxBeforeEtAl: 3, namesBeforeEtAl: 3 })).toBe(
			'A, B, C et al.'
		);
	});

	it('never prints every name before an "et al."', () => {
		// Four names with a window of six would otherwise claim a hidden fifth.
		expect(joinNames(['A', 'B', 'C', 'D'], { maxBeforeEtAl: 2, namesBeforeEtAl: 6 })).toBe(
			'A, B, C et al.'
		);
	});

	it('leaves mustInclude alone when it already falls inside the window', () => {
		expect(
			joinNames(['A', 'B', 'C', 'D', 'E'], {
				maxBeforeEtAl: 3,
				namesBeforeEtAl: 3,
				mustInclude: 'B'
			})
		).toBe('A, B, C et al.');
	});

	it('reaches past the window to keep mustInclude visible', () => {
		expect(
			joinNames(['A', 'B', 'C', 'D', 'E'], {
				maxBeforeEtAl: 3,
				namesBeforeEtAl: 3,
				mustInclude: 'D'
			})
		).toBe('A, B, …, D et al.');
	});

	it('drops the "et al." when mustInclude is the last name', () => {
		expect(
			joinNames(['A', 'B', 'C', 'D', 'E'], {
				maxBeforeEtAl: 3,
				namesBeforeEtAl: 3,
				mustInclude: 'E'
			})
		).toBe('A, B, …, E');
	});

	it('ignores a mustInclude that is not in the list', () => {
		expect(
			joinNames(['A', 'B', 'C', 'D', 'E'], {
				maxBeforeEtAl: 3,
				namesBeforeEtAl: 3,
				mustInclude: 'Z'
			})
		).toBe('A, B, C et al.');
	});
});

describe('formatAuthorsWithEtAl', () => {
	it('returns an empty string for no authors', () => {
		expect(formatAuthorsWithEtAl(undefined)).toBe('');
		expect(formatAuthorsWithEtAl([])).toBe('');
	});

	it('prints ordinary co-authored bylines in full', () => {
		expect(formatAuthorsWithEtAl(['A'])).toBe('A');
		expect(formatAuthorsWithEtAl(['A', 'B'])).toBe('A and B');
		expect(formatAuthorsWithEtAl(['A', 'B', 'C'])).toBe('A, B and C');
		expect(formatAuthorsWithEtAl(['A', 'B', 'C', 'D'])).toBe('A, B, C and D');
	});

	it('collapses collective bylines to three names plus "et al."', () => {
		expect(formatAuthorsWithEtAl(['A', 'B', 'C', 'D', 'E'])).toBe('A, B, C et al.');
	});

	it('holds the site owner in view when they sign late', () => {
		expect(
			formatAuthorsWithEtAl(['A', 'B', 'C', 'D', 'Frédérick Madore', 'F'], {
				mustInclude: 'Frédérick Madore'
			})
		).toBe('A, B, …, Frédérick Madore et al.');
	});
});

describe('formatAuthorsCompact', () => {
	it('returns an empty string for no authors', () => {
		expect(formatAuthorsCompact([])).toBe('');
	});

	it('returns a single author as-is', () => {
		expect(formatAuthorsCompact(['Jane Doe'])).toBe('Jane Doe');
	});

	it('joins two authors with " and "', () => {
		expect(formatAuthorsCompact(['Jane Doe', 'John Smith'])).toBe('Jane Doe and John Smith');
	});

	it('collapses three or more authors to "First et al."', () => {
		expect(formatAuthorsCompact(['A', 'B', 'C'])).toBe('A et al.');
	});
});

describe('splitNames', () => {
	it('splits comma- and and-separated name strings', () => {
		expect(splitNames('Jane Doe, John Smith and Ann Lee')).toEqual([
			'Jane Doe',
			'John Smith',
			'Ann Lee'
		]);
	});

	it('drops empty segments', () => {
		expect(splitNames('Jane Doe, ')).toEqual(['Jane Doe']);
	});
});

describe('toLastFirstFormat', () => {
	it('converts "First Last" to "Last, First"', () => {
		expect(toLastFirstFormat('Jane Doe')).toBe('Doe, Jane');
	});

	it('leaves "Last, First" untouched', () => {
		expect(toLastFirstFormat('Doe, Jane')).toBe('Doe, Jane');
	});

	it('leaves single-word names untouched', () => {
		expect(toLastFirstFormat('Sting')).toBe('Sting');
	});
});
