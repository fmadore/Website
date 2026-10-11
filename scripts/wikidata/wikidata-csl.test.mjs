import { expect, it } from 'vitest';
import { containerDois, exportCsl, series, toCsl } from './wikidata-csl.mjs';

const chapter = {
	id: 'chapter-2023',
	type: 'chapter',
	title: 'Exister en contexte autoritaire',
	authors: ['Frédérick Madore'],
	date: '2023',
	dateISO: '2023',
	year: 2023,
	language: 'French',
	book: 'Religiosity on University Campuses in Africa',
	editors: 'Abdoulaye Sounaye, Frédérick Madore',
	pages: '51-83',
	publisher: 'LIT Verlag',
	doi: '10.58144/20241107-000'
};
const book = {
	...chapter,
	id: 'book-2023',
	type: 'book',
	title: 'Religiosity on University Campuses in Africa',
	authors: ['Abdoulaye Sounaye', { name: 'Frédérick Madore', personId: 'frederick-madore' }],
	isEditedVolume: true,
	isbn: '978-3-643-91429-3',
	series: 'Afrikanische Studien/African Studies 64',
	language: 'English, French',
	wikidataId: 'Q117599346'
};

it('leaves forthcoming records out, whatever their estimated date or DOI', () => {
	const forthcoming = { ...chapter, id: 'soon', date: 'Forthcoming', dateISO: '2026' };
	const { items, excluded } = exportCsl([chapter, forthcoming]);
	expect(items.map((i) => i.id)).toEqual(['chapter-2023']);
	expect(excluded).toEqual(['soon']);
	expect(() => toCsl(forthcoming)).toThrow('Forthcoming');
});

it('moves a DOI shared with the volume to the chapter’s containerDoi', () => {
	const shared = containerDois([chapter, book]);
	const c = toCsl(chapter, shared);
	const b = toCsl(book, shared);
	expect(c.DOI).toBeUndefined();
	expect(c.custom.containerDoi).toBe('10.58144/20241107-000');
	expect(b.DOI).toBe('10.58144/20241107-000');
	expect(toCsl(chapter).DOI).toBe('10.58144/20241107-000');
});

it('treats a ZMO Bulletin DOI as the issue’s, even with one record citing it', () => {
	const report = {
		...chapter,
		id: 'bulletin-44',
		type: 'bulletin-article',
		journal: 'ZMO Bulletin',
		issue: '44',
		doi: '10.58144/20240415-000'
	};
	expect(toCsl(report).DOI).toBeUndefined();
	expect(toCsl(report).custom.containerDoi).toBe('10.58144/20240415-000');
	const yearbook = { ...report, id: 'yearbook-article', journal: 'Shared World' };
	expect(toCsl(yearbook).DOI).toBe('10.58144/20240415-000');
});

it('maps editors, languages, series and the recorded QID', () => {
	const b = toCsl(book);
	expect(b.type).toBe('book');
	expect(b.author).toBeUndefined();
	expect(b.editor).toEqual([{ literal: 'Abdoulaye Sounaye' }, { literal: 'Frédérick Madore' }]);
	expect(b.language).toBe('en, fr');
	expect(b['collection-title']).toBe('Afrikanische Studien/African Studies');
	expect(b['collection-number']).toBe('64');
	expect(b.custom.wikidata).toBe('Q117599346');
	expect(toCsl({ ...chapter, openAlexId: 'W2966130854' }).custom.openalex).toBe('W2966130854');
	const c = toCsl(chapter);
	expect(c.author).toEqual([{ literal: 'Frédérick Madore' }]);
	expect(c.editor).toEqual([{ literal: 'Abdoulaye Sounaye' }, { literal: 'Frédérick Madore' }]);
	expect(c['container-title']).toBe('Religiosity on University Campuses in Africa');
	expect(series('Religions, cultures et sociétés')).toEqual({
		'collection-title': 'Religions, cultures et sociétés'
	});
});

it('gives each site type a CSL type the skill can template', () => {
	const types = {
		'bulletin-article': ['article', 'article'],
		'working-paper': ['report', 'working-paper'],
		'special-issue': ['periodical', 'special-issue'],
		'masters-thesis': ['thesis', undefined]
	};
	for (const [type, [csl, template]] of Object.entries(types)) {
		const item = toCsl({ ...chapter, type, isEditedWork: type === 'special-issue' });
		expect(item.type).toBe(csl);
		expect(item.custom.template).toBe(template);
	}
	expect(() => toCsl({ ...chapter, type: 'poster' })).toThrow('No CSL mapping');
});

it('exports each review after its book, as the review of a book', () => {
	const reviewed = {
		...book,
		reviewedBy: [
			{
				author: 'Douglas J. Falen',
				year: 2026,
				title: 'Frédérick Madore. Religiosity on University Campuses in Africa',
				journal: 'African Studies Review',
				volume: '69',
				issue: '3',
				pages: '784-785',
				url: 'https://doi.org/10.1017/asr.2025.10172',
				language: 'English'
			},
			{
				wikidataId: 'Q113955277',
				author: 'Christine Chevalier-Caron',
				year: 2016,
				title: 'Compte rendu',
				journal: 'Le Manuscrit',
				language: 'French'
			}
		]
	};
	const { items } = exportCsl([reviewed]);
	expect(items.map((i) => i.id)).toEqual([
		'book-2023',
		'book-2023--review-falen-2026',
		'book-2023--review-chevalier-caron-2016'
	]);
	const [, falen, chevalier] = items;
	expect(falen).toMatchObject({
		type: 'review-book',
		author: [{ literal: 'Douglas J. Falen' }],
		'reviewed-title': 'Religiosity on University Campuses in Africa',
		'container-title': 'African Studies Review',
		page: '784-785',
		DOI: '10.1017/asr.2025.10172',
		language: 'en',
		issued: { 'date-parts': [[2026]] },
		custom: { reviewOf: 'Q117599346' }
	});
	expect(chevalier.custom).toEqual({ wikidata: 'Q113955277', reviewOf: 'Q117599346' });
	expect(chevalier.DOI).toBeUndefined();
	expect(() =>
		exportCsl([{ ...reviewed, reviewedBy: [reviewed.reviewedBy[0], reviewed.reviewedBy[0]] }])
	).toThrow('share the ID');
});
