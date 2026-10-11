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
