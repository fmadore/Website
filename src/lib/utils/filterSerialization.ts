/**
 * Pure URL <-> filter-state serialization.
 *
 * Extracted from `#lib/actions/urlFilterSync.svelte.ts` so the query-string
 * building/parsing and the change-detection comparisons can be unit-tested in
 * plain Node (the Vitest config has no Svelte compiler, so the `$effect`-based
 * action can't be imported by tests). The action wraps these functions;
 * behaviour is identical.
 */

import type { YearRange } from '#lib/types/index.ts';
import { normalizeSearchText } from '#lib/utils/searchText.ts';

/** The subset of filter state that round-trips through the URL. */
export interface UrlSyncableFilters {
	types?: string[];
	tags?: string[];
	languages?: string[];
	authors?: string[];
	countries?: string[];
	projects?: string[];
	yearRange?: YearRange | null;
}

/** URL query parameter name for each array-valued filter dimension. */
export const ARRAY_FILTER_PARAMS = [
	['type', 'types'],
	['tag', 'tags'],
	['language', 'languages'],
	['author', 'authors'],
	['country', 'countries'],
	['project', 'projects']
] as const satisfies ReadonlyArray<readonly [string, keyof UrlSyncableFilters]>;

/** URL query parameter carrying the page-local free-text search. */
export const SEARCH_PARAM = 'q';

/**
 * URL query parameter carrying a non-default sort. The order is part of the
 * view a reader shares ("most cited first"), so it rides in the link; the
 * default order is written as no parameter, so the plain index keeps one URL.
 */
export const SORT_PARAM = 'sort';

/**
 * Serializes active filters into a URL query string (no leading `?`; empty
 * string when nothing is active). Array filters use one entry per value
 * (`?tag=a&tag=b`) so individual values can safely contain commas; the year
 * range serializes as `year_min`/`year_max`; the free-text search serializes as
 * `q`, and only when it holds something; a sort other than the default as
 * `sort` (pass an empty string for the default).
 *
 * The page number is deliberately absent. It is a position in a list the
 * filters define, not a narrowing of the corpus, and every narrowing resets it
 * to 1 — so a `?page=` in a shared link would be honoured by nothing and would
 * only make two URLs for the same view.
 */
export function serializeFiltersToQuery(
	filters: UrlSyncableFilters,
	searchTerm = '',
	sort = ''
): string {
	const urlParams = new URLSearchParams();

	for (const [param, key] of ARRAY_FILTER_PARAMS) {
		const values = filters[key] as string[] | undefined;
		if (!values?.length) continue;
		for (const v of values) urlParams.append(param, v);
	}

	// An open-ended range (a lone `year_min` or `year_max` deep link) holds an
	// infinite bound; it goes back out as the one bound it came in with.
	if (filters.yearRange) {
		const { min, max } = filters.yearRange;
		if (Number.isFinite(min)) urlParams.set('year_min', min.toString());
		if (Number.isFinite(max)) urlParams.set('year_max', max.toString());
	}

	// An empty search is no search: `?q=` would survive `Clear all` and leave a
	// query string on a page that is not narrowed by anything.
	const trimmed = searchTerm.trim();
	if (trimmed) urlParams.set(SEARCH_PARAM, trimmed);

	if (sort) urlParams.set(SORT_PARAM, sort);

	return urlParams.toString();
}

/**
 * Reads the sort back out of a URL: one of `options`, matched case-
 * insensitively, else `fallback` (the default order). An unknown `?sort=` is
 * ignored rather than honoured as an order the page cannot draw.
 */
export function parseSortParam<T extends string>(
	searchParams: Pick<URLSearchParams, 'get'>,
	options: readonly T[],
	fallback: T
): T {
	const wanted = searchParams.get(SORT_PARAM)?.trim().toLowerCase();
	return options.find((option) => option.toLowerCase() === wanted) ?? fallback;
}

/** Reads the free-text search back out of a URL; absent means empty. */
export function parseSearchParam(searchParams: Pick<URLSearchParams, 'get'>): string {
	return searchParams.get(SEARCH_PARAM)?.trim() ?? '';
}

