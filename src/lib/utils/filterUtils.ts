/**
 * Filter state helpers.
 *
 * The store-based filter factories that used to live here were replaced by
 * the runed `EntityFilterSystem` (`entityFilterSystem.svelte.ts`); only the
 * state-shape inspection helper remains.
 */

/**
 * Checks if any filters in the filter state object are active.
 * Handles arrays, objects (like yearRange), and primitive values.
 *
 * @param filters - The filter state object to check
 * @returns True if any filter has active values
 *
 * @example
 * const active = areFiltersActive(system.activeFilters);
 * // Returns true if any filter array has items, or yearRange is set, etc.
 */
export function areFiltersActive<T extends object>(filters: T | null | undefined): boolean {
	if (!filters) return false;

	return Object.values(filters).some((val: unknown) => {
		// Check for non-empty arrays
		if (Array.isArray(val) && val.length > 0) return true;

		// Check for non-null, non-array objects (like yearRange: { min, max })
		if (
			val !== null &&
			val !== undefined &&
			typeof val === 'object' &&
			!Array.isArray(val) &&
			Object.keys(val).length > 0
		) {
			return true;
		}

		// Check for truthy primitive values (non-empty strings, non-zero numbers, true)
		if (!Array.isArray(val) && typeof val !== 'object' && val !== null && val !== undefined) {
			return val !== '' && val !== 0 && val !== false;
		}

		return false;
	});
}
