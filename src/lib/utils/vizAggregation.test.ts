import { describe, it, expect } from 'vitest';
import {
	tallyBy,
	groupByKey,
	buildCrossTab,
	buildProjectTimeline,
	buildLocationData,
	buildStackedByYear
} from './vizAggregation';

describe('tallyBy', () => {
	it('counts single-valued keys and sorts by count descending', () => {
		const items = [{ c: 'FR' }, { c: 'BJ' }, { c: 'FR' }, { c: 'FR' }, { c: 'BJ' }];
		expect(tallyBy(items, (i) => i.c)).toEqual([
			{ key: 'FR', count: 3 },
			{ key: 'BJ', count: 2 }
		]);
	});

	it('flattens array-valued keys (e.g. tags)', () => {
		const items = [{ tags: ['a', 'b'] }, { tags: ['a'] }, { tags: ['c', 'a'] }];
		expect(tallyBy(items, (i) => i.tags)).toEqual([
			{ key: 'a', count: 3 },
			{ key: 'b', count: 1 },
			{ key: 'c', count: 1 }
		]);
	});

	it('trims keys and skips empty / nullish values', () => {
		const items = [{ v: ' x ' }, { v: '' }, { v: undefined }, { v: 'x' }, { v: null }];
		expect(tallyBy(items, (i) => i.v as string | undefined | null)).toEqual([
			{ key: 'x', count: 2 }
		]);
	});

	it('sorts numerically by key ascending when requested', () => {
		const items = [{ y: '2011' }, { y: '2009' }, { y: '2011' }, { y: '2010' }];
		expect(tallyBy(items, (i) => i.y, { sort: 'key-asc' })).toEqual([
			{ key: '2009', count: 1 },
			{ key: '2010', count: 1 },
			{ key: '2011', count: 2 }
		]);
	});
});

describe('groupByKey', () => {
	it('buckets items by a string accessor and skips blank keys', () => {
		const items = [
			{ id: 1, p: 'A' },
			{ id: 2, p: 'B' },
			{ id: 3, p: 'A' },
			{ id: 4, p: '  ' },
			{ id: 5, p: undefined }
		];
		const groups = groupByKey(items, (i) => i.p);
		expect(Object.keys(groups).sort()).toEqual(['A', 'B']);
		expect(groups.A!.map((i) => i.id)).toEqual([1, 3]);
		expect(groups.B!.map((i) => i.id)).toEqual([2]);
	});
});

describe('buildCrossTab', () => {
	const items = [
		{ p: 'Alpha', t: 'lecture' },
		{ p: 'Alpha', t: 'conference' },
		{ p: 'Alpha', t: 'conference' },
		{ p: 'Beta', t: 'workshop' },
		{ p: 'Beta', t: 'conference' },
		{ p: 'Beta', t: 'conference' },
		{ p: 'Beta', t: 'conference' },
		{ p: ' ', t: 'conference' },
		{ p: 'Gamma', t: undefined }
	];
	const tab = buildCrossTab(
		items,
		(i) => i.p,
		(i) => i.t
	);

	it('orders rows and columns by total, largest first', () => {
		expect(tab.rows.map((r) => r.key)).toEqual(['Beta', 'Alpha']);
		expect(tab.columns).toEqual([
			{ key: 'conference', total: 5 },
			{ key: 'lecture', total: 1 },
			{ key: 'workshop', total: 1 }
		]);
	});

	it('lays each row out in column order, zero where nothing falls', () => {
		expect(tab.rows).toEqual([
			{ key: 'Beta', total: 4, cells: [3, 0, 1] },
			{ key: 'Alpha', total: 3, cells: [2, 1, 0] }
		]);
	});

	it('skips items with a blank row or column key', () => {
		expect(tab.total).toBe(7);
		expect(tab.rows.some((r) => r.key === 'Gamma')).toBe(false);
	});

	it('reports the extremes the marks are scaled to', () => {
		expect(tab.maxCell).toBe(3);
		expect(tab.maxRowTotal).toBe(4);
	});

	it('returns an empty table for no items', () => {
		expect(
			buildCrossTab(
				[] as { p: string }[],
				(i) => i.p,
				(i) => i.p
			)
		).toEqual({ rows: [], columns: [], maxCell: 0, maxRowTotal: 0, total: 0 });
	});
});

describe('buildProjectTimeline', () => {
	it('spans min→max year, sorts items chronologically, sorts entries by start', () => {
		const groups = {
			Later: [
				{ title: 'L2', year: 2020, type: 'x' },
				{ title: 'L1', year: 2018, type: 'x' }
			],
			Earlier: [{ title: 'E1', year: 2010, type: 'y' }]
		};
		const result = buildProjectTimeline(groups, (i) => ({
			title: i.title,
			year: i.year,
			type: i.type
		}));
		expect(result.map((e) => e.name)).toEqual(['Earlier', 'Later']);
		expect(result[1]).toMatchObject({ startYear: 2018, endYear: 2020 });
		expect(result[1]!.publications.map((p) => p.title)).toEqual(['L1', 'L2']);
	});
});

describe('buildLocationData', () => {
	it('groups by country, collects items, and sorts by count', () => {
		const items = [
			{ id: '1', title: 'One', country: 'Benin' },
			{ id: '2', title: 'Two', country: 'Togo' },
			{ id: '3', title: 'Three', country: 'Benin' },
			{ id: '4', title: 'Skip', country: '  ' }
		];
		const result = buildLocationData(
			items,
			(i) => i.country,
			(i) => ({ id: i.id, title: i.title })
		);
		expect(result).toEqual([
			{
				country: 'Benin',
				count: 2,
				items: [
					{ id: '1', title: 'One' },
					{ id: '3', title: 'Three' }
				]
			},
			{ country: 'Togo', count: 1, items: [{ id: '2', title: 'Two' }] }
		]);
	});
});

describe('buildStackedByYear', () => {
	const items = [
		{ year: 2020, type: 'article' },
		{ year: 2020, type: 'article' },
		{ year: 2020, type: 'book' },
		{ year: 2022, type: 'book' }
	];

	it('builds one row per year with a column per type key, sorted by year', () => {
		const rows = buildStackedByYear(items, {
			getYear: (i) => i.year,
			getType: (i) => i.type,
			typeKeys: ['article', 'book']
		});
		expect(rows).toEqual([
			{ year: 2020, article: 2, book: 1 },
			{ year: 2022, article: 0, book: 1 }
		]);
	});

	it('maps column names through labelFor', () => {
		const rows = buildStackedByYear(items, {
			getYear: (i) => i.year,
			getType: (i) => i.type,
			typeKeys: ['article', 'book'],
			labelFor: (t) => t.toUpperCase()
		});
		expect(rows[0]).toEqual({ year: 2020, ARTICLE: 2, BOOK: 1 });
	});

	it('ignores types outside typeKeys and returns [] for no items', () => {
		const rows = buildStackedByYear([{ year: 2021, type: 'stray' }], {
			getYear: (i) => i.year,
			getType: (i) => i.type,
			typeKeys: ['article']
		});
		expect(rows).toEqual([{ year: 2021, article: 0 }]);
		expect(buildStackedByYear([], { getYear: () => 0, getType: () => '', typeKeys: [] })).toEqual(
			[]
		);
	});
});
