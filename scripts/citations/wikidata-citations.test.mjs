import { expect, it } from 'vitest';
import { citationQuery, citationRows, compareWikidataCitations } from './wikidata-citations.mjs';

const book = {
	id: 'book',
	wikidataId: 'Q1',
	date: '2016',
	citedBy: [
		{ wikidataId: 'Q10', authors: ['A'], year: 2020, title: 'Linked on Wikidata' },
		{ wikidataId: 'Q11', authors: ['B'], year: 2021, title: 'Not linked on Wikidata' },
		{ authors: ['C'], year: 2022, title: 'No item yet' }
	],
	reviewedBy: [{ wikidataId: 'Q20', author: 'D', year: 2017, title: 'Review', journal: 'J' }]
};
const article = { id: 'article', wikidataId: 'Q2', date: '2018', citedBy: [] };
const soon = { id: 'soon', wikidataId: 'Q3', date: 'Forthcoming', citedBy: [] };
const row = (citing, cited, title = null, year = null) => ({ citing, cited, title, year });

it('asks both graphs for every item citing the records, with a title and a date', () => {
	const query = citationQuery(['Q1', 'Q2']);
	expect(query).toContain('VALUES ?cited { wd:Q1 wd:Q2 }');
	expect(query).toContain('?citing wdt:P2860 ?cited');
	expect(
		citationRows([
			{
				citing: { value: 'http://www.wikidata.org/entity/Q10' },
				cited: { value: 'http://www.wikidata.org/entity/Q1' },
				title: { value: 'Linked on Wikidata' },
				date: { value: '2020-05-01T00:00:00Z' }
			},
			{
				citing: { value: 'http://www.wikidata.org/entity/Q12' },
				cited: { value: 'http://www.wikidata.org/entity/Q1' }
			}
		])
	).toEqual([row('Q10', 'Q1', 'Linked on Wikidata', 2020), row('Q12', 'Q1')]);
});

it('reports citations the site does not record, but not its own works or its reviews', () => {
	const rows = [
		row('Q10', 'Q1'),
		row('Q30', 'Q1', 'A new citing work', 2024),
		row('Q30', 'Q2', 'A new citing work', 2024),
		row('Q31', 'Q2', 'An older one', 2019),
		row('Q2', 'Q1'), // the site's own article citing its book
		row('Q20', 'Q1'), // a review the book lists
		row('Q32', 'Q3') // a forthcoming record is not watched
	];
	const { unknown } = compareWikidataCitations([book, article, soon], rows);
	expect(unknown.map((u) => [u.qid, u.year, u.cites.map((r) => r.id)])).toEqual([
		['Q30', 2024, ['book', 'article']],
		['Q31', 2019, ['article']]
	]);
	const dismissed = compareWikidataCitations([book, article], rows, new Set(['wikidata:Q31']));
	expect(dismissed.unknown.map((u) => u.qid)).toEqual(['Q30']);
});

it('reports recorded QIDs whose item does not cite the work, and counts entries without one', () => {
	const { unlinked, withoutQid, entries } = compareWikidataCitations(
		[book, article],
		[row('Q10', 'Q1'), row('Q11', 'Q2')]
	);
	expect(unlinked.map((u) => [u.record.id, u.citing.wikidataId])).toEqual([['book', 'Q11']]);
	expect([withoutQid, entries]).toEqual([1, 3]);
});

it('flags a dismissal that no longer matches any citing item', () => {
	const { staleAcks } = compareWikidataCitations(
		[book],
		[row('Q10', 'Q1')],
		new Set(['wikidata:Q99', 'books:x'])
	);
	expect(staleAcks).toEqual(['wikidata:Q99']);
});
