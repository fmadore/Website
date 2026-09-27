/** Shared comparison form for the francophone corpus; never changes stored labels. */
export function normalizeSearchText(value: string): string {
	return value
		.normalize('NFD')
		.replace(/\p{M}/gu, '')
		.replace(/[‘’ʼ′]/g, "'")
		.toLowerCase();
}

export function searchTerms(query: string): string[] {
	return normalizeSearchText(query).split(/\s+/).filter(Boolean);
}

/** Every query term must occur somewhere in the searchable fields. */
export function matchesSearchTerms(fields: readonly string[], query: string): boolean {
	const haystack = normalizeSearchText(fields.join(' '));
	return searchTerms(query).every((term) => haystack.includes(term));
}
