/**
 * Shared comparison form for the francophone corpus; never changes stored
 * labels. Case, diacritics and typographic apostrophes fold away, and the
 * ligatures NFD leaves whole are spelled out (`œ` → `oe`, `æ` → `ae`, `ß` →
 * `ss`), so "oeuvre" finds "Œuvre". A German umlaut is not respelled: NFD
 * already folds `ö` to `o`, and respelling it `oe` would stop "Schonfeld"
 * finding "Schönfeld".
 */
export function normalizeSearchText(value: string): string {
	return value
		.normalize('NFD')
		.replace(/\p{M}/gu, '')
		.replace(/[‘’ʼ′]/g, "'")
		.toLowerCase()
		.replace(/œ/g, 'oe')
		.replace(/æ/g, 'ae')
		.replace(/ß/g, 'ss');
}

export function searchTerms(query: string): string[] {
	return normalizeSearchText(query).split(/\s+/).filter(Boolean);
}

/**
 * The index search's reading of a query: whitespace-separated terms, except
 * that a run in double quotes (straight or typographic) is one phrase, matched
 * as written with its inner whitespace collapsed. `"religious authority" togo`
 * is two needles. A quote left open runs to the end of the query; a stray
 * quote inside a bare term is dropped rather than searched for, since no field
 * prints one in the place a reader would type it.
 */
export function parseSearchQuery(query: string): string[] {
	const folded = normalizeSearchText(query).replace(/[“”„«»]/g, '"');
	const needles: string[] = [];
	for (const match of folded.matchAll(/"([^"]*)(?:"|$)|([^\s"]+)/g)) {
		const needle = (match[1] ?? match[2] ?? '').trim().replace(/\s+/g, ' ');
		if (needle) needles.push(needle);
	}
	return needles;
}

/**
 * One row's searchable text, folded once. Fields are joined by a newline and
 * each field's own whitespace collapses to single spaces, so a phrase can
 * match across the words of one field but never across the boundary between
 * two (a needle never holds a newline).
 */
export function searchHaystack(fields: readonly string[]): string {
	return fields
		.map((field) => normalizeSearchText(field).replace(/\s+/g, ' ').trim())
		.filter(Boolean)
		.join('\n');
}

/** Every needle of the query occurs in the haystack (AND); a blank query matches all. */
export function haystackMatches(haystack: string, needles: readonly string[]): boolean {
	return needles.every((needle) => haystack.includes(needle));
}

/** Every query term (or quoted phrase) must occur somewhere in the searchable fields. */
export function matchesSearchTerms(fields: readonly string[], query: string): boolean {
	return haystackMatches(searchHaystack(fields), parseSearchQuery(query));
}
