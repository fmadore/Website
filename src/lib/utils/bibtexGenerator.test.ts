import { describe, it, expect } from 'vitest';
import { generateBibtex } from './bibtexGenerator';
import type { Publication } from '$lib/types/publication';

// Minimal fixture factory: supplies every required Publication field so tests
// only spell out the fields the branch under test actually reads.
const pub = (over: Partial<Publication>): Publication =>
	({
		id: 'madore2024',
		type: 'book',
		title: 'Sample Title',
		authors: ['Frédérick Madore'],
		date: '2024',
		dateISO: '2024-01-01',
		year: 2024,
		language: 'English',
		...over
	}) as Publication;

describe('generateBibtex', () => {
	it('emits an @book entry keyed by the publication id', () => {
		const bib = generateBibtex(pub({ id: 'madore2024', type: 'book', publisher: 'Brill' }));
		expect(bib).toMatch(/^@book\{madore2024,/);
		expect(bib.trimEnd().endsWith('}')).toBe(true);
	});

	it('maps publication types to BibTeX entry types', () => {
		expect(generateBibtex(pub({ type: 'article', journal: 'JRA' }))).toMatch(/^@article\{/);
		expect(generateBibtex(pub({ type: 'chapter', book: 'A Volume', publisher: 'Brill' }))).toMatch(
			/^@incollection\{/
		);
		expect(generateBibtex(pub({ type: 'phd-dissertation', university: 'Laval' }))).toMatch(
			/^@phdthesis\{/
		);
		expect(generateBibtex(pub({ type: 'report', institution: 'ZMO' }))).toMatch(/^@techreport\{/);
		expect(generateBibtex(pub({ type: 'blogpost' }))).toMatch(/^@misc\{/);
	});

	it('treats an edited volume as a book with an editor field', () => {
		const bib = generateBibtex(
			pub({
				type: 'book',
				publisher: 'Brill',
				isEditedVolume: true,
				authors: ['Jane Doe', 'John Smith']
			})
		);
		expect(bib).toMatch(/^@book\{/);
		expect(bib).toContain('editor = {Jane Doe and John Smith}');
		expect(bib).not.toContain('author =');
	});

	it('joins multiple authors with " and "', () => {
		const bib = generateBibtex(pub({ authors: ['Jane Doe', 'John Smith'] }));
		expect(bib).toContain('author = {Jane Doe and John Smith}');
	});

	it('derives the year from dateISO, preferring it over the year field', () => {
		const bib = generateBibtex(pub({ dateISO: '2019-06-01', year: 2024 }));
		expect(bib).toContain('year = {2019}');
	});

	it('escapes BibTeX special characters in the title', () => {
		const bib = generateBibtex(pub({ title: 'Faith & Power: 50% of #1' }));
		expect(bib).toContain('title = {Faith \\& Power: 50\\% of \\#1}');
	});

	it('normalises page ranges to a double dash for articles', () => {
		const bib = generateBibtex(pub({ type: 'article', journal: 'JRA', pages: '12–34' }));
		expect(bib).toContain('pages = {12--34}');
		expect(bib).toContain('journal = {JRA}');
	});

	it('includes article-specific fields only for articles', () => {
		const article = generateBibtex(
			pub({ type: 'article', journal: 'JRA', volume: '5', issue: '2' })
		);
		expect(article).toContain('volume = {5}');
		expect(article).toContain('number = {2}');

		const book = generateBibtex(pub({ type: 'book', publisher: 'Brill' }));
		expect(book).not.toContain('journal =');
		expect(book).toContain('publisher = {Brill}');
	});

	it('renders tags as a keywords field', () => {
		const bib = generateBibtex(pub({ tags: ['Islam', 'West Africa'] }));
		expect(bib).toContain('keywords = {Islam, West Africa}');
	});

	it('prepends a warning comment when required fields are missing', () => {
		const bib = generateBibtex(pub({ type: 'article', journal: undefined }));
		expect(bib).toMatch(/^% WARNING: Missing required fields/);
	});
});
