/**
 * The citation dateline printed under a publication record's title: the
 * citable facts — container, volume(issue), date, pages, DOI — as one mono
 * line, so they sit above the fold even when the rail's Cite block does not.
 *
 * Built from the same fields the rail's Record ledger prints
 * (`PublicationRecordRail`), cut to what a citation needs. It is not a second
 * reference formatter: there is no punctuation grammar here, only the parts in
 * citation order, each a plain string the caller joins with `·`. The DOI comes
 * back on its own so the caller can link it.
 */
import type { Publication } from '#lib/types/index.ts';
import { typesetQuotes } from '#lib/utils/typesetQuotes.ts';

export interface CitationDateline {
	/** Printed parts in citation order, each already typeset. */
	parts: string[];
	/** The bare DOI (no resolver), printed last as a link when present. */
	doi?: string;
}

type DatelineFields = Pick<
	Publication,
	| 'type'
	| 'date'
	| 'journal'
	| 'series'
	| 'book'
	| 'encyclopediaTitle'
	| 'proceedingsTitle'
	| 'publisher'
	| 'placeOfPublication'
	| 'university'
	| 'volume'
	| 'issue'
	| 'pages'
	| 'pageCount'
	| 'doi'
>;

const clean = (value: unknown): string => (value == null ? '' : String(value).trim());

/** The work the record sits in, or for a standalone work, who issued it. */
function container(p: DatelineFields): string {
	switch (p.type) {
		case 'article':
		case 'bulletin-article':
		case 'special-issue':
			return clean(p.journal);
		case 'working-paper':
			return clean(p.series) || clean(p.journal);
		case 'chapter':
			return clean(p.book) && `In ${clean(p.book)}`;
		case 'encyclopedia':
			return clean(p.encyclopediaTitle) && `In ${clean(p.encyclopediaTitle)}`;
		case 'conference-proceedings':
			return clean(p.proceedingsTitle) && `In ${clean(p.proceedingsTitle)}`;
		case 'phd-dissertation':
		case 'masters-thesis':
			return clean(p.university);
		case 'book': {
			const place = clean(p.placeOfPublication);
			const publisher = clean(p.publisher);
			return place && publisher ? `${place}: ${publisher}` : publisher || place;
		}
		default:
			return clean(p.publisher);
	}
}

/** `90(3)`, `12`, or `no. 44` when only the number in a series is known. */
function volumeIssue(p: DatelineFields): string {
	const volume = clean(p.volume);
	const issue = clean(p.issue);
	if (volume && issue) return `${volume}(${issue.replace(/-/g, '–')})`;
	if (volume) return volume;
	if (issue) return `no. ${issue.replace(/-/g, '–')}`;
	return '';
}

/** `pp. 625–646` (closed-up en dash), `p. 9`, or a book's `280 pp.` */
function pageSpan(p: DatelineFields): string {
	const pages = clean(p.pages).replace(/\s*[-–]\s*/g, '–');
	if (pages) return /–/.test(pages) ? `pp. ${pages}` : `p. ${pages}`;
	const count = clean(p.pageCount);
	return count ? `${count} pp.` : '';
}

export function citationDateline(publication: DatelineFields): CitationDateline {
	const parts = [container(publication), volumeIssue(publication), clean(publication.date)]
		.concat(pageSpan(publication))
		.filter((part) => part !== '')
		.map((part) => typesetQuotes(part));
	const doi = clean(publication.doi);
	return doi ? { parts, doi } : { parts };
}
