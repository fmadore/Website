/**
 * How one publication is set on the CV, after its byline: the title and the
 * venue apparatus, as typed segments (#221).
 *
 * The CV is printed twice, by `CVPublications.svelte` (the page, and the PDF
 * that reads its DOM) and by the Markdown twin (`server/markdown/cv.ts`). Each
 * used to write the ten publication types' apparatus out on its own, kept
 * "branch for branch" in step by hand, so a change of punctuation or a new type
 * could drift between them silently. `cvSections.ts` settles which records each
 * section holds; this settles how one record reads. Both renderers map the
 * segments to their own markup and add nothing between them.
 *
 * Text is final: quotation marks are typeset here (`typesetQuotes`, and
 * `quoteTitle` for a title set in roman), and a no-break space (U+00A0) stands
 * where the page keeps two words together. The Markdown renderer folds it into
 * an ordinary space, as it does every run of whitespace.
 */
import type { CvPublication } from '#lib/types/publication.ts';
import { formatBlogDate, formatEditorList, formatVolumeIssueDisplay } from './cvFormatters.ts';
import { quoteTitle, typesetQuotes } from './typesetQuotes.ts';

export type CvSegment =
	/** Roman text, punctuation included. */
	| { kind: 'text'; text: string }
	/** A host title set in italic: a journal, a book, a series. */
	| { kind: 'italic'; text: string }
	/** The work's own title, linked to its record; italic for a book. */
	| { kind: 'record'; text: string; italic: boolean };

const NBSP = ' ';

/** "Berlin: De Gruyter", or whichever of the two the record has. */
function imprint(pub: CvPublication): string {
	const city = typesetQuotes(pub.placeOfPublication);
	const publisher = typesetQuotes(pub.publisher);
	return city && publisher ? `${city}: ${publisher}` : city || publisher;
}

/** The title and venue of a publication on the CV, in reading order. */
export function cvPublicationParts(pub: CvPublication): CvSegment[] {
	const parts: CvSegment[] = [];
	const text = (value: string | number | undefined | null) => {
		if (value !== undefined && value !== null && value !== '')
			parts.push({ kind: 'text', text: String(value) });
	};
	const italic = (value: string | undefined | null) =>
		parts.push({ kind: 'italic', text: typesetQuotes(value) });
	const record = (value: string, isItalic: boolean) =>
		parts.push({ kind: 'record', text: value, italic: isItalic });

	const volumeIssue = formatVolumeIssueDisplay(pub.volume, pub.issue);
	const pages = (separator: string) => (pub.pages ? `${separator}${pub.pages}` : '');

	// Every type but a book and a blog post opens on its title in roman.
	if (pub.type !== 'book' && pub.type !== 'blogpost') {
		record(quoteTitle(pub.title), false);
		text('. ');
	}

	if ((pub.type === 'article' || pub.type === 'bulletin-article') && pub.journal) {
		italic(pub.journal);
		text(`${volumeIssue}${pages(': ')}.`);
	} else if (pub.type === 'chapter' && pub.book) {
		text(`In ${pub.editors ? `${formatEditorList(pub.editors)} (eds.),${NBSP}` : ''}`);
		italic(pub.book);
		const place = imprint(pub);
		text(`${place ? `.${NBSP}${place}` : ''}${pages(', ')}.`);
	} else if (pub.type === 'book') {
		record(typesetQuotes(pub.title), true);
		const place = imprint(pub);
		text(place ? `.${NBSP}${place}.` : '.');
	} else if (pub.type === 'special-issue' && pub.journal) {
		italic(pub.journal);
		text(`${volumeIssue}.`);
	} else if (pub.type === 'working-paper') {
		const series = pub.series || pub.journal;
		if (series) {
			italic(series);
			if (pub.issue) text(`${NBSP}${pub.issue}`);
		}
		const publisher =
			pub.publisher && pub.publisher !== series ? `. ${typesetQuotes(pub.publisher)}` : '';
		text(`${pages(': ')}${publisher}.`);
	} else if (pub.type === 'report') {
		const host = pub.journal || pub.publisher;
		if (host) {
			italic(host);
			text(volumeIssue);
		}
		text(`${pages(', ')}.`);
	} else if (pub.type === 'encyclopedia' && pub.encyclopediaTitle) {
		text('In ');
		italic(pub.encyclopediaTitle);
		text(`${pub.publisher ? `, ${typesetQuotes(pub.publisher)}` : ''}.`);
	} else if (pub.type === 'blogpost') {
		// Guard on the formatted date, not on `dateISO`: a forthcoming post
		// carries a date that formats to nothing, which printed "…, ."
		const date = formatBlogDate(pub.dateISO);
		record(quoteTitle(pub.title), false);
		if (pub.publisher) {
			text('. ');
			italic(pub.publisher);
		}
		text(`${date ? `, ${date}` : ''}.`);
	} else if (pub.type === 'conference-proceedings') {
		text('In ');
		italic(pub.proceedingsTitle);
		text('.');
	} else {
		// A record missing the field its type is set from: whatever host it has.
		const hosts: (() => void)[] = [];
		if (pub.journal) hosts.push(() => (text('In '), italic(pub.journal), text('.')));
		if (pub.book) hosts.push(() => (text('In '), italic(pub.book), text('.')));
		if (pub.publisher) hosts.push(() => text(`${typesetQuotes(pub.publisher)}.`));
		hosts.forEach((host, index) => {
			if (index > 0) text(' ');
			host();
		});
	}

	// Drop empty italics (a proceedings record with no title prints "In .",
	// as it always has, but no empty <em>).
	return parts.filter((part) => part.text !== '');
}
