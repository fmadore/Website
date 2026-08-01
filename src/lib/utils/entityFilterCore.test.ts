import { describe, it, expect } from 'vitest';
import {
	ENTITY_ARRAY_FILTER_KEYS,
	filterEntityItems,
	computeFacetCounts,
	computeDisjunctiveFacetCounts,
	toggleArrayValue,
	normalizeYearRange,
	type EntityArrayDimension,
	type EntityArrayFilterKey,
	type EntityIndexFilters
} from './entityFilterCore';

/** Minimal item shape mirroring the publication/communication records. */
interface TestItem {
	id: string;
	type: string;
	year: number;
	tags?: string[];
	language?: string;
	authors?: string[];
	country?: string[];
	project?: string;
}

const items: TestItem[] = [
	{
		id: 'p1',
		type: 'book',
		year: 2010,
		tags: ['Islam', 'Benin'],
		language: 'French',
		authors: ['Alice'],
		country: ['Benin'],
		project: 'P1'
	},
	{
		id: 'p2',
		type: 'article',
		year: 2015,
		tags: ['Islam'],
		language: 'English',
		authors: ['Bob'],
		country: ['Togo', 'Benin']
	},
	{
		id: 'p3',
		type: 'article',
		year: 2020,
		tags: [],
		language: 'French, English',
		authors: ['Alice', 'Bob'],
		project: 'P2'
	},
	{ id: 'p4', type: 'chapter', year: 2020 }
];

const dimensions: Record<EntityArrayFilterKey, EntityArrayDimension<TestItem>> = {
	types: {
		match: (item, values) => values.includes(item.type),
		countExtractor: (item) => item.type
	},
	tags: {
		match: (item, values) => !!item.tags && item.tags.some((t) => values.includes(t)),
		countExtractor: (item) => item.tags
	},
	languages: {
		match: (item, values) => {
			const langs = item.language ? item.language.split(',').map((l) => l.trim()) : [];
			return langs.some((l) => values.includes(l));
		},
		countExtractor: (item) => item.language?.split(',').map((l) => l.trim())
	},
	authors: {
		match: (item, values) => !!item.authors && item.authors.some((a) => values.includes(a)),
		countExtractor: (item) => item.authors
	},
	countries: {
		match: (item, values) => !!item.country && item.country.some((c) => values.includes(c)),
		countExtractor: (item) => item.country
	},
	projects: {
		match: (item, values) => !!item.project && values.includes(item.project),
		countExtractor: (item) => item.project
	}
};

const matchesYearRange = (item: TestItem, range: { min: number; max: number }) =>
	item.year >= range.min && item.year <= range.max;

function emptyFilters(): EntityIndexFilters {
	return {
		types: [],
		yearRange: null,
		tags: [],
		languages: [],
		authors: [],
		countries: [],
		projects: []
	};
}

function filtered(overrides: Partial<EntityIndexFilters>): TestItem[] {
	return filterEntityItems(
		items,
		{ ...emptyFilters(), ...overrides },
		dimensions,
		matchesYearRange
	);
}

const ids = (list: TestItem[]) => list.map((i) => i.id);

describe('filterEntityItems', () => {
	it('returns every item when no filter is active', () => {
		expect(ids(filtered({}))).toEqual(['p1', 'p2', 'p3', 'p4']);
	});

	it('filters by a single dimension', () => {
		expect(ids(filtered({ types: ['article'] }))).toEqual(['p2', 'p3']);
	});

	it('ORs values within a dimension', () => {
		expect(ids(filtered({ types: ['book', 'chapter'] }))).toEqual(['p1', 'p4']);
	});

	it('ANDs across dimensions', () => {
		expect(ids(filtered({ types: ['article'], authors: ['Alice'] }))).toEqual(['p3']);
		expect(ids(filtered({ types: ['book'], authors: ['Bob'] }))).toEqual([]);
	});

	it('applies the year range inclusively at both bounds', () => {
		expect(ids(filtered({ yearRange: { min: 2010, max: 2015 } }))).toEqual(['p1', 'p2']);
		expect(ids(filtered({ yearRange: { min: 2020, max: 2020 } }))).toEqual(['p3', 'p4']);
	});

	it('combines year range with array dimensions', () => {
		expect(ids(filtered({ yearRange: { min: 2015, max: 2020 }, tags: ['Islam'] }))).toEqual(['p2']);
	});

	it('excludes items lacking the dimension value entirely', () => {
		// p4 has no tags/authors/country/project.
		expect(ids(filtered({ tags: ['Islam'] }))).toEqual(['p1', 'p2']);
		expect(ids(filtered({ projects: ['P1'] }))).toEqual(['p1']);
	});

	it('handles multi-valued string fields via the dimension match (languages)', () => {
		expect(ids(filtered({ languages: ['English'] }))).toEqual(['p2', 'p3']);
		expect(ids(filtered({ languages: ['French'] }))).toEqual(['p1', 'p3']);
	});
});

