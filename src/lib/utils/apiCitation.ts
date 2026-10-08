import type { Publication } from '$lib/types/publication';
import type { ApiItem as Item } from '$lib/apiContract';
import { generateBibtex } from '$lib/utils/bibtexGenerator';
import { formatReferenceText } from '$lib/utils/citationFormatter';

/**
 * Citation output for a publication read from the static JSON API, for the two
 * agent surfaces that read it: the MCP server in `mcp/` and the WebMCP tools.
 *
 * Borrowed wholesale from the site: `bibtexGenerator` and `citationFormatter`
 * are pure modules whose only imports are types and other pure helpers, so the
 * MCP build aliases `$lib` and bundles them straight in. Reimplementing them
 * would guarantee an agent and the site's own download button eventually
 * disagree.
 *
 * The plain-text assembly this file used to own moved into `citationFormatter`
 * as `formatReferenceText` when the site grew a "Copy reference" control of its
 * own: two implementations of one reference is exactly the drift the note above
 * warns about. Only BibTeX and that display reference exist — there is still no
 * APA/MLA/Chicago generator, and adding one remains a change to `src/lib/utils`.
 */

export const CITATION_STYLES = ['bibtex', 'reference'] as const;
export type CitationStyle = (typeof CITATION_STYLES)[number];

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

export function citationFor(item: Item, style: CitationStyle): string {
	const publication = toPublication(item);

	if (style === 'bibtex') return generateBibtex(publication);

	return formatReferenceText(publication, { typeLabel: true });
}
