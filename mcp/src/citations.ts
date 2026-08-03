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

const ENTITIES: Record<string, string> = {
	'&lt;': '<',
	'&gt;': '>',
	'&quot;': '"',
	'&#39;': "'",
	'&nbsp;': ' ',
	'&amp;': '&'
};

/**
 * Strip the display formatter's markup down to plain text.
 *
 * Two things here are deliberate rather than merely tidy:
 *
 *  - Tag removal repeats until the string stops changing. A single pass over
 *    `<[^>]+>` turns `<<b>script>` into `<script>` — it removes the inner tag
 *    and leaves a new one behind. Looping to a fixed point cannot.
 *  - Entities are decoded in one pass through a lookup, not by chained
 *    `replace` calls. Decoding `&amp;` first would turn `&amp;lt;` into `&lt;`
 *    and then into `<`, reviving markup the caller had escaped.
 */
function stripHtml(html: string): string {
	let text = html;
	let previous: string;
	do {
		previous = text;
		text = text.replace(/<[^>]*>/g, '');
	} while (text !== previous);

	return text
		.replace(/&(?:amp|lt|gt|quot|nbsp|#39);/g, (entity) => ENTITIES[entity] ?? entity)
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
