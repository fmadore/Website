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
 * type is generic. The free-text search lives here too (`searchTerm`, with
 * `searchFields` from the config), because it narrows the facet counts as well
 * as the list. The `activeFilters` object identity is stable for the life
 * of the instance — updates mutate its members — so captured references
 * (pages, actions) never go stale.
 *
 * The pure logic (predicate composition, facet counts, toggle/range helpers)
 * lives in `entityFilterCore.ts` so it can be unit-tested without the Svelte
 * compiler; this module wires it to `$state`/`$derived`.
 */

import type { YearRange } from '#lib/types/index.ts';
import {
	ENTITY_ARRAY_FILTER_KEYS,
	filterEntityItems,
	computeDisjunctiveFacets,
	countActiveFilters,
	toggleArrayValue,
	normalizeYearRange,
	DEFAULT_FACET_LABELS,
	type EntityFacetLabels,
	type EntityIndexFilters,
	type EntityArrayFilterKey,
	type EntityIndexFilterOptions,
	type EntityArrayDimension
} from './entityFilterCore';
import { canonicalizeFacetValues, foldedAliasLookup } from './filterSerialization';
import { TAG_ALIASES } from '#lib/data/tagVocabulary.ts';

/**
 * Retired tag spellings onto the current vocabulary, for links shared before a
 * rename (`?tag=AI` → `Artificial Intelligence`). Tags only: the other facets
 * have no alias table.
 */
const tagAlias = foldedAliasLookup(TAG_ALIASES);
import { haystackMatches, parseSearchQuery, searchHaystack } from './searchText';

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
	/**
	 * The fields the free-text search reads, as the row prints them. Given,
	 * the search becomes part of the system: it narrows `filteredItems` and
	 * every facet count and total, so a chip never promises a match the search
	 * has already removed. Omitted, `searchTerm` narrows nothing.
	 */
	searchFields?: (item: TItem) => readonly string[];
	/** Facet headings where this index's dimension means something specific. */
	labels?: Partial<EntityFacetLabels>;
}

export class EntityFilterSystem<TItem> {
	readonly filterOptions: EntityIndexFilterOptions;
	/** The heading each facet prints, in the grid and the "Filtered by" line. */
	readonly labels: EntityFacetLabels;

	private readonly items: TItem[];
	private readonly searchFields?: (item: TItem) => readonly string[];
	/** Each item's folded search text, built on the first search. */
	private haystacks: Map<TItem, string> | undefined;
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

	/** The free-text search, as typed. Synced as `q` through `search`. */
	searchTerm = $state('');

	/** The search's needles (terms and quoted phrases), folded. */
	private readonly needles = $derived(parseSearchQuery(this.searchTerm));

	/** The search as a predicate, or nothing when it narrows nothing. */
	private readonly searchPredicate = $derived.by(() => {
		const needles = this.needles;
		if (!this.searchFields || needles.length === 0) return undefined;
		return (item: TItem) => haystackMatches(this.haystackOf(item), needles);
	});

	/** Items matching every active dimension and the search. */
	readonly filteredItems: TItem[] = $derived.by(() =>
		filterEntityItems(
			this.items,
			this.activeFilters,
			this.dimensions,
			this.matchesYearRange,
			this.searchPredicate
		)
	);

	/**
	 * Counts under all active filters except the dimension being counted, and
	 * always under the search.
	 */
	private readonly facets = $derived.by(() =>
		computeDisjunctiveFacets(
			this.items,
			this.activeFilters,
			this.dimensions,
			this.matchesYearRange,
			this.searchPredicate
		)
	);

	readonly counts = $derived(this.facets.counts);

	/**
	 * Per dimension, how many items clearing that dimension alone would return —
	 * the number an "All" option prints. Read it rather than summing `counts`:
	 * a multi-valued dimension (languages, tags) double-counts in that sum.
	 */
	readonly totals = $derived(this.facets.totals);

	/**
	 * How many filter values are set (each facet value once, a year range
	 * once); above zero, the filters narrow the index.
	 */
	readonly activeFilterCount = $derived(countActiveFilters(this.activeFilters));

	/** Whether the search box holds anything (what `q` serializes). */
	readonly hasSearch = $derived(this.searchTerm.trim().length > 0);

	/**
	 * Everything narrowing the list: the facet values and year range, plus one
	 * for the search. The number the tally's "N filters active" prints.
	 */
	readonly narrowingCount = $derived(this.activeFilterCount + (this.hasSearch ? 1 : 0));

	/** Accessor pair in the shape the `urlFilterSync` action takes for `q`. */
	readonly search: { value: string };

	constructor(config: EntityFilterConfig<TItem>) {
		this.items = config.items;
		this.dimensions = config.dimensions;
		this.matchesYearRange = config.matchesYearRange;
		this.filterOptions = config.filterOptions;
		this.searchFields = config.searchFields;
		this.labels = { ...DEFAULT_FACET_LABELS, ...config.labels };
		// eslint-disable-next-line @typescript-eslint/no-this-alias -- the accessor's getters need the instance
		const system = this;
		this.search = {
			get value() {
				return system.searchTerm;
			},
			set value(next: string) {
				system.searchTerm = next;
			}
		};
	}

	private haystackOf(item: TItem): string {
		// eslint-disable-next-line svelte/prefer-svelte-reactivity -- a cache over fixed items, never observed
		this.haystacks ??= new Map();
		let haystack = this.haystacks.get(item);
		if (haystack === undefined) {
			haystack = searchHaystack(this.searchFields?.(item) ?? []);
			this.haystacks.set(item, haystack);
		}
		return haystack;
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

	/** `Clear all`: every facet, the year range and the search. */
	clearAll = (): void => {
		this.clearAllFilters();
		this.searchTerm = '';
	};

	/**
	 * Sets a dimension from values that came from outside the page (a URL):
	 * each is mapped onto the dimension's option list, so a hand-typed or
	 * differently-cased deep link selects the chip the page prints, and a value
	 * the corpus does not hold is dropped instead of filtering to nothing.
	 */
	private setFromUrl = (key: EntityArrayFilterKey, values: string[]): void => {
		this.setValues(
			key,
			canonicalizeFacetValues(
				values,
				this.filterOptions[key],
				key === 'tags' ? tagAlias : undefined
			)
		);
	};

	/** Setter map in the shape the `urlFilterSync` action expects. */
	readonly setters = {
		setTypes: (v: string[]) => this.setFromUrl('types', v),
		setTags: (v: string[]) => this.setFromUrl('tags', v),
		setLanguages: (v: string[]) => this.setFromUrl('languages', v),
		setAuthors: (v: string[]) => this.setFromUrl('authors', v),
		setCountries: (v: string[]) => this.setFromUrl('countries', v),
		setProjects: (v: string[]) => this.setFromUrl('projects', v),
		setYearRange: (range: YearRange | null) => this.setYearRange(range)
	};
}
