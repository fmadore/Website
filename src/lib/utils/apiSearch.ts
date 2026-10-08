import type { ApiItem as Item, DatasetName } from '$lib/apiContract';

/**
 * Search over the static JSON API (`/api/*.json`).
 *
 * Shared by the two agent surfaces that read those documents: the MCP server in
 * `mcp/` (over HTTP, from Node) and the WebMCP tools in `webmcp.ts` (same-origin,
 * from the page). One matcher, one set of searched fields and one result shape,
 * so the same question asked through either gets the same answer.
 *
 * In-memory matching over a few hundred records. No index, no fuzzy library:
 * the whole corpus is ~300 items, so a linear scan costs less than the
 * machinery to avoid it would. Matching is accent-insensitive because the
 * corpus is largely francophone — a query for "cote d'ivoire" has to reach
 * "Côte d'Ivoire".
 */

import { normalizeSearchText as normalise, searchTerms } from '$lib/utils/searchText';
export { normalise };

/** The datasets a search tool scans, and the fields its free text reaches. */
export const SEARCH_FIELDS = {
	publications: ['title', 'abstract', 'authors', 'tags', 'journal', 'book', 'publisher', 'editors'],
	communications: ['title', 'abstract', 'authors', 'conference', 'panelTitle', 'location', 'tags'],
	activities: ['title', 'description', 'content', 'tags']
} as const satisfies Partial<Record<DatasetName, readonly string[]>>;

/** Fields whose match counts double in every dataset. */
export const WEIGHTED_FIELDS = ['title'] as const;

/** Flatten any nested value into searchable text. */
function textOf(value: unknown): string {
	if (typeof value === 'string') return value;
	if (typeof value === 'number' || typeof value === 'boolean') return String(value);
	if (Array.isArray(value)) return value.map(textOf).join(' ');
	if (value && typeof value === 'object') return Object.values(value).map(textOf).join(' ');
	return '';
}

/** A field's values: each element of a list, or the one value. */
function valuesOf(value: unknown): string[] {
	return Array.isArray(value) ? value.map(textOf) : [textOf(value)];
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
	/** Loose filters: the item's field must contain the value ("activism" finds "Student Activism"). */
	filters?: Record<string, string | undefined>;
	/**
	 * Exact filters: the item's field, or one element of it, must equal the
	 * value. For closed vocabularies, where containment misleads: "article" is
	 * inside "bulletin-article", and "Niger" inside "Nigeria".
	 */
	exact?: Record<string, string | undefined>;
	yearFrom?: number;
	yearTo?: number;
	limit?: number;
	offset?: number;
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
	const {
		query,
		fields,
		weighted = [],
		filters = {},
		exact = {},
		yearFrom,
		yearTo,
		limit = 25,
		offset = 0
	} = options;
	const terms = searchTerms(query ?? '');

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

		for (const [field, wanted] of Object.entries(exact)) {
			if (wanted === undefined || wanted === '') continue;
			const target = normalise(wanted);
			if (!valuesOf(item[field]).some((value) => normalise(value) === target)) return;
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
	return {
		hits: scored.slice(offset, offset + limit).map((entry) => entry.item),
		total: scored.length
	};
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

// ---------------------------------------------------------------------------
// Result shaping.
//
// Search returns one compact row per hit rather than whole records: a caller
// that wants everything follows up with the matching `get_*` tool, and
// returning 25 full publication records instead would spend a large part of
// the context window on fields nobody asked for.
// ---------------------------------------------------------------------------

export interface StructuredSummary {
	id: string;
	title: string;
	type?: string;
	year?: number;
	venue?: string;
	url?: string;
}

export interface StructuredSearchResult {
	total: number;
	count: number;
	offset: number;
	items: StructuredSummary[];
	has_more: boolean;
	next_offset?: number;
}

export function summariseStructured(
	items: Item[],
	total: number,
	offset = 0
): StructuredSearchResult {
	const summaries = items.map((item) => {
		const venue = item.journal ?? item.book ?? item.conference ?? item.publisher ?? item.years;
		return {
			id: item.id,
			title: item.title ?? item.id,
			...(typeof item.type === 'string' ? { type: item.type } : {}),
			...(typeof item.year === 'number' ? { year: item.year } : {}),
			...(typeof venue === 'string' ? { venue } : {}),
			...(typeof item.url === 'string' ? { url: item.url } : {})
		};
	});
	const nextOffset = offset + items.length;

	return {
		total,
		count: items.length,
		offset,
		items: summaries,
		has_more: nextOffset < total,
		...(nextOffset < total ? { next_offset: nextOffset } : {})
	};
}

/**
 * Look up one record by id, with a message that helps the caller recover: the
 * ids that contain (or are contained in) the one asked for, or else the search
 * tool that lists valid ones.
 */
export function findRecord(items: Item[], dataset: DatasetName, id: string): Item {
	const item = items.find((candidate) => candidate.id === id);
	if (item) return item;

	const suggestions = items
		.filter((candidate) => candidate.id.includes(id) || id.includes(candidate.id))
		.slice(0, 5)
		.map((candidate) => candidate.id);

	throw new Error(
		`No ${dataset} record with id "${id}".` +
			(suggestions.length > 0
				? ` Did you mean: ${suggestions.join(', ')}?`
				: ` Use the matching search or list tool to find valid ids.`)
	);
}