describe('computeFacetCounts', () => {
	it('counts every dimension over the given items', () => {
		const counts = computeFacetCounts(items, dimensions);
		expect(Object.keys(counts).sort()).toEqual([...ENTITY_ARRAY_FILTER_KEYS].sort());
		expect(counts.types).toEqual({ book: 1, article: 2, chapter: 1 });
		expect(counts.tags).toEqual({ Islam: 2, Benin: 1 });
		expect(counts.languages).toEqual({ French: 2, English: 2 });
		expect(counts.authors).toEqual({ Alice: 2, Bob: 2 });
		expect(counts.countries).toEqual({ Benin: 2, Togo: 1 });
		expect(counts.projects).toEqual({ P1: 1, P2: 1 });
	});

	it('skips undefined, null, and empty extracted values', () => {
		const sparse: TestItem[] = [
			{ id: 'x1', type: '', year: 2000 },
			{ id: 'x2', type: 'book', year: 2001, tags: ['', 'valid'] }
		];
		const counts = computeFacetCounts(sparse, dimensions);
		expect(counts.types).toEqual({ book: 1 });
		expect(counts.tags).toEqual({ valid: 1 });
		expect(counts.projects).toEqual({});
	});
});

describe('computeDisjunctiveFacetCounts', () => {
	it('ignores the active values in the dimension being counted', () => {
		const filters = { ...emptyFilters(), types: ['book'] };
		const counts = computeDisjunctiveFacetCounts(items, filters, dimensions, matchesYearRange);
		expect(counts.types).toEqual({ book: 1, article: 2, chapter: 1 });
		expect(counts.tags).toEqual({ Islam: 1, Benin: 1 });
	});

	it('keeps every other active dimension and the year range applied', () => {
		const filters = {
			...emptyFilters(),
			types: ['article'],
			tags: ['Islam'],
			yearRange: { min: 2015, max: 2020 }
		};
		const counts = computeDisjunctiveFacetCounts(items, filters, dimensions, matchesYearRange);

		// Type counts ignore the active type but retain tag + year filters.
		expect(counts.types).toEqual({ article: 1 });
		// Tag counts ignore the active tag but retain type + year filters.
		expect(counts.tags).toEqual({ Islam: 1 });
		expect(counts.languages).toEqual({ English: 1 });
	});

	it('shows the number an OR selection would add instead of zero', () => {
		const filters = { ...emptyFilters(), types: ['book'] };
		const counts = computeDisjunctiveFacetCounts(items, filters, dimensions, matchesYearRange);
		expect(counts.types.chapter).toBe(1);
	});
});

describe('toggleArrayValue', () => {
	it('appends a missing value', () => {
		expect(toggleArrayValue(['a'], 'b')).toEqual(['a', 'b']);
		expect(toggleArrayValue([], 'a')).toEqual(['a']);
	});

	it('removes a present value', () => {
		expect(toggleArrayValue(['a', 'b'], 'a')).toEqual(['b']);
	});

	it('returns a new array without mutating the input', () => {
		const current = ['a'];
		const next = toggleArrayValue(current, 'b');
		expect(next).not.toBe(current);
		expect(current).toEqual(['a']);
	});
});

describe('normalizeYearRange', () => {
	it('keeps ordered bounds', () => {
		expect(normalizeYearRange(2000, 2010)).toEqual({ min: 2000, max: 2010 });
	});

	it('swaps reversed bounds', () => {
		expect(normalizeYearRange(2010, 2000)).toEqual({ min: 2000, max: 2010 });
	});

	it('accepts equal bounds', () => {
		expect(normalizeYearRange(2005, 2005)).toEqual({ min: 2005, max: 2005 });
	});
});
