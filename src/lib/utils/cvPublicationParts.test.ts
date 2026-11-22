import { describe, expect, it } from 'vitest';
import type { CvPublication } from '#lib/types/publication.ts';
import { cvPublicationsByDate } from '#lib/data/publications/cv.ts';
import { cvPublicationParts, type CvSegment } from './cvPublicationParts';

const NBSP = ' ';

const pub = (over: Partial<CvPublication>): CvPublication =>
	({
		id: 'x',
		title: 'A Title',
		authors: [],
		year: 2020,
		dateISO: '2020',
		...over
	}) as CvPublication;

/** The segments as one readable string: italics in *…*, the record title in [ ]. */
function read(parts: CvSegment[]): string {
	return parts
		.map((part) =>
			part.kind === 'text'
				? part.text
				: part.kind === 'italic'
					? `*${part.text}*`
					: part.italic
						? `[*${part.text}*]`
						: `[${part.text}]`
		)
		.join('');
}

describe('cvPublicationParts', () => {
	it('sets an article: quoted title, italic journal, volume, issue and pages', () => {
		expect(
			read(
				cvPublicationParts(
					pub({ type: 'article', journal: 'Africa', volume: 12, issue: 3, pages: '45–67' })
				)
			)
		).toBe('[“A Title”]. *Africa* 12 (3): 45–67.');
	});

	it('sets a bulletin article like an article', () => {
		expect(read(cvPublicationParts(pub({ type: 'bulletin-article', journal: 'Bulletin' })))).toBe(
			'[“A Title”]. *Bulletin*.'
		);
	});

	it('sets a chapter: editors, italic book, imprint and pages, held by no-break spaces', () => {
		expect(
			read(
				cvPublicationParts(
					pub({
						type: 'chapter',
						book: 'The Book',
						editors: 'Ann Smith and Bo Lee',
						placeOfPublication: 'Leiden',
						publisher: 'Brill',
						pages: '1–20'
					})
				)
			)
		).toBe(
			`[“A Title”]. In Ann Smith and Bo Lee (eds.),${NBSP}*The Book*.${NBSP}Leiden: Brill, 1–20.`
		);
	});

	it('sets a book as its italic, linked title and imprint', () => {
		expect(
			read(
				cvPublicationParts(pub({ type: 'book', publisher: 'Brill', placeOfPublication: 'Leiden' }))
			)
		).toBe(`[*A Title*].${NBSP}Leiden: Brill.`);
		expect(read(cvPublicationParts(pub({ type: 'book' })))).toBe('[*A Title*].');
	});

	it('sets a special issue as its journal and number', () => {
		expect(
			read(cvPublicationParts(pub({ type: 'special-issue', journal: 'Islam', issue: 2 })))
		).toBe('[“A Title”]. *Islam* (2).');
	});

	it('sets a working paper: series and number, pages, and a distinct publisher', () => {
		expect(
			read(
				cvPublicationParts(
					pub({
						type: 'working-paper',
						series: 'Working Papers',
						issue: '7',
						pages: '30',
						publisher: 'ZMO'
					})
				)
			)
		).toBe(`[“A Title”]. *Working Papers*${NBSP}7: 30. ZMO.`);
		expect(
			read(cvPublicationParts(pub({ type: 'working-paper', series: 'ZMO', publisher: 'ZMO' })))
		).toBe('[“A Title”]. *ZMO*.');
	});

	it('sets a report under its journal, or else its publisher', () => {
		expect(read(cvPublicationParts(pub({ type: 'report', publisher: 'Gerda', pages: '9' })))).toBe(
			'[“A Title”]. *Gerda*, 9.'
		);
	});

	it('sets an encyclopedia entry in its encyclopedia', () => {
		expect(
			read(
				cvPublicationParts(
					pub({ type: 'encyclopedia', encyclopediaTitle: 'EI3', publisher: 'Brill' })
				)
			)
		).toBe('[“A Title”]. In *EI3*, Brill.');
	});

	it('sets a blog post with its outlet and date, and no empty date', () => {
		expect(
			read(
				cvPublicationParts(pub({ type: 'blogpost', publisher: 'The Blog', dateISO: '2024-03-05' }))
			)
		).toBe('[“A Title”]. *The Blog*, 5 March.');
		expect(
			read(cvPublicationParts(pub({ type: 'blogpost', publisher: 'The Blog', dateISO: '' })))
		).toBe('[“A Title”]. *The Blog*.');
	});

	it('sets a proceedings paper in its proceedings', () => {
		expect(
			read(cvPublicationParts(pub({ type: 'conference-proceedings', proceedingsTitle: 'Acts' })))
		).toBe('[“A Title”]. In *Acts*.');
	});

	it('falls back to whatever host a record has', () => {
		expect(read(cvPublicationParts(pub({ type: 'article', book: 'A Book', publisher: 'P' })))).toBe(
			'[“A Title”]. In *A Book*. P.'
		);
	});

	it('typesets quotation marks in the host titles', () => {
		expect(read(cvPublicationParts(pub({ type: 'article', journal: 'The "Review"' })))).toBe(
			'[“A Title”]. *The “Review”*.'
		);
	});

	it('gives every record on the CV a linked title and no empty segment', () => {
		for (const record of cvPublicationsByDate) {
			const parts = cvPublicationParts(record);
			expect(
				parts.filter((part) => part.kind === 'record'),
				record.id
			).toHaveLength(1);
			expect(
				parts.every((part) => part.text !== ''),
				record.id
			).toBe(true);
		}
	});
});
