import { expect, it } from 'vitest';
import {
	titleQueries,
	titleSimilarity,
	bestTitleMatch,
	searchTitleCandidates
} from './wikidata-titles.mjs';
import { classify } from './wikidata.mjs';

it('normalizes accents, punctuation, markup, nonbreaking spaces and missing spaces', () => {
	expect(
		titleSimilarity('Religion : <i>Étude</i> du Bénin', 'Religion\u00a0etude du Benin').score
	).toBe(1);
	expect(titleSimilarity('Religion:étude du Bénin', 'Religion étude du Bénin').score).toBe(1);
	expect(
		titleSimilarity(
			'Religious activism on university campuses',
			'Religiousactivism on university campuses'
		).method
	).toBe('spacing');
});
it('handles subtitles and typos without promoting generic titles or conflicting years', () => {
	expect(
		titleSimilarity(
			'Religious activism on university campuses: A study in Benin',
			'Religious activism on university campuses'
		).score
	).toBeGreaterThanOrEqual(0.92);
	expect(
		titleSimilarity(
			'Religious activism on university campuses: Student lives',
			'Religious activism on university campuses: Comparative history'
		).score
	).toBeGreaterThanOrEqual(0.88);
	expect(
		titleSimilarity(
			'Religious activism on university campuses',
			'Religious activsm on university campuses'
		).score
	).toBeGreaterThan(0.9);
	expect(titleSimilarity('Islam', 'Islam: History of religion in Africa').score).toBeLessThan(0.86);
	expect(
		titleSimilarity(
			'Religious activism on university campuses 2020',
			'Religious activism on university campuses 2024'
		).method
	).toBe('numeric-conflict');
	expect(titleSimilarity('', '').score).toBe(0);
	expect(
		titleSimilarity(
			'Religious activism on university campuses',
			'Botanical classification of tropical trees'
		).score
	).toBeLessThan(0.86);
});
it('expands retrieval with bounded and deduplicated queries', () => {
	const queries = titleQueries(
		'Religious activism on university campuses: An extended historical study in Benin and Togo'
	);
	expect(queries).toContain('religious activism on university campuses');
	expect(queries.length).toBeLessThanOrEqual(4);
	expect(titleQueries('Islam: A history')).not.toContain('islam');
	expect(titleQueries('simple lower case title')).toEqual(['simple lower case title']);
	expect(titleQueries('Religious activism on university campuses — A study')).toContain(
		'religious activism on university campuses'
	);
});
it('retrieves main-title-only results and caches repeated searches', async () => {
	const calls = [];
	const request = async (_api, params) => {
		calls.push(params);
		return {
			search: params.search === 'religious activism on university campuses' ? [{ id: 'Q123' }] : []
		};
	};
	const cache = new Map();
	const title = 'Religious activism on university campuses: Student lives';
	const matches = await searchTitleCandidates(title, request, 'https://example.org', cache);
	expect(matches.get('Q123')).toHaveLength(3);
	const count = calls.length;
	await searchTitleCandidates(title, request, 'https://example.org', cache);
	expect(calls).toHaveLength(count);
	await expect(
		searchTitleCandidates(title, async () => ({}), 'https://example.org')
	).rejects.toThrow('Malformed');
});
it('compares aliases and leaves title-only hits for review even at score 1', () => {
	const c = {
		qid: 'Q123',
		labels: { en: 'Another title' },
		titles: [],
		aliases: ['Religious activism on university campuses'],
		reasons: ['author-title-fuzzy'],
		dois: []
	};
	expect(bestTitleMatch('Religious activism on university campuses', c).score).toBe(1);
	expect(classify({ title: 'Religious activism on university campuses' }, [c]).status).toBe(
		'review'
	);
});
