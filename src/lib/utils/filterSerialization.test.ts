import { describe, it, expect } from 'vitest';
import {
	ARRAY_FILTER_PARAMS,
	serializeFiltersToQuery,
	parseArrayFilterParam,
	parseYearRangeParams,
	arrayValuesEqual,
	yearRangesEqual,
	type UrlSyncableFilters
} from './filterSerialization';

/** Parses a serialized query back into the filter shape, as the action does. */
function parseQuery(queryString: string): UrlSyncableFilters {
	const params = new URLSearchParams(queryString);
	const filters: UrlSyncableFilters = {};
	for (const [param, key] of ARRAY_FILTER_PARAMS) {
		const values = parseArrayFilterParam(params, param);
		if (values.length) filters[key] = values;
	}
	const range = parseYearRangeParams(params.get('year_min'), params.get('year_max'));
	if (range) filters.yearRange = range;
	return filters;
}

describe('serializeFiltersToQuery', () => {
	it('returns an empty string when nothing is active', () => {
		expect(serializeFiltersToQuery({})).toBe('');
		expect(serializeFiltersToQuery({ types: [], tags: [], languages: [], yearRange: null })).toBe(
			''
		);
	});

	it('serializes a single value per dimension', () => {
		expect(serializeFiltersToQuery({ types: ['book'] })).toBe('type=book');
		expect(serializeFiltersToQuery({ tags: ['Islam'] })).toBe('tag=Islam');
	});

	it('serializes multiple values as repeated params (one entry per value)', () => {
		expect(serializeFiltersToQuery({ tags: ['a', 'b', 'c'] })).toBe('tag=a&tag=b&tag=c');
	});

	it('maps every dimension to its param name', () => {
		const query = serializeFiltersToQuery({
			types: ['book'],
			tags: ['t1'],
			languages: ['French'],
			authors: ['A. Author'],
			countries: ['Benin'],
			projects: ['P1']
		});
		expect(query).toBe(
			'type=book&tag=t1&language=French&author=A.+Author&country=Benin&project=P1'
		);
	});

	it('serializes the year range as year_min/year_max', () => {
		expect(serializeFiltersToQuery({ yearRange: { min: 2010, max: 2020 } })).toBe(
			'year_min=2010&year_max=2020'
		);
	});

	it('URL-encodes values that need it', () => {
		const query = serializeFiltersToQuery({ tags: ['Côte d’Ivoire & more'] });
		const parsed = new URLSearchParams(query);
		expect(parsed.getAll('tag')).toEqual(['Côte d’Ivoire & more']);
	});
});

describe('parseArrayFilterParam', () => {
	it('returns an empty array when the param is absent', () => {
		expect(parseArrayFilterParam(new URLSearchParams(''), 'tag')).toEqual([]);
	});

	it('reads a single entry verbatim', () => {
		expect(parseArrayFilterParam(new URLSearchParams('tag=Islam'), 'tag')).toEqual(['Islam']);
	});

	it('reads repeated entries in order', () => {
		expect(parseArrayFilterParam(new URLSearchParams('tag=a&tag=b'), 'tag')).toEqual(['a', 'b']);
	});

	it('does not split a single entry containing commas (values may contain commas)', () => {
		const params = new URLSearchParams(
			'project=' + encodeURIComponent("Islam's 'Peripheries': DH, Algorithmic Analysis")
		);
		expect(parseArrayFilterParam(params, 'project')).toEqual([
			"Islam's 'Peripheries': DH, Algorithmic Analysis"
		]);
	});

	it('drops empty entries (malformed ?tag=&tag=a)', () => {
		expect(parseArrayFilterParam(new URLSearchParams('tag=&tag=a&tag='), 'tag')).toEqual(['a']);
	});
});

describe('parseYearRangeParams', () => {
	it('parses a valid pair', () => {
		expect(parseYearRangeParams('2010', '2020')).toEqual({ min: 2010, max: 2020 });
	});

	it('returns null when either bound is missing or empty', () => {
		expect(parseYearRangeParams(null, null)).toBeNull();
		expect(parseYearRangeParams('2010', null)).toBeNull();
		expect(parseYearRangeParams(null, '2020')).toBeNull();
		expect(parseYearRangeParams('', '2020')).toBeNull();
	});

	it('returns null on non-numeric bounds', () => {
		expect(parseYearRangeParams('abc', '2020')).toBeNull();
		expect(parseYearRangeParams('2010', 'xyz')).toBeNull();
	});

	it('tolerates numeric strings with trailing junk like parseInt does', () => {
		// Documents existing behaviour: parseInt('2010abc') === 2010.
		expect(parseYearRangeParams('2010abc', '2020')).toEqual({ min: 2010, max: 2020 });
	});
});

describe('round-trip serialization', () => {
	it('serialize -> parse restores the active filters', () => {
		const filters: UrlSyncableFilters = {
			types: ['book', 'article'],
			tags: ['Islam, politics', 'Benin'],
			languages: ['French'],
			authors: ['Frédérick Madore'],
			countries: ['Côte d’Ivoire'],
			projects: ["Islam's 'Peripheries': DH, Algorithmic Analysis"],
			yearRange: { min: 2005, max: 2024 }
		};
		expect(parseQuery(serializeFiltersToQuery(filters))).toEqual(filters);
	});

	it('empty filters round-trip to empty filters', () => {
		expect(parseQuery(serializeFiltersToQuery({}))).toEqual({});
	});
});

describe('arrayValuesEqual', () => {
	it('is order-insensitive', () => {
		expect(arrayValuesEqual(['a', 'b'], ['b', 'a'])).toBe(true);
	});

	it('treats undefined as empty', () => {
		expect(arrayValuesEqual(undefined, [])).toBe(true);
		expect(arrayValuesEqual(undefined, undefined)).toBe(true);
		expect(arrayValuesEqual(undefined, ['a'])).toBe(false);
	});

	it('detects differing values and lengths', () => {
		expect(arrayValuesEqual(['a'], ['b'])).toBe(false);
		expect(arrayValuesEqual(['a'], ['a', 'a'])).toBe(false);
	});

	it('does not mutate its inputs', () => {
		const a = ['b', 'a'];
		const b = ['a', 'b'];
		arrayValuesEqual(a, b);
		expect(a).toEqual(['b', 'a']);
		expect(b).toEqual(['a', 'b']);
	});
});

describe('yearRangesEqual', () => {
	it('compares by value', () => {
		expect(yearRangesEqual({ min: 1, max: 2 }, { min: 1, max: 2 })).toBe(true);
		expect(yearRangesEqual({ min: 1, max: 2 }, { min: 1, max: 3 })).toBe(false);
	});

	it('treats null and undefined as the same absent range', () => {
		expect(yearRangesEqual(null, undefined)).toBe(true);
		expect(yearRangesEqual(null, null)).toBe(true);
		expect(yearRangesEqual({ min: 1, max: 2 }, null)).toBe(false);
	});
});
