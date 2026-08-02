import type { Publication } from '$lib/types/publication';
import { generateBibtex } from '$lib/utils/bibtexGenerator';
import { formatCitation, formatAuthorList } from '$lib/utils/citationFormatter';
import type { Item } from './datasets.js';

/**
 * Citation output, borrowed wholesale from the site.
 *
 * `bibtexGenerator` and `citationFormatter` are pure modules whose only imports
 * are types and two other pure helpers, so the build aliases `$lib` and bundles
 * them straight in. Reimplementing them here would guarantee the server and the
 * site's own download button eventually disagree.
 *
 * Only BibTeX and the site's display reference exist today — the site has no
 * APA/MLA/Chicago generator to share. Adding one is a change to `src/lib/utils`,
 * after which it lands here for free.
 */

export type CitationStyle = 'bibtex' | 'reference';

/**
 * Rebuild a `Publication` from an API item.
 *
 * The API moves external addresses into `links` and reuses `url` for the
 * canonical page, so `url` is mapped back to the source address to keep BibTeX
 * output byte-identical to the site's download.
 */
function toPublication(item: Item): Publication {
	const links = Array.isArray(item.links)
		? (item.links as Array<{ label: string; url: string }>)
		: [];
	const source =
		links.find((link) => link.label === 'Source') ?? links.find((link) => link.label === 'PDF');

	return {
		...item,
		url: source?.url
	} as unknown as Publication;
}

/** Strip the display formatter's markup down to plain text. */
function stripHtml(html: string): string {
	return html
		.replace(/<[^>]+>/g, '')
		.replace(/&amp;/g, '&')
		.replace(/&lt;/g, '<')
		.replace(/&gt;/g, '>')
		.replace(/&quot;/g, '"')
		.replace(/&#39;/g, "'")
		.replace(/&nbsp;/g, ' ')
		.replace(/\s+/g, ' ')
		.trim();
}

export function citationFor(item: Item, style: CitationStyle): string {
	const publication = toPublication(item);

	if (style === 'bibtex') return generateBibtex(publication);

	const { typeLabel, detailsHtml, year } = formatCitation(publication);
	const authors = formatAuthorList(publication.authors);
	const details = stripHtml(detailsHtml);

	return [
		authors && `${authors}.`,
		year && `(${year}).`,
		`${publication.title}.`,
		details,
		`[${typeLabel}]`
	]
		.filter(Boolean)
		.join(' ')
		.replace(/\s+/g, ' ')
		.trim();
}
