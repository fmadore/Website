import { describe, expect, it } from 'vitest';
import type { CitationContextSet, CitingWork } from '$lib/types';
import {
	buildCitationContextSection,
	buildCitationContextSections,
	buildCitingWorkRows,
	citingKey,
	citingWorkKind
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

	it('keeps no-full-text apart from entries the run has not reached', () => {
		const section = buildCitationContextSection(set, publication);
		expect(section.unread.map((e) => [e.key, e.language])).toEqual([['Q4', 'fr']]);
		expect(section.pending.map((e) => [e.key, e.language])).toEqual([['Q5', undefined]]);
	});

	it('refuses a context whose citation the publication no longer lists', () => {
		const removed = { ...publication, citedBy: publication.citedBy.slice(1) };
		expect(() => buildCitationContextSection(set, removed)).toThrow(/no longer lists: Q1/);
	});

	it('refuses a set for a publication the site does not have', () => {
		expect(() => buildCitationContextSections([set], [])).toThrow(/unknown publication article/);
	});

	it('merges a work quoted under several publications into one row', () => {
		const other = {
			id: 'book',
			title: 'A book',
			year: 2018,
			citedBy: [work(['Ali'], 2024, { wikidataId: 'Q2', source: 'Paris: Karthala, 2024' })]
		};
		const otherSet: CitationContextSet = {
			...set,
			id: 'book',
			contexts: [{ citing: 'Q2', language: 'en', status: 'quoted', passages: [{ text: 'Three.' }] }]
		};
		const rows = buildCitingWorkRows(
			buildCitationContextSections([set, otherSet], [publication, other])
		);
		const ali = rows.find((row) => row.key === 'Q2');
		expect(ali?.groups.map((g) => [g.publicationId, g.passages.length])).toEqual([
			['article', 2],
			['book', 1]
		]);
		expect(ali?.passageCount).toBe(3);
		expect(ali?.language).toBe('English');
		expect(rows.map((row) => row.key)).toEqual(['https://de.wikipedia.org/wiki/X', 'Q2', 'Q1']);
	});

	it('reads the kind of work off its source line', () => {
		const kind = (source: string, url?: string) => citingWorkKind({ source, url });
		expect(kind('In Routledge Handbook of Islam in Africa, edited by T. Østebø, 173-87.')).toBe(
			'chapter'
		);
		expect(kind('PhD dissertation, Stanford University, 2021')).toBe('thesis');
		expect(kind('Masters thesis, Université du Québec à Montréal, 2022')).toBe('thesis');
		expect(kind('Journal of Religion in Africa 46, no. 4 (2016): 417-52')).toBe('article');
		expect(kind('Africa Briefing. Brussels: International Crisis Group, 11 August 2023')).toBe(
			'report'
		);
		expect(kind('Stanford: Stanford University Press, 2023')).toBe('book');
		expect(
			kind('Wikipedia (German), consulted 15 August 2026', 'https://de.wikipedia.org/wiki/X')
		).toBe('encyclopedia');
	});
});
