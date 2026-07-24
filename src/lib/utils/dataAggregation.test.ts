import { describe, it, expect } from 'vitest';
import {
	sortByDate,
	sortByYear,
	sortByYearRange,
	groupByYear,
	groupByField,
	extractUnique,
	extractUniqueTags,
	extractUniqueDelimited
} from './dataAggregation';

describe('sortByDate', () => {
	it('sorts by dateISO descending (newest first)', () => {
		const items = [{ dateISO: '2020-01-01' }, { dateISO: '2024-06-15' }, { dateISO: '2022-03-10' }];
		expect(sortByDate(items).map((i) => i.dateISO)).toEqual([
			'2024-06-15',
			'2022-03-10',
			'2020-01-01'
		]);
	});

	it('pushes missing and unparseable dates to the end, keeping their relative order', () => {
		const items = [
			{ id: 'placeholder', dateISO: 'YYYY-MM-DD' },
			{ id: 'old', dateISO: '2019-05-01' },
			{ id: 'missing', dateISO: undefined as unknown as string },
			{ id: 'new', dateISO: '2023-11-30' },
			{ id: 'empty', dateISO: '' }
		];
		expect(sortByDate(items).map((i) => i.id)).toEqual([
			'new',
			'old',
			'placeholder',
			'missing',
			'empty'
		]);
	});

	it('supports a custom date field', () => {
		const items = [{ published: '2021-01-01' }, { published: '2022-01-01' }];
		expect(sortByDate(items, 'published').map((i) => i.published)).toEqual([
			'2022-01-01',
			'2021-01-01'
		]);
	});

	it('returns a new array and does not mutate the input', () => {
		const items = [{ dateISO: '2020-01-01' }, { dateISO: '2024-01-01' }];
		const result = sortByDate(items);
		expect(result).not.toBe(items);
		expect(items.map((i) => i.dateISO)).toEqual(['2020-01-01', '2024-01-01']);
	});
});

describe('sortByYear', () => {
	it('sorts by year descending', () => {
		const items = [{ year: 2010 }, { year: 2024 }, { year: 2017 }];
		expect(sortByYear(items).map((i) => i.year)).toEqual([2024, 2017, 2010]);
	});
});

describe('sortByYearRange', () => {
	it('floats ongoing entries (null endYear) above finished ones, ordered by startYear desc', () => {
		const items = [
			{ id: 'finished', startYear: 2022, endYear: 2023 },
			{ id: 'ongoing-old', startYear: 2018, endYear: null },
			{ id: 'ongoing-new', startYear: 2021, endYear: null }
		];
		expect(sortByYearRange(items).map((i) => i.id)).toEqual([
			'ongoing-new',
			'ongoing-old',
			'finished'
		]);
	});

	it('orders finished entries by endYear desc, then startYear desc', () => {
		const items = [
			{ id: 'a', startYear: 2010, endYear: 2015 },
			{ id: 'b', startYear: 2012, endYear: 2020 },
			{ id: 'c', startYear: 2015, endYear: 2020 }
		];
		expect(sortByYearRange(items).map((i) => i.id)).toEqual(['c', 'b', 'a']);
	});

	it('treats an undefined endYear as 0 (sorts after other finished entries, not as ongoing)', () => {
		const items = [
			{ id: 'no-end', startYear: 2024 },
			{ id: 'ongoing', startYear: 2000, endYear: null },
			{ id: 'finished', startYear: 2001, endYear: 2002 }
		];
		expect(sortByYearRange(items).map((i) => i.id)).toEqual(['ongoing', 'finished', 'no-end']);
	});
});

describe('groupByYear', () => {
	it('groups items into arrays keyed by year', () => {
		const items = [
			{ id: 1, year: 2020 },
			{ id: 2, year: 2021 },
			{ id: 3, year: 2020 }
		];
		const groups = groupByYear(items);
		expect(Object.keys(groups).sort()).toEqual(['2020', '2021']);
		expect(groups[2020]!.map((i) => i.id)).toEqual([1, 3]);
		expect(groups[2021]!.map((i) => i.id)).toEqual([2]);
	});
});

describe('groupByField', () => {
	it('groups by a string field and skips falsy values', () => {
		const items = [
			{ id: 1, project: 'Alpha' },
			{ id: 2, project: '' },
			{ id: 3, project: 'Beta' },
			{ id: 4, project: undefined },
			{ id: 5, project: 'Alpha' }
		];
		const groups = groupByField(items, 'project');
		expect(Object.keys(groups).sort()).toEqual(['Alpha', 'Beta']);
		expect(groups.Alpha!.map((i) => i.id)).toEqual([1, 5]);
		expect(groups.Beta!.map((i) => i.id)).toEqual([3]);
	});
});

describe('extractUnique', () => {
	it('returns sorted unique values, dropping falsy entries', () => {
		const items = [
			{ country: 'Togo' },
			{ country: 'Benin' },
			{ country: '' },
			{ country: 'Togo' },
			{ country: undefined }
		];
		expect(extractUnique(items, 'country')).toEqual(['Benin', 'Togo']);
	});
});

describe('extractUniqueTags', () => {
	it('flattens array fields into sorted unique values', () => {
		const items = [{ tags: ['islam', 'benin'] }, { tags: ['togo', 'islam'] }, { tags: ['benin'] }];
		expect(extractUniqueTags(items, 'tags')).toEqual(['benin', 'islam', 'togo']);
	});

	it('ignores non-array field values', () => {
		const items = [{ tags: 'not-an-array' as unknown as string[] }, { tags: undefined }];
		expect(extractUniqueTags(items, 'tags')).toEqual([]);
	});
});

describe('extractUniqueDelimited', () => {
	it('splits on the default comma delimiter, trims, dedupes, and sorts', () => {
		const items = [{ langs: 'French,  English' }, { langs: 'English , Arabic' }];
		expect(extractUniqueDelimited(items, 'langs')).toEqual(['Arabic', 'English', 'French']);
	});

	it('supports a custom delimiter and skips non-string values', () => {
		const items = [
			{ langs: 'French; English' },
			{ langs: 42 as unknown as string },
			{ langs: undefined }
		];
		expect(extractUniqueDelimited(items, 'langs', ';')).toEqual(['English', 'French']);
	});
});
