import { describe, it, expect } from 'vitest';
import {
	ENTITY_ARRAY_FILTER_KEYS,
	filterEntityItems,
	computeFacetCounts,
	computeDisjunctiveFacets,
	countActiveFilters,
	matchesSearchTerms,
	summariseYears,
	toggleArrayValue,
	normalizeYearRange,
	clampYearRange,
	truncateSearchTerm,
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

describe('computeDisjunctiveFacets: counts', () => {
	it('ignores the active values in the dimension being counted', () => {
		const filters = { ...emptyFilters(), types: ['book'] };
		const { counts } = computeDisjunctiveFacets(items, filters, dimensions, matchesYearRange);
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
		const { counts } = computeDisjunctiveFacets(items, filters, dimensions, matchesYearRange);

		// Type counts ignore the active type but retain tag + year filters.
		expect(counts.types).toEqual({ article: 1 });
		// Tag counts ignore the active tag but retain type + year filters.
		expect(counts.tags).toEqual({ Islam: 1 });
		expect(counts.languages).toEqual({ English: 1 });
	});

	it('shows the number an OR selection would add instead of zero', () => {
		const filters = { ...emptyFilters(), types: ['book'] };
		const { counts } = computeDisjunctiveFacets(items, filters, dimensions, matchesYearRange);
		expect(counts.types.chapter).toBe(1);
	});
});

describe('computeDisjunctiveFacets: totals', () => {
	it('reports how many items clearing one dimension alone would return', () => {
		const filters = { ...emptyFilters(), types: ['book'] };
		const { totals } = computeDisjunctiveFacets(items, filters, dimensions, matchesYearRange);
		// Types cleared: the whole corpus. Every other dimension still sees the
		// one book the active type admits.
		expect(totals.types).toBe(4);
		expect(totals.tags).toBe(1);
		expect(totals.languages).toBe(1);
	});

	it('keeps every other active dimension and the year range applied', () => {
		const filters = {
			...emptyFilters(),
			types: ['article'],
			tags: ['Islam'],
			yearRange: { min: 2015, max: 2020 }
		};
		const { totals } = computeDisjunctiveFacets(items, filters, dimensions, matchesYearRange);
		// p2 alone is an Islam-tagged article in range; clearing types adds nothing
		// else tagged Islam in 2015-2020.
		expect(totals.types).toBe(1);
		// Clearing tags admits p3 (article, 2020, untagged) as well.
		expect(totals.tags).toBe(2);
	});

	it('is not the sum of the facet counts for a multi-valued dimension', () => {
		const filters = emptyFilters();
		const { counts } = computeDisjunctiveFacets(items, filters, dimensions, matchesYearRange);
		const { totals } = computeDisjunctiveFacets(items, filters, dimensions, matchesYearRange);
		// p3 is "French, English", so the language counts sum to 4 over 4 items —
		// one of which (p4) has no language at all. The total is the item count.
		const languageSum = Object.values(counts.languages).reduce((a, b) => a + b, 0);
		expect(languageSum).toBe(4);
		expect(totals.languages).toBe(items.length);
		// Types are single-valued and every item has one, so there the two agree.
		const typeSum = Object.values(counts.types).reduce((a, b) => a + b, 0);
		expect(typeSum).toBe(totals.types);
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

describe('clampYearRange', () => {
	it('returns the corpus span when no range is set', () => {
		expect(clampYearRange(null, 2013, 2026)).toEqual({ min: 2013, max: 2026 });
		expect(clampYearRange(undefined, 2013, 2026)).toEqual({ min: 2013, max: 2026 });
	});

	it('leaves a range already inside the corpus alone', () => {
		expect(clampYearRange({ min: 2018, max: 2020 }, 2013, 2026)).toEqual({
			min: 2018,
			max: 2020
		});
	});

	it('pulls a deep link wider than the corpus back to the bounds', () => {
		expect(clampYearRange({ min: 1900, max: 2100 }, 2013, 2026)).toEqual({
			min: 2013,
			max: 2026
		});
	});

	it('collapses a range that falls entirely outside the corpus onto the nearest bound', () => {
		expect(clampYearRange({ min: 1990, max: 2000 }, 2013, 2026)).toEqual({
			min: 2013,
			max: 2013
		});
		expect(clampYearRange({ min: 2030, max: 2040 }, 2013, 2026)).toEqual({
			min: 2026,
			max: 2026
		});
	});

	it('keeps a collapsed range collapsed', () => {
		expect(clampYearRange({ min: 2018, max: 2018 }, 2013, 2026)).toEqual({
			min: 2018,
			max: 2018
		});
	});

	it('orders the result even when handed inverted bounds', () => {
		expect(clampYearRange({ min: 2020, max: 2015 }, 2013, 2026)).toEqual({
			min: 2015,
			max: 2020
		});
	});

	it('hands back an inverted corpus rather than inventing a span', () => {
		expect(clampYearRange({ min: 2018, max: 2018 }, 2026, 2013)).toEqual({
			min: 2026,
			max: 2013
		});
	});
});

describe('truncateSearchTerm', () => {
	it('returns a short term trimmed and unchanged', () => {
		expect(truncateSearchTerm('  Islam  ')).toBe('Islam');
	});

	it('cuts at 60 characters and closes with an ellipsis', () => {
		const term = 'a'.repeat(80);
		const result = truncateSearchTerm(term);
		expect(result).toBe(`${'a'.repeat(60)}…`);
		expect(result).toHaveLength(61);
	});

	it('leaves a term of exactly the limit intact', () => {
		const term = 'b'.repeat(60);
		expect(truncateSearchTerm(term)).toBe(term);
	});

	it('honours a custom limit', () => {
		expect(truncateSearchTerm('abcdef', 3)).toBe('abc…');
	});
});

it('extracts each eligible facet once while calculating counts and totals together', () => {
	let calls = 0;
	const instrumented = Object.fromEntries(
		ENTITY_ARRAY_FILTER_KEYS.map((key) => [
			key,
			{
				...dimensions[key],
				countExtractor: (item: TestItem) => {
					calls++;
					return dimensions[key].countExtractor(item);
				}
			}
		])
	) as typeof dimensions;
	const filters: EntityIndexFilters = {
		types: [],
		tags: [],
		languages: [],
		authors: [],
		countries: [],
		projects: [],
		yearRange: null
	};
	const result = computeDisjunctiveFacets(items, filters, instrumented, () => true);
	expect(calls).toBe(items.length * ENTITY_ARRAY_FILTER_KEYS.length);
	expect(result.counts).toEqual(computeFacetCounts(items, dimensions));
	expect(Object.values(result.totals)).toEqual(ENTITY_ARRAY_FILTER_KEYS.map(() => items.length));
});

describe('countActiveFilters', () => {
	it('is zero with nothing set', () => {
		expect(countActiveFilters(emptyFilters())).toBe(0);
	});

	it('counts each facet value once and a year range once', () => {
		expect(
			countActiveFilters({
				...emptyFilters(),
				types: ['book', 'article'],
				tags: ['Islam'],
				projects: ['P1'],
				yearRange: { min: 2010, max: 2015 }
			})
		).toBe(5);
	});

	it('covers every array dimension', () => {
		const filters = emptyFilters();
		for (const key of ENTITY_ARRAY_FILTER_KEYS) filters[key] = ['x'];
		expect(countActiveFilters(filters)).toBe(ENTITY_ARRAY_FILTER_KEYS.length);
	});
});

describe('matchesSearchTerms', () => {
	const fields = ['Religious Activism on Campuses', '2021', 'Frédérick Madore', 'Islam', 'Togo'];

	it('matches everything on an empty or blank query', () => {
		expect(matchesSearchTerms(fields, '')).toBe(true);
		expect(matchesSearchTerms(fields, '   ')).toBe(true);
	});

	it('requires every term, in any field, case-insensitively', () => {
		expect(matchesSearchTerms(fields, 'activism TOGO')).toBe(true);
		expect(matchesSearchTerms(fields, 'activism benin')).toBe(false);
	});

	it('never matches a term across two fields', () => {
		// "islamtogo" would only exist if the fields ran together.
		expect(matchesSearchTerms(fields, 'islamtogo')).toBe(false);
	});
});

describe('summariseYears', () => {
	it('spans first to last year with an empty year kept as a stub', () => {
		const { minYear, maxYear, bars } = summariseYears([2020, 2022, 2022, 2022, 2023]);
		expect([minYear, maxYear]).toEqual([2020, 2023]);
		expect(bars.map((bar) => [bar.year, bar.count])).toEqual([
			[2020, 1],
			[2021, 0],
			[2022, 3],
			[2023, 1]
		]);
		expect(bars.find((bar) => bar.year === 2021)?.pct).toBe(6);
		expect(bars.find((bar) => bar.year === 2022)?.pct).toBe(100);
		expect(bars.find((bar) => bar.year === 2020)?.pct).toBe(Math.round(12 + (1 / 3) * 88));
	});

	it('ignores non-finite years', () => {
		const { minYear, maxYear, bars } = summariseYears([2019, Number.NaN, 2019]);
		expect([minYear, maxYear]).toEqual([2019, 2019]);
		expect(bars).toEqual([{ year: 2019, count: 2, pct: 100 }]);
	});

	it('reads an empty corpus as this year with no entries', () => {
		const thisYear = new Date().getFullYear();
		expect(summariseYears([])).toEqual({
			minYear: thisYear,
			maxYear: thisYear,
			bars: [{ year: thisYear, count: 0, pct: 6 }]
		});
	});
});
