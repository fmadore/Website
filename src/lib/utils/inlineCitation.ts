import type { ReferenceIndexEntry } from '$lib/types/referenceIndex';

/**
 * The author–date citation an `<ItemReference>` prints in running prose —
 * "(Madore, 2025)". Shared by `ReferenceLink.svelte`, which sets it on the
 * page, and the Markdown twins (`$lib/server/markdown/svelteProse`), which set
 * the same prose as text, so a page and its `.md` cite a work identically.
 */

/**
 * The year a citation prints. An undated record prints the scholarly
 * abbreviation a reader already knows from any bibliography, not a form-field
 * placeholder: "(Madore, n.d.)", never "(Madore, N/D)".
 */
export function citationYear(item: ReferenceIndexEntry): string {
	if (item.dateISO) return item.dateISO.substring(0, 4);
	if (item.date) return item.date.substring(0, 4);
	if (item.year) return item.year.toString();
	return 'n.d.';
}

/**
 * The author clause. A record with no attributable author yields an empty
 * string and the citation drops the clause entirely — "N/A" announced a
 * database gap in the middle of a typeset sentence.
 */
export function citationAuthors(item: ReferenceIndexEntry): string {
	const lastNames = (item.authors ?? [])
		.map((author) => (typeof author === 'string' ? (author.split(' ').pop() ?? '') : ''))
		.filter(Boolean);

	if (lastNames.length === 0) return '';
	if (lastNames.length === 1) return lastNames[0] ?? '';
	if (lastNames.length === 2) return `${lastNames[0]} and ${lastNames[1]}`;
	return `${lastNames[0]} et al.`;
}

/** "(Author, 2024)", "(2024)" with no author, "(n.d.)" with neither. */
export function inlineCitation(item: ReferenceIndexEntry): string {
	const authorClause = citationAuthors(item);
	const year = citationYear(item);
	return authorClause ? `(${authorClause}, ${year})` : `(${year})`;
}
