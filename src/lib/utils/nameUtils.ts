/**
 * Pure helpers for parsing and formatting person-name strings
 * (authors, editors). Shared by metaTags, citation and BibTeX code.
 */

/**
 * Converts "First Last" to "Last, First" format for citation managers (Zotero).
 * Names already in "Last, First" format are returned as-is.
 */
export function toLastFirstFormat(name: string): string {
	if (name.includes(',')) return name;
	const parts = name.trim().split(/\s+/);
	if (parts.length <= 1) return name;
	const lastName = parts[parts.length - 1];
	const firstName = parts.slice(0, -1).join(' ');
	return `${lastName}, ${firstName}`;
}

/**
 * Splits a comma/and-separated name string into individual trimmed names.
 */
export function splitNames(names: string): string[] {
	return names
		.split(/,\s*|\s+and\s+/)
		.map((name) => name.trim())
		.filter(Boolean);
}

/**
 * Compact author display for list/panel cards: single name as-is,
 * two names joined with "and", three or more collapsed to "First et al.".
 */
export function formatAuthorsCompact(authors: string[]): string {
	if (!authors || authors.length === 0) return '';
	if (authors.length === 1) return authors[0];
	if (authors.length === 2) return `${authors[0]} and ${authors[1]}`;
	return `${authors[0]} et al.`;
}

/**
 * Parses an author name into first/last parts for COinS metadata.
 * Handles both "Last, First" and "First Last" formats.
 */
export function parseAuthorName(author: string): { first?: string; last?: string } {
	if (author.includes(',')) {
		const [last, first] = author.split(',').map((s) => s.trim());
		return { first, last };
	}
	const parts = author.trim().split(/\s+/);
	if (parts.length > 1) {
		return {
			last: parts[parts.length - 1],
			first: parts.slice(0, -1).join(' ')
		};
	}
	return { last: author };
}
