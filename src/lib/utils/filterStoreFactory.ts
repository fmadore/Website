/**
 * Filter Store Factory
 *
 * Creates a complete filter system from a declarative configuration.
 * Eliminates boilerplate shared across publications, communications, and other
 * filterable list pages.
 */

import type { YearRange } from '$lib/types';
import {
	createActiveFiltersStore,
	createToggleArrayFilter,
	createSetArrayFilter,
	createUpdateRangeFilter,
	createResetRangeFilter,
	createSetRangeFilter,
	createClearAllFilters,
	createDerivedCountStore
} from '$lib/utils/filterUtils';
import { derived, readable, type Readable, type Writable } from 'svelte/store';

/**
 * Configuration for an array-based filter dimension (e.g., types, tags, countries).
 */
export interface ArrayDimension<TItem> {
	/** Returns true if the item matches the given active filter values. */
	match: (item: TItem, activeValues: any[]) => boolean;
	/** Extracts countable value(s) from an item for the count store. */
	countExtractor?: (item: TItem) => string | string[] | undefined | null;
}

/**
 * Configuration for a range-based filter dimension (e.g., yearRange).
 */
export interface RangeDimension<TItem> {
	type: 'range';
	/** Returns true if the item falls within the given range. */
	match: (item: TItem, range: YearRange) => boolean;
}

export type FilterDimension<TItem> = ArrayDimension<TItem> | RangeDimension<TItem>;

function isRangeDimension<TItem>(dim: FilterDimension<TItem>): dim is RangeDimension<TItem> {
	return 'type' in dim && dim.type === 'range';
}

export interface FilterSystemConfig<TItem, TFilters extends Record<string, any>> {
	items: TItem[];
	initialFilters: TFilters;
	dimensions: { [K in keyof TFilters]?: FilterDimension<TItem> };
	filterOptions: Record<string, any>;
}

export interface FilterSystemResult<TItem, TFilters extends Record<string, any>> {
	activeFilters: Writable<TFilters>;
	filterOptions: Readable<Record<string, any>>;
	filteredItems: Readable<TItem[]>;
	toggles: Record<string, (value: any) => void>;
	setters: Record<string, (values: any) => void>;
	counts: Record<string, Readable<Record<string, number>>>;
	clearAllFilters: () => void;
	updateYearRange?: (min: number, max: number) => void;
	resetYearRange?: () => void;
	setYearRange?: (range: YearRange | null) => void;
}

/**
 * Creates a complete filter system from a declarative configuration.
 *
 * Returns stores and functions matching the existing filter API:
 * - activeFilters: writable store of current filter state
 * - filteredItems: derived store of items matching all active filters
 * - toggles/setters: per-dimension toggle and set functions
 * - counts: per-dimension count stores derived from filtered items
 * - clearAllFilters: resets all filters to initial state
 * - updateYearRange/resetYearRange/setYearRange: range control (if any range dimension exists)
 */
export function createFilterSystem<TItem, TFilters extends Record<string, any>>(
	config: FilterSystemConfig<TItem, TFilters>
): FilterSystemResult<TItem, TFilters> {
	const { items, initialFilters, dimensions, filterOptions: options } = config;

	const activeFilters = createActiveFiltersStore(initialFilters);
	const filterOptions = readable(options);

	const dimensionEntries = Object.entries(dimensions) as [string, FilterDimension<TItem>][];

	const filteredItems = derived(activeFilters, ($filters): TItem[] => {
		return items.filter((item) => {
			for (const [key, dim] of dimensionEntries) {
				const filterValue = $filters[key];
				if (isRangeDimension(dim)) {
					if (filterValue != null && !dim.match(item, filterValue as YearRange)) return false;
				} else {
					const arr = filterValue as any[];
					if (arr && arr.length > 0 && !dim.match(item, arr)) return false;
				}
			}
			return true;
		});
	});

	const toggles: Record<string, (value: any) => void> = {};
	const setters: Record<string, (values: any) => void> = {};
	const counts: Record<string, Readable<Record<string, number>>> = {};

	let updateYearRange: ((min: number, max: number) => void) | undefined;
	let resetYearRange: (() => void) | undefined;
	let setYearRange: ((range: YearRange | null) => void) | undefined;

	for (const [key, dim] of dimensionEntries) {
		if (isRangeDimension(dim)) {
			updateYearRange = createUpdateRangeFilter(activeFilters, key as keyof TFilters);
			resetYearRange = createResetRangeFilter(activeFilters, key as keyof TFilters);
			setYearRange = createSetRangeFilter(updateYearRange, resetYearRange);
		} else {
			toggles[key] = createToggleArrayFilter(activeFilters, key as keyof TFilters);
			setters[key] = createSetArrayFilter(activeFilters, key as keyof TFilters);
			if (dim.countExtractor) {
				counts[key] = createDerivedCountStore(filteredItems, dim.countExtractor);
			}
		}
	}

	return {
		activeFilters,
		filterOptions,
		filteredItems,
		toggles,
		setters,
		counts,
		clearAllFilters: createClearAllFilters(activeFilters, initialFilters),
		updateYearRange,
		resetYearRange,
		setYearRange
	};
}
