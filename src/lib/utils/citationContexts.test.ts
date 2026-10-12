import { describe, expect, it } from 'vitest';
import type { CitationContextSet, CitingWork } from '$lib/types';
import {
	buildCitationContextSection,
	buildCitationContextSections,
	citingKey
} from './citationContexts';

const work = (authors: string[], year: number, extra: Partial<CitingWork> = {}): CitingWork => ({
	authors,
	year,
	title: `Work by ${authors[0]}`,
	...extra
});

const publication = {
	id: 'article',
	title: 'An "article"',
	year: 2016,
	citedBy: [
		work(['Ba'], 2021, { wikidataId: 'Q1' }),
		work(['Ali'], 2024, { wikidataId: 'Q2' }),
		work(['Wiki'], 2026, { url: 'https://de.wikipedia.org/wiki/X' }),
		work(['Cole'], 2019, { wikidataId: 'Q3' }),
		work(['Diop'], 2022, { wikidataId: 'Q4' }),
		work(['Late'], 2026, { wikidataId: 'Q5' })
	]
};

const set: CitationContextSet = {
	id: 'article',
	model: 'Claude Haiku 5.5',
	extracted: '2026-10-12',
	contexts: [
		{ citing: 'Q1', language: 'fr', status: 'quoted', passages: [{ text: 'Un.', page: '3' }] },
		{
			citing: 'Q2',
			language: 'en',
			status: 'quoted',
			passages: [{ text: 'One.' }, { text: 'Two.', inNote: true }]
		},
		{
			citing: 'https://de.wikipedia.org/wiki/X',
			language: 'de',
			status: 'quoted',
			passages: [{ text: 'Eins.' }]
		},
		{ citing: 'Q3', language: 'en', status: 'bibliography-only' },
		{ citing: 'Q4', language: 'fr', status: 'unread' }
	]
};

describe('citation contexts', () => {
	it('keys an entry by its QID, else by its URL', () => {
		expect(citingKey(work(['A'], 2020, { wikidataId: 'Q9', url: 'https://x' }))).toBe('Q9');
		expect(citingKey(work(['A'], 2020, { url: 'https://x' }))).toBe('https://x');
		expect(citingKey(work(['A'], 2020))).toBeNull();
	});

	it('sorts each status newest first and counts the passages', () => {
		const section = buildCitationContextSection(set, publication);
		expect(section.quoted.map((e) => e.key)).toEqual([
			'https://de.wikipedia.org/wiki/X',
			'Q2',
			'Q1'
		]);
		expect(section.bibliographyOnly.map((e) => e.key)).toEqual(['Q3']);
		expect(section.passageCount).toBe(4);
		expect(section.entryCount).toBe(6);
		expect(section.title).toBe('An “article”');
	});

	it('counts an entry recorded after the run as not yet read', () => {
		const section = buildCitationContextSection(set, publication);
		expect(section.unread.map((e) => [e.key, e.language])).toEqual([
			['Q5', undefined],
			['Q4', 'fr']
		]);
	});

	it('refuses a context whose citation the publication no longer lists', () => {
		const removed = { ...publication, citedBy: publication.citedBy.slice(1) };
		expect(() => buildCitationContextSection(set, removed)).toThrow(/no longer lists: Q1/);
	});

	it('refuses a set for a publication the site does not have', () => {
		expect(() => buildCitationContextSections([set], [])).toThrow(/unknown publication article/);
	});
});
