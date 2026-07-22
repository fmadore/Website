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

/** Options for {@link joinNames}. Defaults produce "A, B and C". */
export interface JoinNamesOptions {
	/** Separator between all names except before the last one (default `", "`). */
	separator?: string;
	/** Conjunction placed before the last of two or more names (default `" and "`). */
	conjunction?: string;
	/**
	 * Serial (Oxford) comma: for three or more names, keep the separator in
	 * front of the conjunction (`"A, B, and C"` instead of `"A, B and C"`).
	 */
	serialComma?: boolean;
	/**
	 * Collapse to `"First et al."` when there are more names than this
	 * (e.g. `2` renders one or two names in full, three or more as et al.).
	 */
	maxBeforeEtAl?: number;
}

/**
 * Parameterised name-list joiner shared by the citation, CV and compact
 * display formatters. Each caller supplies its own style config; outputs
 * intentionally differ per citation style.
 */
export function joinNames(names: string[], options: JoinNamesOptions = {}): string {
	const { separator = ', ', conjunction = ' and ', serialComma = false, maxBeforeEtAl } = options;
	if (!names || names.length === 0) return '';
	if (names.length === 1) return names[0];
	if (maxBeforeEtAl !== undefined && names.length > maxBeforeEtAl) {
		return `${names[0]} et al.`;
	}
	const head = names.slice(0, -1).join(separator);
	const connector =
		serialComma && names.length > 2 ? `${separator.trimEnd()}${conjunction}` : conjunction;
	return `${head}${connector}${names[names.length - 1]}`;
}

/**
 * Compact author display for list/panel cards: single name as-is,
 * two names joined with "and", three or more collapsed to "First et al.".
 */
export function formatAuthorsCompact(authors: string[]): string {
	if (!authors) return '';
	return joinNames(authors, { maxBeforeEtAl: 2 });
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
