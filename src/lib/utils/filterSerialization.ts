/**
 * Pure URL <-> filter-state serialization.
 *
 * Extracted from `$lib/actions/urlFilterSync.svelte.ts` so the query-string
 * building/parsing and the change-detection comparisons can be unit-tested in
 * plain Node (the Vitest config has no Svelte compiler, so the `$effect`-based
 * action can't be imported by tests). The action wraps these functions;
 * behaviour is identical.
 */

import type { YearRange } from '$lib/types';

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

/**
 * Serializes active filters into a URL query string (no leading `?`; empty
 * string when nothing is active). Array filters use one entry per value
 * (`?tag=a&tag=b`) so individual values can safely contain commas; the year
 * range serializes as `year_min`/`year_max`.
 */
export function serializeFiltersToQuery(filters: UrlSyncableFilters): string {
	const urlParams = new URLSearchParams();

	for (const [param, key] of ARRAY_FILTER_PARAMS) {
		const values = filters[key] as string[] | undefined;
		if (!values?.length) continue;
		for (const v of values) urlParams.append(param, v);
	}

	if (filters.yearRange) {
		urlParams.set('year_min', filters.yearRange.min.toString());
		urlParams.set('year_max', filters.yearRange.max.toString());
	}

	return urlParams.toString();
}

/**
 * Reads all entries for an array filter parameter, dropping empty entries.
 * One-entry-per-value (`?p=a&p=b`) is the canonical form; a single entry is
 * taken verbatim, so values containing commas (e.g. long project names)
 * survive the round trip.
 */
export function parseArrayFilterParam(searchParams: URLSearchParams, paramName: string): string[] {
	return searchParams.getAll(paramName).filter(Boolean);
}

/**
 * Parses `year_min`/`year_max` strings into a range. Both bounds must be
 * present and numeric; otherwise the range is null (no year filtering).
 */
export function parseYearRangeParams(
	yearMinStr: string | null,
	yearMaxStr: string | null
): YearRange | null {
	if (yearMinStr && yearMaxStr) {
		const min = parseInt(yearMinStr, 10);
		const max = parseInt(yearMaxStr, 10);
		if (!isNaN(min) && !isNaN(max)) {
			return { min, max };
		}
	}
	return null;
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
	return JSON.stringify(a || null) === JSON.stringify(b || null);
}
