/**
 * Pure core of the entity filter system.
 *
 * Extracted from `entityFilterSystem.svelte.ts` so the predicate composition,
 * facet counting, and small state helpers can be unit-tested in plain Node
 * (the Vitest config deliberately has no Svelte compiler, so runes modules
 * can't be imported by tests). The runed `EntityFilterSystem` class wraps
 * these functions with `$state`/`$derived`; behaviour is identical.
 */

import type { YearRange } from '$lib/types';

export interface EntityIndexFilters {
	types: string[];
	yearRange: YearRange | null;
	tags: string[];
	languages: string[];
	authors: string[];
	countries: string[];
	projects: string[];
}

/** The array-valued filter dimensions (everything except `yearRange`). */
export type EntityArrayFilterKey = Exclude<keyof EntityIndexFilters, 'yearRange'>;

export const ENTITY_ARRAY_FILTER_KEYS: EntityArrayFilterKey[] = [
	'types',
	'tags',
	'languages',
	'authors',
	'countries',
	'projects'
];

export interface EntityIndexFilterOptions {
	types: string[];
	years: number[];
	tags: string[];
	languages: string[];
	authors: string[];
	countries: string[];
	projects: string[];
}

/** One array-valued filter dimension: how to match and how to count. */
export interface EntityArrayDimension<TItem> {
	/** Returns true if the item matches any of the active filter values. */
	match: (item: TItem, activeValues: string[]) => boolean;
	/** Extracts countable value(s) from an item for the facet counts. */
	countExtractor: (item: TItem) => string | string[] | undefined | null;
}

/**
 * Items matching every active dimension (AND across dimensions; each
 * dimension's `match` decides its own within-dimension semantics).
 * A dimension with no active values does not narrow.
 */
export function filterEntityItems<TItem>(
	items: TItem[],
	filters: EntityIndexFilters,
	dimensions: Record<EntityArrayFilterKey, EntityArrayDimension<TItem>>,
	matchesYearRange: (item: TItem, range: YearRange) => boolean
): TItem[] {
	return items.filter((item) => {
		if (filters.yearRange && !matchesYearRange(item, filters.yearRange)) return false;
		for (const key of ENTITY_ARRAY_FILTER_KEYS) {
			const active = filters[key];
			if (active.length > 0 && !dimensions[key].match(item, active)) return false;
		}
		return true;
	});
}

/** Per-dimension value counts over the given (already filtered) items. */
export function computeFacetCounts<TItem>(
	items: TItem[],
	dimensions: Record<EntityArrayFilterKey, EntityArrayDimension<TItem>>
): Record<EntityArrayFilterKey, Record<string, number>> {
	const result = {} as Record<EntityArrayFilterKey, Record<string, number>>;
	for (const key of ENTITY_ARRAY_FILTER_KEYS) {
		const extractor = dimensions[key].countExtractor;
		const counts: Record<string, number> = {};
		for (const item of items) {
			const extracted = extractor(item);
			if (!extracted) continue;
			for (const value of Array.isArray(extracted) ? extracted : [extracted]) {
				if (value) counts[value] = (counts[value] || 0) + 1;
			}
		}
		result[key] = counts;
	}
	return result;
}

/** Immutable toggle: removes `value` if present, appends it otherwise. */
export function toggleArrayValue(current: string[], value: string): string[] {
	return current.includes(value) ? current.filter((v) => v !== value) : [...current, value];
}

/** Orders the bounds so `min <= max` regardless of argument order. */
export function normalizeYearRange(min: number, max: number): YearRange {
	return { min: Math.min(min, max), max: Math.max(min, max) };
}
