import { describe, it, expect } from 'vitest';
import { formatCVAuthorList, formatEditorList, trimTerminalPeriod } from './cvFormatters';
import { author as siteAuthor } from '$lib/data/siteConfig';

describe('formatCVAuthorList', () => {
	it('returns an empty string for no authors', () => {
		expect(formatCVAuthorList(undefined)).toBe('');
		expect(formatCVAuthorList([])).toBe('');
	});

	it('returns an empty string when the site owner is the only author', () => {
		expect(formatCVAuthorList([siteAuthor.name])).toBe('');
	});

	it('returns a single non-owner author as-is', () => {
		expect(formatCVAuthorList(['Jane Doe'])).toBe('Jane Doe');
	});

	it('bolds the site owner among multiple authors, joined with " and "', () => {
		expect(formatCVAuthorList([siteAuthor.name, 'Jane Doe'])).toBe(
			`<strong>${siteAuthor.name}</strong> and Jane Doe`
		);
	});

	it('joins three or more authors with ", " and a final " and " (no serial comma)', () => {
		expect(formatCVAuthorList(['A', 'B', siteAuthor.name])).toBe(
			`A, B and <strong>${siteAuthor.name}</strong>`
		);
	});

	it('splits a string input on " and "', () => {
		expect(formatCVAuthorList('Jane Doe and John Smith')).toBe('Jane Doe and John Smith');
	});
});

describe('formatEditorList', () => {
	it('returns an empty string for no editors', () => {
		expect(formatEditorList(undefined)).toBe('');
		expect(formatEditorList('')).toBe('');
	});

	it('returns a single editor as-is', () => {
		expect(formatEditorList('Jane Doe')).toBe('Jane Doe');
	});

	it('joins two editors with " and " (no serial comma)', () => {
		expect(formatEditorList('Jane Doe and John Smith')).toBe('Jane Doe and John Smith');
	});

	it('adds a serial comma before the final "and" for three or more editors', () => {
		expect(formatEditorList('A, B, C')).toBe('A, B, and C');
		expect(formatEditorList('A, B and C')).toBe('A, B, and C');
	});
});

describe('trimTerminalPeriod', () => {
	it('drops the closing full stop, keeping interior ones such as "no."', () => {
		expect(
			trimTerminalPeriod('Robert Launay, "Review", <em>Reviews in DH</em> 4, no. 4 (2023).')
		).toBe('Robert Launay, "Review", <em>Reviews in DH</em> 4, no. 4 (2023)');
	});

	it('leaves a citation that has no closing full stop alone', () => {
		expect(trimTerminalPeriod('<em>Mande Studies</em> 24 (2022): 325-27')).toBe(
			'<em>Mande Studies</em> 24 (2022): 325-27'
		);
	});

	it('drops a stop that trails whitespace', () => {
		expect(trimTerminalPeriod('A citation.  ')).toBe('A citation');
	});

	it('drops the stop after a closing tag', () => {
		expect(trimTerminalPeriod('A citation in <em>A Journal</em>.')).toBe(
			'A citation in <em>A Journal</em>'
		);
	});
});
