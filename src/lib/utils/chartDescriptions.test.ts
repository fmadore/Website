import { describe, it, expect } from 'vitest';
import {
	describeSeries,
	describeStack,
	describeProjectTimeline,
	describeRanked,
	type LabelledValue
} from './chartDescriptions';

const PAGES: LabelledValue[] = [
	{ label: '2013', value: 30 },
	{ label: '2014', value: 2 },
	{ label: '2018', value: 449 },
	{ label: '2026', value: 12 }
];

describe('describeSeries', () => {
	it('names the measure, the span and both extremes', () => {
		expect(
			describeSeries('Pages published per year', PAGES, {
				singular: 'page',
				plural: 'pages'
			})
		).toBe(
			'Pages published per year, 2013 to 2026. Highest: 2018, 449 pages. Lowest: 2014, 2 pages.'
		);
	});

	it('guards the singular', () => {
		expect(
			describeSeries(
				'Citations per year',
				[
					{ label: '2020', value: 1 },
					{ label: '2021', value: 4 }
				],
				{ singular: 'citation', plural: 'citations' }
			)
		).toBe(
			'Citations per year, 2020 to 2021. Highest: 2021, 4 citations. Lowest: 2020, 1 citation.'
		);
	});

	it('collapses a one-category series', () => {
		expect(
			describeSeries('Citations per year', [{ label: '2020', value: 3 }], {
				singular: 'citation',
				plural: 'citations'
			})
		).toBe('Citations per year, 2020. 2020: 3 citations.');
	});

	it('says so when there is nothing to describe', () => {
		expect(
			describeSeries('Pages published per year', [], { singular: 'page', plural: 'pages' })
		).toBe('Pages published per year: no data recorded.');
	});
});

describe('describeStack', () => {
	it('counts the layers and names the busiest year', () => {
		expect(
			describeStack(
				'Publications per year by type',
				[
					{ label: '2013', value: 2 },
					{ label: '2016', value: 6 },
					{ label: '2026', value: 3 }
				],
				[
					{ label: 'Book', value: 2 },
					{ label: 'Journal article', value: 6 },
					{ label: 'Blog post', value: 3 },
					{ label: 'Report', value: 0 }
				],
				{ singular: 'publication', plural: 'publications' }
			)
		).toBe(
			'Publications per year by type, 2013 to 2026, in 4 types. Largest: Journal article, 6; Blog post, 3; Book, 2. Busiest year: 2016, 6 publications.'
		);
	});

	it('takes the item noun from its caller', () => {
		expect(
			describeStack(
				'Talks per year by type',
				[
					{ label: '2019', value: 4 },
					{ label: '2020', value: 1 }
				],
				[
					{ label: 'Lecture', value: 3 },
					{ label: 'Poster', value: 2 }
				],
				{ singular: 'talk', plural: 'talks' }
			)
		).toBe(
			'Talks per year by type, 2019 to 2020, in 2 types. Largest: Lecture, 3; Poster, 2. Busiest year: 2019, 4 talks.'
		);
	});
});

describe('describeProjectTimeline', () => {
	const noun = { singular: 'publication', plural: 'publications' };

	it('states each period, its outputs and those outside it', () => {
		expect(
			describeProjectTimeline(
				[
					{
						name: 'Alpha',
						period: { startYear: 2013, endYear: 2018, ongoing: false },
						firstItemYear: 2014,
						lastItemYear: 2024,
						items: [1, 2, 3],
						outsidePeriod: 1
					},
					{
						name: 'Beta',
						period: { startYear: 2026, endYear: 2026, ongoing: true },
						firstItemYear: 2026,
						lastItemYear: 2026,
						items: [1],
						outsidePeriod: 0
					},
					{
						name: 'Gamma',
						period: null,
						firstItemYear: 2019,
						lastItemYear: 2021,
						items: [1, 2],
						outsidePeriod: 0
					}
				],
				noun
			)
		).toBe(
			'Research projects and their recorded periods, 3 projects. Alpha: ran from 2013 to 2018, 3 publications, 1 outside that period. Beta: running since 2026, 1 publication. Gamma: no recorded period, 2 publications from 2019 to 2021.'
		);
	});

	it('says so when there is nothing to describe', () => {
		expect(describeProjectTimeline([], noun)).toBe(
			'Research projects and their recorded periods: no data recorded.'
		);
	});
});

describe('describeRanked', () => {
	it('counts the bars and names the leader', () => {
		expect(
			describeRanked(
				'Two-word phrases by frequency',
				[
					{ label: 'jeune musulman', value: 52 },
					{ label: 'association islamique', value: 31 }
				],
				{ singular: 'phrase', plural: 'phrases' }
			)
		).toBe('Two-word phrases by frequency, 2 phrases. Most frequent: jeune musulman, 52.');
	});

	it('accepts a different lead-in', () => {
		expect(
			describeRanked(
				'Citations per author',
				[{ label: 'A. Author', value: 5 }],
				{ singular: 'author', plural: 'authors' },
				'Most citations'
			)
		).toBe('Citations per author, 1 author. Most citations: A. Author, 5.');
	});
});
