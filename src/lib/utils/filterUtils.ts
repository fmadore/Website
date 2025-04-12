import { writable, derived } from 'svelte/store';
import type { Writable, Readable } from 'svelte/store';
import type { YearRange } from '$lib/types'; // Assuming YearRange is in types root

// --- Store Creation ---

/**
 * Creates a writable store for active filters with a defined initial state.
 * @param initialFilterState - The initial state object for the filters.
 */
export function createActiveFiltersStore<T extends Record<string, any>>(initialFilterState: T): Writable<T> {
	return writable<T>(initialFilterState);
}

// --- Filter Manipulation Functions ---

/**
 * Generates a function to toggle an item within an array in the active filters store.
 * @param activeFilters - The writable store holding the active filters.
 * @param key - The key in the active filters state corresponding to the array to modify.
 */
export function createToggleArrayFilter<T, K extends keyof T>(
	activeFilters: Writable<T>,
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
 * Generates a function to directly set an array filter in the active filters store.
 * @param activeFilters - The writable store holding the active filters.
 * @param key - The key in the active filters state corresponding to the array to set.
 */
export function createSetArrayFilter<T, K extends keyof T>(
	activeFilters: Writable<T>,
	key: K
): (items: T[K] extends (infer U)[] ? U[] : never) => void {
	return (items) => {
		activeFilters.update((filters) => ({ ...filters, [key]: items }));
	};
}

/**
 * Generates a function to update the year range filter.
 * @param activeFilters - The writable store holding the active filters.
 * @param key - The key in the active filters state corresponding to the YearRange | null.
 */
export function createUpdateRangeFilter<T, K extends keyof T>(
	activeFilters: Writable<T>,
	key: K
): (min: number, max: number) => void {
	// Ensure the key corresponds to a YearRange | null type at runtime, though TS struggles here
	return (min: number, max: number) => {
		const validatedMin = Math.min(min, max);
		const validatedMax = Math.max(min, max);
		activeFilters.update((filters) => ({
			...filters,
			[key]: { min: validatedMin, max: validatedMax } as T[K], // Cast needed
		}));
	};
}

/**
 * Generates a function to reset the year range filter to null.
 * @param activeFilters - The writable store holding the active filters.
 * @param key - The key in the active filters state corresponding to the YearRange | null.
 */
export function createResetRangeFilter<T, K extends keyof T>(
	activeFilters: Writable<T>,
	key: K
): () => void {
	// Ensure the key corresponds to a YearRange | null type at runtime
	return () => {
		activeFilters.update((filters) => ({ ...filters, [key]: null as T[K] })); // Cast needed
	};
}

/**
 * Generates a function to set the year range filter, handling null.
 * @param activeFilters - The writable store holding the active filters.
 * @param key - The key in the active filters state corresponding to the YearRange | null.
 * @param updateFn - The generated update function (createUpdateRangeFilter).
 * @param resetFn - The generated reset function (createResetRangeFilter).
 */
export function createSetRangeFilter<T, K extends keyof T>(
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
 * @param activeFilters - The writable store holding the active filters.
 * @param initialFilterState - The initial state object for the filters.
 */
export function createClearAllFilters<T extends Record<string, any>>(
	activeFilters: Writable<T>,
	initialFilterState: T
): () => void {
	return () => {
		activeFilters.set(initialFilterState);
	};
}

// --- Derived Count Store ---

/**
 * Creates a derived store that counts occurrences of values extracted from a list of items.
 * Handles single string values, arrays of strings, or undefined/null.
 * @param filteredItemsStore - A readable store containing the array of items to process.
 * @param keyExtractor - A function that takes an item and returns a string, array of strings, or undefined/null.
 */
export function createDerivedCountStore<TItem>(
	filteredItemsStore: Readable<TItem[]>,
	keyExtractor: (item: TItem) => string | string[] | undefined | null
): Readable<Record<string, number>> {
	return derived(filteredItemsStore, ($filteredItems) => {
		const counts: Record<string, number> = {};
		if (Array.isArray($filteredItems)) {
			$filteredItems.forEach((item) => {
				const keys = keyExtractor(item);
				if (keys) {
					if (Array.isArray(keys)) {
						keys.forEach((key) => {
							if (key) { // Ensure key is not empty string or null/undefined if array contains them
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