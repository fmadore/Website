/**
 * Runed entity filter system
 *
 * Successor to the Svelte-store `filterStoreFactory`. One class instance holds
 * the whole filter state for an entity-index page (publications, talks):
 * `activeFilters` is deep `$state`, `filteredItems` / `counts` are `$derived`.
 * Consumers read properties directly — no `$` store prefix, no
 * `as unknown as` casts — and pass `activeFilters` straight to the
 * `urlFilterSync` action (its deep reactivity is what the action tracks).
 *
 * The filter/option shape is fixed (both index pages share it); only the item
 * type is generic. The `activeFilters` object identity is stable for the life
 * of the instance — updates mutate its members — so captured references
 * (pages, actions) never go stale.
 *
 * The pure logic (predicate composition, facet counts, toggle/range helpers)
 * lives in `entityFilterCore.ts` so it can be unit-tested without the Svelte
 * compiler; this module wires it to `$state`/`$derived`.
 */

import type { YearRange } from '$lib/types';
import {
	ENTITY_ARRAY_FILTER_KEYS,
	filterEntityItems,
	computeFacetCounts,
	toggleArrayValue,
	normalizeYearRange,
	type EntityIndexFilters,
	type EntityArrayFilterKey,
	type EntityIndexFilterOptions,
	type EntityArrayDimension
} from './entityFilterCore';

export {
	ENTITY_ARRAY_FILTER_KEYS,
	type EntityIndexFilters,
	type EntityArrayFilterKey,
	type EntityIndexFilterOptions,
	type EntityArrayDimension
};

export interface EntityFilterConfig<TItem> {
	items: TItem[];
	dimensions: Record<EntityArrayFilterKey, EntityArrayDimension<TItem>>;
	/** Returns true if the item falls within the given year range. */
	matchesYearRange: (item: TItem, range: YearRange) => boolean;
	filterOptions: EntityIndexFilterOptions;
}

export class EntityFilterSystem<TItem> {
	readonly filterOptions: EntityIndexFilterOptions;

	private readonly items: TItem[];
	private readonly dimensions: Record<EntityArrayFilterKey, EntityArrayDimension<TItem>>;
	private readonly matchesYearRange: (item: TItem, range: YearRange) => boolean;

	/** Deep-reactive filter state; mutated in place, never reassigned. */
	readonly activeFilters: EntityIndexFilters = $state({
		types: [],
		yearRange: null,
		tags: [],
		languages: [],
		authors: [],
		countries: [],
		projects: []
	});

	/** Items matching every active dimension. */
	readonly filteredItems: TItem[] = $derived.by(() =>
		filterEntityItems(this.items, this.activeFilters, this.dimensions, this.matchesYearRange)
	);

	/** Per-dimension value counts over the filtered items. */
	readonly counts: Record<EntityArrayFilterKey, Record<string, number>> = $derived.by(() =>
		computeFacetCounts(this.filteredItems, this.dimensions)
	);

	constructor(config: EntityFilterConfig<TItem>) {
		this.items = config.items;
		this.dimensions = config.dimensions;
		this.matchesYearRange = config.matchesYearRange;
		this.filterOptions = config.filterOptions;
	}

	// Methods are arrow-bound so they can be passed around unbound
	// (onclick={system.resetYearRange}, setter maps, …).

	toggle = (key: EntityArrayFilterKey, value: string): void => {
		this.activeFilters[key] = toggleArrayValue(this.activeFilters[key], value);
	};

	setValues = (key: EntityArrayFilterKey, values: string[]): void => {
		this.activeFilters[key] = values;
	};

	updateYearRange = (min: number, max: number): void => {
		this.activeFilters.yearRange = normalizeYearRange(min, max);
	};

	resetYearRange = (): void => {
		this.activeFilters.yearRange = null;
	};

	setYearRange = (range: YearRange | null): void => {
		if (range) this.updateYearRange(range.min, range.max);
		else this.resetYearRange();
	};

	clearAllFilters = (): void => {
		for (const key of ENTITY_ARRAY_FILTER_KEYS) this.activeFilters[key] = [];
		this.activeFilters.yearRange = null;
	};

	/** Setter map in the shape the `urlFilterSync` action expects. */
	readonly setters = {
		setTypes: (v: string[]) => this.setValues('types', v),
		setTags: (v: string[]) => this.setValues('tags', v),
		setLanguages: (v: string[]) => this.setValues('languages', v),
		setAuthors: (v: string[]) => this.setValues('authors', v),
		setCountries: (v: string[]) => this.setValues('countries', v),
		setProjects: (v: string[]) => this.setValues('projects', v),
		setYearRange: (range: YearRange | null) => this.setYearRange(range)
	};
}
