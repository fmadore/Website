import { describe, it, expect } from 'vitest';
import {
	describeSeries,
	describeStack,
	describeRanked,
	describeTreemap,
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
				8,
				{ singular: 'publication', plural: 'publications' }
			)
		).toBe(
			'Publications per year by type, 2013 to 2026, in 8 types. Busiest year: 2016, 6 publications.'
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
				3,
				{ singular: 'talk', plural: 'talks' }
			)
		).toBe('Talks per year by type, 2019 to 2020, in 3 types. Busiest year: 2019, 4 talks.');
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

describe('describeTreemap', () => {
	it('counts leaves and groups and names the largest leaf', () => {
		expect(
			describeTreemap(
				'Publication venues',
				[
					{
						label: 'Journals',
						children: [
							{ label: 'Islamic Africa', value: 4 },
							{ label: 'Africa Today', value: 2 }
						]
					},
					{ label: 'Publishers', children: [{ label: 'Brill', value: 3 }] }
				],
				{ singular: 'venue', plural: 'venues' },
				{ singular: 'publication', plural: 'publications' }
			)
		).toBe('Publication venues: 3 venues in 2 groups. Largest: Islamic Africa, 4 publications.');
	});

	it('says so when every group is empty', () => {
		expect(
			describeTreemap(
				'Talks by research project',
				[{ label: 'Project', children: [] }],
				{ singular: 'type', plural: 'types' },
				{ singular: 'talk', plural: 'talks' }
			)
		).toBe('Talks by research project: no data recorded.');
	});
});
