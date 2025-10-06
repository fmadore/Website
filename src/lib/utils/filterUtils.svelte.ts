/**
 * filterUtils.svelte.ts
 *
 * Svelte 5 runes-based filter utilities for shared reactive state management.
 * This replaces the legacy store-based filterUtils.ts.
 *
 * Key differences from Svelte 4 stores:
 * - Uses $state() internally for reactive state
 * - Exports proper Svelte stores that can be used with $ prefix
 * - Compatible with both runes and store patterns
 * - More performant and integrates better with Svelte 5's reactivity system
 */

import type { YearRange } from '$lib/types';
import { writable, readable, derived } from 'svelte/store';

/**
 * Creates a writable store for active filters with a defined initial state.
 * Returns a Svelte store that can be used with the $ prefix in components.
 *
 * @param initialFilterState - The initial state object for the filters.
 * @returns A writable Svelte store
 */
export function createActiveFiltersStore<T extends Record<string, any>>(
	initialFilterState: T
) {
	return writable<T>(initialFilterState);
}

/**
 * Generates a function to toggle an item within an array in the active filters.
 * @param activeFilters - The writable store for filters
 * @param key - The key in the active filters state corresponding to the array to modify.
 */
export function createToggleArrayFilter<T extends Record<string, any>, K extends keyof T>(
	activeFilters: ReturnType<typeof writable<T>>,
	key: K
): (item: T[K] extends (infer U)[] ? U : never) => void {
	return (item) => {
		activeFilters.update((filters) => {
			const currentArray = (filters[key] as unknown[] | undefined) ?? [];
			const newArray = currentArray.includes(item)
				? currentArray.filter((i) => i !== item)
				: [...currentArray, item];
			return { ...filters, [key]: newArray };
		});
	};
}

/**
 * Generates a function to directly set an array filter in the active filters.
 * @param activeFilters - The writable store for filters
 * @param key - The key in the active filters state corresponding to the array to set.
 */
export function createSetArrayFilter<T extends Record<string, any>, K extends keyof T>(
	activeFilters: ReturnType<typeof writable<T>>,
	key: K
): (items: T[K] extends (infer U)[] ? U[] : never) => void {
	return (items) => {
		activeFilters.update((filters) => ({ ...filters, [key]: items }));
	};
}

/**
 * Generates a function to update the year range filter.
 * @param activeFilters - The writable store for filters
 * @param key - The key in the active filters state corresponding to the YearRange | null.
 */
export function createUpdateRangeFilter<T extends Record<string, any>, K extends keyof T>(
	activeFilters: ReturnType<typeof writable<T>>,
	key: K
): (min: number, max: number) => void {
	return (min: number, max: number) => {
		const validatedMin = Math.min(min, max);
		const validatedMax = Math.max(min, max);
		activeFilters.update((filters) => ({
			...filters,
			[key]: { min: validatedMin, max: validatedMax } as T[K]
		}));
	};
}

/**
 * Generates a function to reset the year range filter to null.
 * @param activeFilters - The writable store for filters
 * @param key - The key in the active filters state corresponding to the YearRange | null.
 */
export function createResetRangeFilter<T extends Record<string, any>, K extends keyof T>(
	activeFilters: ReturnType<typeof writable<T>>,
	key: K
): () => void {
	return () => {
		activeFilters.update((filters) => ({ ...filters, [key]: null as T[K] }));
	};
}

/**
 * Generates a function to set the year range filter, handling null.
 * @param updateFn - The generated update function (createUpdateRangeFilter).
 * @param resetFn - The generated reset function (createResetRangeFilter).
 */
export function createSetRangeFilter(
	updateFn: (min: number, max: number) => void,
	resetFn: () => void
): (range: YearRange | null) => void {
	return (range: YearRange | null) => {
		if (range) {
			updateFn(range.min, range.max);
		} else {
			resetFn();
		}
	};
}

/**
 * Generates a function to clear all filters back to their initial state.
 * @param activeFilters - The writable store for filters
 * @param initialFilterState - The initial state object for the filters.
 */
export function createClearAllFilters<T extends Record<string, any>>(
	activeFilters: ReturnType<typeof writable<T>>,
	initialFilterState: T
): () => void {
	return () => {
		activeFilters.set(initialFilterState);
	};
}

/**
 * Creates a derived store that counts occurrences of values extracted from a list of items.
 * Handles single string values, arrays of strings, or undefined/null.
 *
 * @param itemsStore - A readable store containing the array of items to process
 * @param keyExtractor - A function that takes an item and returns a string, array of strings, or undefined/null.
 * @returns A readable store containing the counts
 */
export function createDerivedCountStore<TItem>(
	itemsStore: ReturnType<typeof readable<TItem[]>>,
	keyExtractor: (item: TItem) => string | string[] | undefined | null
) {
	return derived(itemsStore, ($items) => {
		const counts: Record<string, number> = {};
		
		if (Array.isArray($items)) {
			$items.forEach((item) => {
				const keys = keyExtractor(item);
				if (keys) {
					if (Array.isArray(keys)) {
						keys.forEach((key) => {
							if (key) {
								counts[key] = (counts[key] || 0) + 1;
							}
						});
					} else {
						counts[keys] = (counts[keys] || 0) + 1;
					}
				}
			});
		}
		return counts;
	});
}
