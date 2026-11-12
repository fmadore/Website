import { describe, expect, it } from 'vitest';
import { citationDateline } from './citationDateline.ts';
import { allPublications as publications } from '#lib/data/publications/index.ts';

describe('citationDateline', () => {
	it('sets a journal article as container, volume(issue), date, pages and DOI', () => {
		expect(
			citationDateline({
				type: 'article',
				journal: 'Africa',
				volume: '90',
				issue: '3',
				date: '2020',
				pages: '625-646',
				doi: '10.1017/S0001972020000248'
			})
		).toEqual({
			parts: ['Africa', '90(3)', '2020', 'pp. 625–646'],
			doi: '10.1017/S0001972020000248'
		});
	});

	it('degrades to venue and date for a blog post with little metadata', () => {
		expect(
			citationDateline({ type: 'blogpost', publisher: 'Remoboko blog', date: '2022' })
		).toEqual({ parts: ['Remoboko blog', '2022'] });
	});

	it('prints a book’s imprint and page count', () => {
		expect(
			citationDateline({
				type: 'book',
				placeOfPublication: 'Bloomington',
				publisher: 'Indiana University Press',
				date: '2025',
				pageCount: 280
			}).parts
		).toEqual(['Bloomington: Indiana University Press', '2025', '280 pp.']);
	});

	it('names the host of a chapter, and a lone page or a series number', () => {
		expect(
			citationDateline({ type: 'chapter', book: 'Islam in Africa', date: '2019', pages: '9' }).parts
		).toEqual(['In Islam in Africa', '2019', 'p. 9']);
		expect(
			citationDateline({
				type: 'working-paper',
				series: 'ZMO Programmatic Texts',
				issue: '146-147',
				date: '2021'
			}).parts
		).toEqual(['ZMO Programmatic Texts', 'no. 146–147', '2021']);
	});

	it('returns nothing to print for a record with no citable fields', () => {
		expect(citationDateline({ type: 'report', date: '' })).toEqual({ parts: [] });
	});

	it('prints at least the date for every publication in the dataset', () => {
		for (const publication of publications) {
			const { parts } = citationDateline(publication);
			expect(parts.length, publication.id).toBeGreaterThan(0);
			expect(parts).toContain(publication.date.trim());
			// Page spans close up on an en dash, never a hyphen.
			for (const part of parts.filter((p) => /^pp?\. /.test(p))) {
				expect(part, publication.id).not.toMatch(/\d-\d/);
			}
		}
	});
});