/**
 * Reads all entries for an array filter parameter, dropping empty and repeated
 * entries (`?tag=Islam&tag=Islam` is one tag, not a filter counted twice).
 * One-entry-per-value (`?p=a&p=b`) is the canonical form; a single entry is
 * taken verbatim, so values containing commas (e.g. long project names)
 * survive the round trip.
 */
export function parseArrayFilterParam(
	searchParams: Pick<URLSearchParams, 'getAll'>,
	paramName: string
): string[] {
	return [...new Set(searchParams.getAll(paramName).filter(Boolean))];
}

/**
 * Maps facet values taken from a URL onto a dimension's vocabulary: each value
 * is matched case-, accent- and apostrophe-insensitively (`normalizeSearchText`,
 * the fold the search box and the WebMCP tools use), replaced by the
 * vocabulary's own spelling, and dropped when the vocabulary does not hold it,
 * so `?tag=islam` filters by `Islam` and `?tag=NONEXISTENT` is ignored rather
 * than printed as a filter that matches nothing. Duplicates after folding
 * collapse to one; order follows the URL.
 */
export function canonicalizeFacetValues(
	values: readonly string[],
	vocabulary: readonly string[],
	/**
	 * Maps a retired spelling onto its current one before matching (`AI` →
	 * `Artificial Intelligence`), so a link shared before a vocabulary rename
	 * still selects the value it meant.
	 */
	alias: (value: string) => string = (value) => value
): string[] {
	const byFold = new Map<string, string>();
	for (const option of vocabulary) {
		const fold = normalizeSearchText(option).trim();
		// Two options that fold alike: the first listed wins the folded spelling;
		// each still matches itself exactly below.
		if (!byFold.has(fold)) byFold.set(fold, option);
	}
	const exact = new Set(vocabulary);
	const result = new Set<string>();
	for (const raw of values) {
		const value = alias(raw);
		const canonical = exact.has(value) ? value : byFold.get(normalizeSearchText(value).trim());
		if (canonical !== undefined) result.add(canonical);
	}
	return [...result];
}

/**
 * An alias function from an alias table (retired spelling → current), matched
 * exactly and then case-, accent- and apostrophe-insensitively, so `?tag=ai`
 * reaches `Artificial Intelligence` as `?tag=AI` does. A value the table does
 * not hold passes through unchanged.
 */
export function foldedAliasLookup(
	aliases: Readonly<Record<string, string>>
): (value: string) => string {
	const byFold = new Map<string, string>();
	for (const [from, to] of Object.entries(aliases)) {
		const fold = normalizeSearchText(from).trim();
		if (!byFold.has(fold)) byFold.set(fold, to);
	}
	return (value) =>
		(Object.hasOwn(aliases, value) ? aliases[value] : undefined) ??
		byFold.get(normalizeSearchText(value).trim()) ??
		value;
}

/**
 * Parses `year_min`/`year_max` strings into a range. A numeric bound on its
 * own is an open-ended range (`year_min=2020` is 2020 onwards, an infinite
 * `max`); with neither bound numeric the range is null (no year filtering).
 */
export function parseYearRangeParams(
	yearMinStr: string | null,
	yearMaxStr: string | null
): YearRange | null {
	const min = yearMinStr ? parseInt(yearMinStr, 10) : NaN;
	const max = yearMaxStr ? parseInt(yearMaxStr, 10) : NaN;
	if (isNaN(min) && isNaN(max)) return null;
	return {
		min: isNaN(min) ? -Infinity : min,
		max: isNaN(max) ? Infinity : max
	};
}

/** Order-insensitive equality of two (possibly undefined) string arrays. */
export function arrayValuesEqual(a: string[] | undefined, b: string[] | undefined): boolean {
	// Compare on sorted copies — sorting in place would mutate live reactive
	// filter arrays when the caller passes them in directly.
	const sortedCopy = (values: string[] | undefined) => [...(values || [])].sort();
	return JSON.stringify(sortedCopy(a)) === JSON.stringify(sortedCopy(b));
}

/** Equality of two year ranges, treating undefined as null (no range). */
export function yearRangesEqual(
	a: YearRange | null | undefined,
	b: YearRange | null | undefined
): boolean {
	// Compared by value, not through JSON: an open-ended bound is infinite, and
	// JSON prints every infinity as `null`.
	if (!a || !b) return !a && !b;
	return a.min === b.min && a.max === b.max;
}
