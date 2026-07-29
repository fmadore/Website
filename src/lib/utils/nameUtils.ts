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

/** Marker standing in for the names an et al. collapse skipped over. */
const ELISION = '…';

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
	 * Collapse to an et al. form when there are more names than this
	 * (e.g. `2` renders one or two names in full, three or more as et al.).
	 */
	maxBeforeEtAl?: number;
	/**
	 * How many names to print ahead of "et al." once the list collapses
	 * (default `1` — `"First et al."`). Clamped so at least one name is
	 * always hidden, since printing every name before an "et al." would lie.
	 * Only read when `maxBeforeEtAl` is set.
	 */
	namesBeforeEtAl?: number;
	/**
	 * A name that must survive the collapse. Used for the site owner, so a
	 * collective paper never appears in his own bibliography under other
	 * people's names alone. If it sits past the printed window, the window is
	 * extended: `"A, B, …, Madore et al."`.
	 * Only read when `maxBeforeEtAl` is set.
	 */
	mustInclude?: string;
}

/**
 * Parameterised name-list joiner shared by the citation, CV and compact
 * display formatters. Each caller supplies its own style config; outputs
 * intentionally differ per citation style.
 */
export function joinNames(names: string[], options: JoinNamesOptions = {}): string {
	const {
		separator = ', ',
		conjunction = ' and ',
		serialComma = false,
		maxBeforeEtAl,
		namesBeforeEtAl = 1,
		mustInclude
	} = options;
	if (!names || names.length === 0) return '';
	if (names.length === 1) return names[0]!;
	if (maxBeforeEtAl !== undefined && names.length > maxBeforeEtAl) {
		const window = Math.min(Math.max(namesBeforeEtAl, 1), names.length - 1);
		const anchor = mustInclude ? names.indexOf(mustInclude) : -1;
		if (anchor >= window) {
			// The anchor sits past the window: keep the opening names, mark the
			// gap, then print the anchor. A trailing anchor hides nothing after
			// itself, so it closes the list rather than taking an "et al.".
			const head = [...names.slice(0, Math.max(window - 1, 1)), ELISION, names[anchor]!];
			const joined = head.join(separator);
			return anchor === names.length - 1 ? joined : `${joined} et al.`;
		}
		return `${names.slice(0, window).join(separator)} et al.`;
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
 * Threshold at which a byline collapses to et al., and how many names it
 * keeps when it does. Set so every ordinary co-authored piece (the corpus
 * tops out at three names) still prints in full, and only genuinely
 * collective work — a two-dozen-signatory position paper — collapses.
 */
export const ET_AL_MAX_AUTHORS = 4;
const ET_AL_NAMES_SHOWN = 3;

/**
 * Byline formatter for long author lists. Up to {@link ET_AL_MAX_AUTHORS}
 * names print in full ("A, B and C"); beyond that the list collapses to the
 * leading names plus "et al." — with `mustInclude` (normally the site owner)
 * held in view wherever it falls in the running order.
 */
export function formatAuthorsWithEtAl(
	authors: string[] | undefined,
	options: { max?: number; shown?: number; mustInclude?: string } = {}
): string {
	if (!authors) return '';
	const { max = ET_AL_MAX_AUTHORS, shown = ET_AL_NAMES_SHOWN, mustInclude } = options;
	return joinNames(authors, {
		maxBeforeEtAl: max,
		namesBeforeEtAl: shown,
		mustInclude
	});
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
