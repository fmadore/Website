import { describe, it, expect } from 'vitest';
import {
	featuredWriting,
	formatDayMonth,
	homeBooks,
	mainTitle,
	latestWriting,
	outputRecord,
	upcomingTalks,
	venueOf,
	yearOf
} from './homeDigest';
import { allPublicationSummaries } from '#lib/data/publications/summaries.ts';
import { allCommunicationSummaries } from '#lib/data/communications/summaries.ts';

const pub = (id: string, type: string, dateISO: string, extra: Record<string, unknown> = {}) =>
	({ id, type, title: `T ${id}`, dateISO, year: Number(dateISO.slice(0, 4)), ...extra }) as never;

describe('homeBooks', () => {
	it('keeps the books with a cover, newest first, and marks edited volumes', () => {
		const books = homeBooks([
			pub('a', 'book', '2016', { image: 'images/a.webp' }),
			pub('b', 'article', '2026', { image: 'images/b.webp' }),
			pub('c', 'book', '2023', { image: 'images/c.webp', isEditedVolume: true }),
			pub('d', 'book', '2025')
		]);
		expect(books.map(({ id, edited }) => [id, edited])).toEqual([
			['c', true],
			['a', false]
		]);
	});
});

describe('mainTitle', () => {
	it('drops the subtitle, and leaves a title without one alone', () => {
		expect(mainTitle('Religiosity on University Campuses in Africa: Trends and Experiences')).toBe(
			'Religiosity on University Campuses in Africa'
		);
		expect(mainTitle('La construction d’une sphère publique')).toBe(
			'La construction d’une sphère publique'
		);
	});
});

describe('latestWriting', () => {
	it('takes the newest non-book publications, with their venue', () => {
		const rows = latestWriting(
			[
				pub('a', 'article', '2026-03', { journal: 'J' }),
				pub('b', 'book', '2026-10'),
				pub('c', 'chapter', '2026-09', { book: 'B' }),
				pub('d', 'report', '2020'),
				pub('e', 'bulletin-article', '2026-10'),
				pub('f', 'blogpost', '2026-11')
			],
			2
		);
		expect(rows).toEqual([
			{ id: 'c', title: 'T c', year: 2026, when: '2026', venue: 'B' },
			{ id: 'a', title: 'T a', year: 2026, when: '2026', venue: 'J' }
		]);
	});

	it('names the venue in the order a reader would', () => {
		expect(venueOf(pub('a', 'x', '2020', { journal: 'J', publisher: 'P' }))).toBe('J');
		expect(venueOf(pub('a', 'x', '2020', { proceedingsTitle: 'Pr', publisher: 'P' }))).toBe('Pr');
		expect(venueOf(pub('a', 'x', '2020', { series: 'S', publisher: 'P' }))).toBe('S');
		expect(venueOf(pub('a', 'x', '2020', { publisher: 'P' }))).toBe('P');
		expect(venueOf(pub('a', 'x', '2020'))).toBeUndefined();
	});
});

describe('featuredWriting', () => {
	const pubs = [
		pub('a', 'article', '2020', { journal: 'J' }),
		pub('b', 'blogpost', '2026'),
		pub('c', 'chapter', '2024', { book: 'B' })
	];

	it('keeps the picked publications in the order picked, whatever their type', () => {
		expect(featuredWriting(pubs, ['c', 'b', 'a'])).toEqual([
			{ id: 'c', title: 'T c', year: 2024, when: '2024', venue: 'B' },
			{ id: 'b', title: 'T b', year: 2026, when: '2026' },
			{ id: 'a', title: 'T a', year: 2020, when: '2020', venue: 'J' }
		]);
	});

	it('prints "Forthcoming" for unpublished work, in place of the year', () => {
		const [row] = featuredWriting([pub('f', 'article', '2026', { date: 'Forthcoming' })], ['f']);
		expect(row?.when).toBe('Forthcoming');
		expect(row?.year).toBe(2026);
	});

	it('throws on an id that names no publication', () => {
		expect(() => featuredWriting(pubs, ['a', 'nope'])).toThrow(/"nope"/);
	});
});

describe('upcomingTalks', () => {
	const talk = (id: string, dateISO: string) => ({
		id,
		title: `T ${id}`,
		dateISO,
		year: Number(dateISO.slice(0, 4))
	});

	it('keeps day-dated talks from today on, soonest first', () => {
		const rows = upcomingTalks(
			[
				talk('past', '2026-11-03'),
				talk('later', '2026-12-03'),
				talk('today', '2026-11-04'),
				talk('month-only', '2026-12'),
				talk('soon', '2026-11-09')
			],
			'2026-11-04',
			2
		);
		expect(rows.map(({ id }) => id)).toEqual(['today', 'soon']);
	});
});

describe('outputRecord', () => {
	it('counts both series over their joint span, empty years included', () => {
		const record = outputRecord(
			[{ year: 2013 }, { year: 2013 }, { year: 2016 }],
			[{ year: 2012 }, { year: 2016 }]
		);
		expect(record.publications).toBe(3);
		expect(record.talks).toBe(2);
		expect(record.years).toEqual([
			{ year: 2012, publications: 0, talks: 1 },
			{ year: 2013, publications: 2, talks: 0 },
			{ year: 2014, publications: 0, talks: 0 },
			{ year: 2015, publications: 0, talks: 0 },
			{ year: 2016, publications: 1, talks: 1 }
		]);
	});

	it('reads empty datasets as an empty record', () => {
		expect(outputRecord([], [])).toEqual({ years: [], publications: 0, talks: 0 });
	});

	it('accounts for every publication and talk on the site', () => {
		const record = outputRecord(allPublicationSummaries, allCommunicationSummaries);
		const sum = (key: 'publications' | 'talks') =>
			record.years.reduce((total, row) => total + row[key], 0);
		expect(sum('publications')).toBe(allPublicationSummaries.length);
		expect(sum('talks')).toBe(allCommunicationSummaries.length);
	});
});

describe('formatDayMonth', () => {
	it('formats the day as written, whatever the time zone', () => {
		expect(formatDayMonth('2026-10-08')).toBe('08 Oct');
		expect(formatDayMonth('2026-01-01')).toBe('01 Jan');
	});

	it('returns what it cannot read unchanged', () => {
		expect(formatDayMonth('2026')).toBe('2026');
	});

	it('reads the year off the string', () => {
		expect(yearOf('2026-10-08')).toBe('2026');
	});
});
