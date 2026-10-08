import { describe, it, expect } from 'vitest';
import { findRecord, normalise, search, summariseStructured } from './apiSearch';
import type { ApiItem as Item } from '$lib/apiContract';

const items: Item[] = [
	{
		id: 'campus-book',
		title: 'Religious Activism on Campuses in Togo and Benin',
		abstract: 'Christian and Muslim student associations on campus.',
		type: 'book',
		year: 2025,
		country: ['Togo', 'Benin'],
		tags: ['Student Activism', 'Islam']
	},
	{
		id: 'cote-divoire-article',
		title: "Islam et politique en Côte d'Ivoire",
		abstract: 'Muslim activism in Abidjan.',
		type: 'article',
		year: 2018,
		country: ["Côte d'Ivoire"],
		tags: ['Islam']
	},
	{
		id: 'minorities-chapter',
		title: 'Muslim Minorities in Benin',
		abstract: 'A study of campus life is not the subject here.',
		type: 'chapter',
		year: 2020,
		country: ['Benin'],
		tags: ['Islam']
	}
];

const fields = ['title', 'abstract', 'tags', 'country'] as const;
const run = (options: Partial<Parameters<typeof search>[1]> = {}) =>
	search(items, { fields, weighted: ['title'], ...options });

describe('normalise', () => {
	it('strips diacritics and lowercases', () => {
		expect(normalise("Côte d'Ivoire")).toBe("cote d'ivoire");
		expect(normalise('Laïcité')).toBe('laicite');
	});
});

describe('search', () => {
	it('returns everything when no query or filter is given', () => {
		const { hits, total } = run();
		expect(total).toBe(3);
		expect(hits).toHaveLength(3);
	});

	it('preserves dataset order for unranked results', () => {
		expect(run().hits.map((item) => item.id)).toEqual([
			'campus-book',
			'cote-divoire-article',
			'minorities-chapter'
		]);
	});

	it('requires every query term to appear', () => {
		expect(run({ query: 'campus togo' }).hits.map((i) => i.id)).toEqual(['campus-book']);
		expect(run({ query: 'campus nairobi' }).hits).toEqual([]);
	});

	it('matches accent-insensitively — the corpus is francophone', () => {
		expect(run({ query: "cote d'ivoire" }).hits.map((i) => i.id)).toEqual(['cote-divoire-article']);
		expect(run({ query: 'COTE' }).hits.map((i) => i.id)).toEqual(['cote-divoire-article']);
	});

	it('ranks a title hit above a body-only hit', () => {
		// 'campus' is in one title and one other item's abstract.
		expect(run({ query: 'campus' }).hits.map((i) => i.id)).toEqual([
			'campus-book',
			'minorities-chapter'
		]);
	});

	it('filters on a scalar field', () => {
		expect(run({ filters: { type: 'book' } }).hits.map((i) => i.id)).toEqual(['campus-book']);
	});

	it('filters on an array field', () => {
		expect(run({ filters: { country: 'Benin' } }).hits.map((i) => i.id)).toEqual([
			'campus-book',
			'minorities-chapter'
		]);
	});

	it('filters accent-insensitively', () => {
		expect(run({ filters: { country: "cote d'ivoire" } }).hits.map((i) => i.id)).toEqual([
			'cote-divoire-article'
		]);
	});

	it('matches an exact filter by whole value, never by containment', () => {
		const vocab: Item[] = [
			{ id: 'journal', type: 'article', country: ['Niger'] },
			{ id: 'bulletin', type: 'bulletin-article', country: ['Nigeria'] },
			{ id: 'abidjan', type: 'article', country: "Côte d'Ivoire" }
		];
		const ids = (exact: Record<string, string>) =>
			search(vocab, { fields, exact }).hits.map((item) => item.id);
		expect(ids({ type: 'article' })).toEqual(['journal', 'abidjan']);
		expect(ids({ country: 'Niger' })).toEqual(['journal']);
		expect(ids({ country: 'COTE D’IVOIRE' })).toEqual(['abidjan']);
		expect(ids({ type: '' })).toHaveLength(3);
	});

	it('ignores blank filter values rather than matching nothing', () => {
		expect(run({ filters: { type: undefined, country: '' } }).total).toBe(3);
	});

	it('applies an inclusive year range', () => {
		expect(run({ yearFrom: 2019, yearTo: 2025 }).hits.map((i) => i.id)).toEqual([
			'campus-book',
			'minorities-chapter'
		]);
		expect(run({ yearFrom: 2018, yearTo: 2018 }).hits.map((i) => i.id)).toEqual([
			'cote-divoire-article'
		]);
	});

	it('reports the full match count alongside a truncated page', () => {
		const { hits, total } = run({ limit: 1 });
		expect(hits).toHaveLength(1);
		expect(total).toBe(3);
	});

	it('supports stable offset pagination', () => {
		expect(run({ limit: 1, offset: 1 }).hits.map((item) => item.id)).toEqual([
			'cote-divoire-article'
		]);
	});
});

describe('summariseStructured', () => {
	it('keeps one compact row per hit and reports the next page', () => {
		const page = summariseStructured(
			[{ id: 'a', title: 'A', type: 'article', year: 2020, journal: 'J', url: 'https://x/a' }],
			3,
			1
		);
		expect(page).toEqual({
			total: 3,
			count: 1,
			offset: 1,
			items: [{ id: 'a', title: 'A', type: 'article', year: 2020, venue: 'J', url: 'https://x/a' }],
			has_more: true,
			next_offset: 2
		});
	});

	it('falls back to the id for an untitled record and omits absent fields', () => {
		const page = summariseStructured([{ id: 'untitled' }], 1);
		expect(page.items).toEqual([{ id: 'untitled', title: 'untitled' }]);
		expect(page).toMatchObject({ has_more: false });
		expect(page).not.toHaveProperty('next_offset');
	});
});

describe('findRecord', () => {
	it('returns the record with the id', () => {
		expect(findRecord(items, 'publications', 'campus-book').title).toContain('Campuses');
	});

	it('suggests ids that overlap the one asked for', () => {
		expect(() => findRecord(items, 'publications', 'campus')).toThrow(
			'No publications record with id "campus". Did you mean: campus-book?'
		);
	});

	it('points at the search tools when nothing is close', () => {
		expect(() => findRecord(items, 'research', 'nothing-like-it')).toThrow(
			'Use the matching search or list tool'
		);
	});
});
