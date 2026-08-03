import type { Item } from './datasets.js';

/**
 * In-memory matching over a few hundred records.
 *
 * No index, no fuzzy library: the whole corpus is ~300 items, so a linear scan
 * costs less than the machinery to avoid it would. Matching is
 * accent-insensitive because the corpus is largely francophone — a query for
 * "cote d'ivoire" has to reach "Côte d'Ivoire".
 */

/** Lowercase and strip diacritics, so "Côte" and "cote" compare equal. */
export function normalise(value: string): string {
	return value
		.normalize('NFD')
		.replace(/\p{Diacritic}/gu, '')
		.toLowerCase();
}

/** Flatten any nested value into searchable text. */
function textOf(value: unknown): string {
	if (typeof value === 'string') return value;
	if (typeof value === 'number' || typeof value === 'boolean') return String(value);
	if (Array.isArray(value)) return value.map(textOf).join(' ');
	if (value && typeof value === 'object') return Object.values(value).map(textOf).join(' ');
	return '';
}

/** Concatenate the given fields of an item into one normalised haystack. */
function haystack(item: Item, fields: readonly string[]): string {
	return normalise(fields.map((field) => textOf(item[field])).join(' '));
}

export interface SearchOptions {
	/** Free-text query. Every whitespace-separated term must appear somewhere. */
	query?: string;
	/** Fields scanned for the query. */
	fields: readonly string[];
	/** Fields whose match counts double — normally the title. */
	weighted?: readonly string[];
	/** Exact-ish filters: the item's field must contain the value. */
	filters?: Record<string, string | undefined>;
	yearFrom?: number;
	yearTo?: number;
	limit?: number;
}

export interface SearchResult {
	/** The page of results, capped by `limit`. */
	hits: Item[];
	/** How many items matched in total, so the caller can say "25 of 60". */
	total: number;
}

/**
 * Filter and rank. Items are scored by how often the query terms occur, with
 * hits in the weighted fields counted twice; ties keep the dataset's own order,
 * which is already newest-first.
 */
export function search(items: Item[], options: SearchOptions): SearchResult {
	const { query, fields, weighted = [], filters = {}, yearFrom, yearTo, limit = 25 } = options;
	const terms = query ? normalise(query).split(/\s+/).filter(Boolean) : [];

	const scored: Array<{ item: Item; score: number; index: number }> = [];

	items.forEach((item, index) => {
		if (typeof item.year === 'number') {
			if (yearFrom !== undefined && item.year < yearFrom) return;
			if (yearTo !== undefined && item.year > yearTo) return;
		}

		for (const [field, wanted] of Object.entries(filters)) {
			if (wanted === undefined || wanted === '') continue;
			if (!haystack(item, [field]).includes(normalise(wanted))) return;
		}

		if (terms.length === 0) {
			scored.push({ item, score: 0, index });
			return;
		}

		const body = haystack(item, fields);
		const title = haystack(item, weighted);

		let score = 0;
		for (const term of terms) {
			const inBody = countOccurrences(body, term);
			if (inBody === 0) return; // every term must appear
			score += inBody + countOccurrences(title, term);
		}
		scored.push({ item, score, index });
	});

	scored.sort((a, b) => b.score - a.score || a.index - b.index);
	return { hits: scored.slice(0, limit).map((entry) => entry.item), total: scored.length };
}

function countOccurrences(text: string, term: string): number {
	if (term.length === 0) return 0;
	let count = 0;
	let from = 0;
	for (;;) {
		const at = text.indexOf(term, from);
		if (at === -1) return count;
		count += 1;
		from = at + term.length;
	}
}
