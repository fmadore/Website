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
 * Each page declares the dimensions it offers (`EntityDimension`: key, URL
 * parameter, heading, vocabulary, match and count, placement), so a facet is
 * one entry rather than an edit to the core (#220); the item type and the set
 * of keys are generic. The free-text search lives here too (`searchTerm`, with
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
	filterEntityItems,
	computeDisjunctiveFacets,
	countActiveFilters,
	emptyFilters,
	toggleArrayValue,
	normalizeYearRange,
	type EntityDimension,
	type EntityIndexFilters,
	type EntityIndexFilterOptions
} from './entityFilterCore';
import {
	canonicalizeFacetValues,
	foldedAliasLookup,
	type UrlFilterDimension
} from './filterSerialization';
import { TAG_ALIASES } from '#lib/data/tagVocabulary.ts';
import { haystackMatches, parseSearchQuery, searchHaystack } from './searchText';

export type { EntityDimension, EntityIndexFilters, EntityIndexFilterOptions };

/**
 * Retired tag spellings onto the current vocabulary, for links shared before a
 * rename (`?tag=AI` → `Artificial Intelligence`): the `alias` of every index's
 * tags dimension.
 */
export const tagAlias = foldedAliasLookup(TAG_ALIASES);

export interface EntityFilterConfig<TItem, K extends string> {
	items: TItem[];
	/** The facets this index offers, in the order the bar and grid draw them. */
	dimensions: readonly EntityDimension<TItem, K>[];
	/** Returns true if the item falls within the given year range. */
	matchesYearRange: (item: TItem, range: YearRange) => boolean;
	/** The corpus years, for the year slider. */
	years: number[];
	/**
	 * The fields the free-text search reads, as the row prints them. Given,
	 * the search becomes part of the system: it narrows `filteredItems` and
	 * every facet count and total, so a chip never promises a match the search
	 * has already removed. Omitted, `searchTerm` narrows nothing.
	 */
	searchFields?: (item: TItem) => readonly string[];
}

export class EntityFilterSystem<TItem, K extends string = string> {
	/** The facets, as the page declared them. */
	readonly dimensions: readonly EntityDimension<TItem, K>[];
	readonly filterOptions: EntityIndexFilterOptions<K>;
	/** The heading each facet prints, in the grid and the "Filtered by" line. */
	readonly labels: Record<K, string>;

	private readonly items: TItem[];
	private readonly searchFields?: (item: TItem) => readonly string[];
	/** Each item's folded search text, built on the first search. */
	private haystacks: Map<TItem, string> | undefined;
	private readonly matchesYearRange: (item: TItem, range: YearRange) => boolean;
	private readonly byKey: Map<K, EntityDimension<TItem, K>>;

	/** Deep-reactive filter state; mutated in place, never reassigned. */
	readonly activeFilters: EntityIndexFilters<K>;

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

	readonly counts = $derived.by(() => this.facets.counts);

	/**
	 * Per dimension, how many items clearing that dimension alone would return —
	 * the number an "All" option prints. Read it rather than summing `counts`:
	 * a multi-valued dimension (languages, tags) double-counts in that sum.
	 */
	readonly totals = $derived.by(() => this.facets.totals);

	/**
	 * How many filter values are set (each facet value once, a year range
	 * once); above zero, the filters narrow the index.
	 */
	readonly activeFilterCount = $derived.by(() =>
		countActiveFilters(this.activeFilters, this.dimensions)
	);

	/** Whether the search box holds anything (what `q` serializes). */
	readonly hasSearch = $derived(this.searchTerm.trim().length > 0);

	/**
	 * Everything narrowing the list: the facet values and year range, plus one
	 * for the search. The number the tally's "N filters active" prints.
	 */
	readonly narrowingCount = $derived(this.activeFilterCount + (this.hasSearch ? 1 : 0));

	/** Accessor pair in the shape the `urlFilterSync` action takes for `q`. */
	readonly search: { value: string };

	/** The dimensions as the `urlFilterSync` action reads and writes them. */
	readonly urlDimensions: readonly UrlFilterDimension[];

	constructor(config: EntityFilterConfig<TItem, K>) {
		this.items = config.items;
		this.dimensions = config.dimensions;
		this.matchesYearRange = config.matchesYearRange;
		this.searchFields = config.searchFields;
		// eslint-disable-next-line svelte/prefer-svelte-reactivity -- a lookup over fixed config, never observed
		this.byKey = new Map(config.dimensions.map((dimension) => [dimension.key, dimension]));
		const options = { years: config.years } as EntityIndexFilterOptions<K>;
		const labels = {} as Record<K, string>;
		for (const dimension of config.dimensions) {
			(options as Record<K, readonly string[]>)[dimension.key] = dimension.options;
			labels[dimension.key] = dimension.label;
		}
		this.filterOptions = options;
		this.labels = labels;
		this.activeFilters = $state(emptyFilters(config.dimensions));
		this.urlDimensions = config.dimensions.map((dimension) => ({
			key: dimension.key,
			param: dimension.param,
			legacyParams: dimension.legacyParams
		}));
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

	/** The dimension declared under `key`, if this index offers it. */
	dimension = (key: K): EntityDimension<TItem, K> | undefined => this.byKey.get(key);

	/** The display form of a value: its dimension's label for it, else itself. */
	valueLabel = (key: K, value: string): string => this.byKey.get(key)?.valueLabel?.(value) ?? value;

	// Methods are arrow-bound so they can be passed around unbound
	// (onclick={system.resetYearRange}, the URL sync, …).

	/** The state's facet values, typed as the plain record they are. */
	private get values(): Record<K, string[]> {
		return this.activeFilters;
	}

	toggle = (key: K, value: string): void => {
		this.values[key] = toggleArrayValue(this.values[key], value);
	};

	setValues = (key: K, values: string[]): void => {
		this.values[key] = values;
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
		for (const { key } of this.dimensions) this.values[key] = [];
		this.activeFilters.yearRange = null;
	};

	/** `Clear all`: every facet, the year range and the search. */
	clearAll = (): void => {
		this.clearAllFilters();
		this.searchTerm = '';
	};

	/**
	 * Sets a dimension from values that came from outside the page (a URL, an
	 * agent): each is mapped onto the dimension's vocabulary through its alias
	 * (a retired tag, a person's name for their id) and then case- and
	 * accent-insensitively, so a hand-typed or differently-cased deep link
	 * selects the facet value the page prints, and a value the corpus does not
	 * hold is dropped instead of filtering to nothing.
	 */
	setFromUrl = (key: string, values: string[]): void => {
		const dimension = this.byKey.get(key as K);
		if (!dimension) return;
		this.setValues(
			dimension.key,
			canonicalizeFacetValues(values, dimension.options, dimension.alias)
		);
	};
}
