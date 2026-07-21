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
	readonly filteredItems: TItem[] = $derived.by(() => {
		const filters = this.activeFilters;
		return this.items.filter((item) => {
			if (filters.yearRange && !this.matchesYearRange(item, filters.yearRange)) return false;
			for (const key of ENTITY_ARRAY_FILTER_KEYS) {
				const active = filters[key];
				if (active.length > 0 && !this.dimensions[key].match(item, active)) return false;
			}
			return true;
		});
	});

	/** Per-dimension value counts over the filtered items. */
	readonly counts: Record<EntityArrayFilterKey, Record<string, number>> = $derived.by(() => {
		const result = {} as Record<EntityArrayFilterKey, Record<string, number>>;
		for (const key of ENTITY_ARRAY_FILTER_KEYS) {
			const extractor = this.dimensions[key].countExtractor;
			const counts: Record<string, number> = {};
			for (const item of this.filteredItems) {
				const extracted = extractor(item);
				if (!extracted) continue;
				for (const value of Array.isArray(extracted) ? extracted : [extracted]) {
					if (value) counts[value] = (counts[value] || 0) + 1;
				}
			}
			result[key] = counts;
		}
		return result;
	});

	constructor(config: EntityFilterConfig<TItem>) {
		this.items = config.items;
		this.dimensions = config.dimensions;
		this.matchesYearRange = config.matchesYearRange;
		this.filterOptions = config.filterOptions;
	}

	// Methods are arrow-bound so they can be passed around unbound
	// (onclick={system.resetYearRange}, setter maps, …).

	toggle = (key: EntityArrayFilterKey, value: string): void => {
		const current = this.activeFilters[key];
		this.activeFilters[key] = current.includes(value)
			? current.filter((v) => v !== value)
			: [...current, value];
	};

	setValues = (key: EntityArrayFilterKey, values: string[]): void => {
		this.activeFilters[key] = values;
	};

	updateYearRange = (min: number, max: number): void => {
		this.activeFilters.yearRange = { min: Math.min(min, max), max: Math.max(min, max) };
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
