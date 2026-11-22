/**
 * Pure core of the entity filter system.
 *
 * Extracted from `entityFilterSystem.svelte.ts` so the predicate composition,
 * facet counting, and small state helpers can be unit-tested in plain Node
 * (the Vitest config deliberately has no Svelte compiler, so runes modules
 * can't be imported by tests). The runed `EntityFilterSystem` class wraps
 * these functions with `$state`/`$derived`; behaviour is identical.
 */

import type { YearRange } from '#lib/types/index.ts';

/**
 * Where a dimension's facet is drawn, which also fixes how it reads:
 *
 * - `bar-primary`: the filter bar's first chip row, opened by "All N" (types);
 * - `bar-secondary`: the bar's labelled second row (language);
 * - `grid-list`: a column of ledger rows in the `More filters` grid, cut at
 *   `limit` with a combobox for the tail (projects, co-authors, countries);
 * - `grid-chips`: a chip row in the grid, cut the same way (tags, and the
 *   one- or two-value facets: open access, status, slides).
 *
 * The grid lays its facets out in the order the page declares them.
 */
export type FacetPlacement = 'bar-primary' | 'bar-secondary' | 'grid-list' | 'grid-chips';

/**
 * One array-valued filter dimension, described whole: its state key, the URL
 * parameter it is shared under, its heading, its vocabulary, how it matches and
 * counts, and where its facet is drawn. An index page lists the dimensions it
 * offers; the filter system, the URL sync, the facet grid and the "Filtered by"
 * line all read the same list, so a new facet is one entry, not an edit to the
 * core.
 */
export interface EntityDimension<TItem, K extends string = string> {
	key: K;
	/** URL parameter: one entry per value (`?tag=a&tag=b`). */
	param: string;
	/**
	 * Parameters this dimension was once shared under, still read (and then
	 * written as `param`), so a link shared before a rename keeps its filter.
	 */
	legacyParams?: readonly string[];
	/** The heading the facet prints, in the grid and the "Filtered by" line. */
	label: string;
	/** The values the facet offers, in the order it prints them. */
	options: readonly string[];
	/** Returns true if the item matches any of the active filter values. */
	match: (item: TItem, activeValues: string[]) => boolean;
	/** Extracts countable value(s) from an item for the facet counts. */
	countExtractor: (item: TItem) => string | string[] | undefined | null;
	placement: FacetPlacement;
	/** For a cut facet: how many values print before the combobox takes over. */
	limit?: number;
	/**
	 * The grid's year slider shares this facet's column (the countries).
	 * Without one, the years take a column of their own after the lists.
	 */
	yearsBeside?: boolean;
	/** The facet as a plural noun, where the heading is not one ("countries" for "Held in"). */
	noun?: string;
	/** The display form of a value, where it is a key (a person id). */
	valueLabel?: (value: string) => string;
	/**
	 * Maps a value from outside the page (a URL, an agent) onto the
	 * vocabulary before matching: a retired tag spelling, a person's name for
	 * their id.
	 */
	alias?: (value: string) => string;
}

/** The filter state: each dimension's selected values, and the year range. */
export type EntityIndexFilters<K extends string = string> = Record<K, string[]> & {
	yearRange: YearRange | null;
};

/** The vocabulary of each dimension, plus the corpus years. */
export type EntityIndexFilterOptions<K extends string = string> = Record<K, readonly string[]> & {
	years: number[];
};

/**
 * A narrowing that is not a facet: the index's free-text search. It applies to
 * the list and to every facet's counts alike, so a chip never promises what
 * the search has already taken away. Absent, nothing is narrowed.
 */
export type EntityItemPredicate<TItem> = (item: TItem) => boolean;

type Dimensions<TItem, K extends string> = readonly EntityDimension<TItem, K>[];

/** A fresh, empty filter state for these dimensions. */
export function emptyFilters<K extends string>(
	dimensions: readonly { key: K }[]
): EntityIndexFilters<K> {
	const filters = { yearRange: null } as EntityIndexFilters<K>;
	for (const { key } of dimensions) (filters as Record<K, string[]>)[key] = [];
	return filters;
}

/** Whether an item passes the search, the year range and every dimension but `skip`. */
function admits<TItem, K extends string>(
	item: TItem,
	filters: EntityIndexFilters<K>,
	dimensions: Dimensions<TItem, K>,
	matchesYearRange: (item: TItem, range: YearRange) => boolean,
	predicate: EntityItemPredicate<TItem> | undefined,
	skip?: K
): boolean {
	if (predicate && !predicate(item)) return false;
	if (filters.yearRange && !matchesYearRange(item, filters.yearRange)) return false;
	for (const dimension of dimensions) {
		if (dimension.key === skip) continue;
		const active = filters[dimension.key];
		if (active.length > 0 && !dimension.match(item, active)) return false;
	}
	return true;
}

/**
 * Items matching every active dimension (AND across dimensions; each
 * dimension's `match` decides its own within-dimension semantics).
 * A dimension with no active values does not narrow.
 */
export function filterEntityItems<TItem, K extends string>(
	items: TItem[],
	filters: EntityIndexFilters<K>,
	dimensions: Dimensions<TItem, K>,
	matchesYearRange: (item: TItem, range: YearRange) => boolean,
	predicate?: EntityItemPredicate<TItem>
): TItem[] {
	return items.filter((item) => admits(item, filters, dimensions, matchesYearRange, predicate));
}

/** Per-dimension value counts over the given (already filtered) items. */
export function computeFacetCounts<TItem, K extends string>(
	items: TItem[],
	dimensions: Dimensions<TItem, K>
): Record<K, Record<string, number>> {
	const result = {} as Record<K, Record<string, number>>;
	for (const dimension of dimensions) {
		result[dimension.key] = countDimension(items, dimension.countExtractor);
	}
	return result;
}

function countDimension<T>(
	items: T[],
	extractor: EntityDimension<T>['countExtractor']
): Record<string, number> {
	const counts: Record<string, number> = Object.create(null);
	for (const item of items) {
		const extracted = extractor(item);
		if (!extracted) continue;
		for (const value of Array.isArray(extracted) ? extracted : [extracted]) {
			if (value) counts[value] = (counts[value] ?? 0) + 1;
		}
	}
	return counts;
}

/**
 * Facet counts for an OR-within/AND-across filter UI. Each dimension is
 * counted after applying the year range and every *other* active dimension,
 * so an unselected value reports how many results it would add.
 *
 * `totals` is, per dimension, how many items clearing that dimension alone
 * would return — the number the "All" option in a facet row prints, and
 * exactly the number clicking it produces. It is not the sum of that
 * dimension's counts: a dimension whose extractor yields several values per
 * item (languages, tags, countries) double-counts in that sum, and one whose
 * value can be absent under-counts. Both are the same defect — an "All" that
 * asserts a total the click does not produce.
 *
 * `predicate` (the search) narrows every count and total: it is not a facet
 * the "All" option clears, so what clicking "All" produces still has it.
 */
export function computeDisjunctiveFacets<TItem, K extends string>(
	items: TItem[],
	filters: EntityIndexFilters<K>,
	dimensions: Dimensions<TItem, K>,
	matchesYearRange: (item: TItem, range: YearRange) => boolean,
	predicate?: EntityItemPredicate<TItem>
): {
	counts: Record<K, Record<string, number>>;
	totals: Record<K, number>;
} {
	const counts = {} as Record<K, Record<string, number>>;
	const totals = {} as Record<K, number>;
	for (const counted of dimensions) {
		const eligibleItems = items.filter((item) =>
			admits(item, filters, dimensions, matchesYearRange, predicate, counted.key)
		);
		counts[counted.key] = countDimension(eligibleItems, counted.countExtractor);
		totals[counted.key] = eligibleItems.length;
	}
	return { counts, totals };
}

/**
 * How many filter values are set: each selected facet value counts once, a
 * year range once. The number the "N filters active" readout prints, and —
 * above zero — whether the filters narrow the index at all.
 */
export function countActiveFilters<K extends string>(
	filters: EntityIndexFilters<K>,
	dimensions: readonly { key: K }[]
): number {
	let count = filters.yearRange ? 1 : 0;
	for (const { key } of dimensions) count += filters[key].length;
	return count;
}

/** Whether a dimension's facet sits in the `More filters` grid. */
export const inGrid = (dimension: { placement: FacetPlacement }): boolean =>
	dimension.placement === 'grid-list' || dimension.placement === 'grid-chips';

/**
 * Whether any facet inside the `More filters` grid, or the year range, is set.
 * The grid is closed by default, so a filter on one of its facets (a deep
 * link, Back to a filtered view) is what opens it: an active filter is never
 * left behind a closed disclosure.
 */
export function hasGridFilters<K extends string>(
	filters: EntityIndexFilters<K>,
	dimensions: readonly { key: K; placement: FacetPlacement }[]
): boolean {
	return (
		!!filters.yearRange ||
		dimensions.some((dimension) => inGrid(dimension) && filters[dimension.key].length > 0)
	);
}

/** One facet's part of the "Filtered by" line: its heading and its values. */
export interface ActiveFilterGroup {
	key: string;
	label: string;
	/** Joined with "or" when printed: values within one facet widen (OR). */
	values: string[];
}

/**
 * What is narrowing the list, grouped by facet. A bare run of values ("ISLAM ·
 * TOGO") could not say that a country and a tag both read "Togo", nor that two
 * tags widen the list (OR) while a tag and a country narrow it (AND); grouped
 * under their headings the line states the rule: `Tags: Islam or Togo ·
 * Countries: Togo`. The search leads, quoted, since it narrows like a facet and
 * the tally counts it as one. Facets read in the order the page draws them:
 * the bar's rows, then the grid's columns.
 */
export function describeActiveFilters<K extends string>(
	filters: EntityIndexFilters<K>,
	dimensions: readonly Pick<
		EntityDimension<unknown, K>,
		'key' | 'label' | 'placement' | 'valueLabel'
	>[],
	options: {
		/** Display form of a value (type codes → labels, typeset quotes). */
		valueLabel?: (key: K, value: string) => string;
		/** The year read-out, printed when a range is set. */
		yearReadout?: string;
		searchTerm?: string;
	} = {}
): ActiveFilterGroup[] {
	const groups: ActiveFilterGroup[] = [];
	const term = options.searchTerm?.trim();
	if (term)
		groups.push({ key: 'search', label: 'Search', values: [`“${truncateSearchTerm(term)}”`] });
	const ordered = [
		...dimensions.filter((dimension) => !inGrid(dimension)),
		...dimensions.filter(inGrid)
	];
	for (const dimension of ordered) {
		const values = filters[dimension.key];
		if (values.length === 0) continue;
		groups.push({
			key: dimension.key,
			label: dimension.label,
			values: values.map(
				(value) =>
					options.valueLabel?.(dimension.key, value) ?? dimension.valueLabel?.(value) ?? value
			)
		});
	}
	if (filters.yearRange && options.yearReadout) {
		groups.push({ key: 'yearRange', label: 'Years', values: [options.yearReadout] });
	}
	return groups;
}

/**
 * The index pages' free-text search: every whitespace-separated term of the
 * query must occur, case-insensitively, somewhere among the row's fields (AND
 * semantics). A term holds no whitespace, so it can never match across the
 * boundary between two fields. An empty or blank query matches everything.
 */
export { matchesSearchTerms } from '#lib/utils/searchText.ts';

/** One bar of an index hero's year strip. */
export interface YearBar {
	year: number;
	count: number;
	/** Bar height as a percentage of the strip. */
	pct: number;
}

/**
 * The span and year strip an index hero prints over its whole corpus: one bar
 * per year from the first to the last, so a year with no entries still takes
 * its place on the axis as a visible stub (6%) and the rest scale 12–100%
 * against the busiest year. Non-finite years are ignored; an empty corpus
 * reads as the current year with no entries.
 */
export function summariseYears(years: readonly number[]): {
	minYear: number;
	maxYear: number;
	bars: YearBar[];
} {
	const finite = years.filter((year) => Number.isFinite(year));
	const thisYear = new Date().getFullYear();
	const minYear = finite.length ? Math.min(...finite) : thisYear;
	const maxYear = finite.length ? Math.max(...finite) : thisYear;
	const counts = new Map<number, number>();
	for (let year = minYear; year <= maxYear; year++) counts.set(year, 0);
	for (const year of finite) counts.set(year, (counts.get(year) ?? 0) + 1);
	const busiest = Math.max(1, ...counts.values());
	const bars = Array.from(counts, ([year, count]) => ({
		year,
		count,
		pct: count === 0 ? 6 : Math.round(12 + (count / busiest) * 88)
	}));
	return { minYear, maxYear, bars };
}

/** Immutable toggle: removes `value` if present, appends it otherwise. */
export function toggleArrayValue(current: string[], value: string): string[] {
	return current.includes(value) ? current.filter((v) => v !== value) : [...current, value];
}

/** Orders the bounds so `min <= max` regardless of argument order. */
export function normalizeYearRange(min: number, max: number): YearRange {
	return { min: Math.min(min, max), max: Math.max(min, max) };
}

/**
 * Clamps a year range to the corpus bounds for *display*. A `?year_min=1900`
 * deep link is honoured by the filter state exactly as the URL gave it — the
 * predicate is a comparison and a wider window narrows nothing — but the
 * slider, its read-out and its ARIA values describe a track that only spans the
 * corpus, and printing `1900–2026` beside a handle parked on 2013 is the
 * control lying about where it is. Returns the corpus span itself when the
 * range is absent.
 */
export function clampYearRange(
	range: YearRange | null | undefined,
	min: number,
	max: number
): YearRange {
	// A corpus with inverted bounds is not a range to clamp into; hand it back
	// rather than inventing one.
	if (min > max) return { min, max };
	if (!range) return { min, max };
	const lo = Math.min(Math.max(range.min, min), max);
	const hi = Math.min(Math.max(range.max, min), max);
	return lo <= hi ? { min: lo, max: hi } : { min: hi, max: lo };
}

/**
 * Whether a year range admits any year of the corpus span. A range wholly
 * outside it (`?year_min=2030` on a corpus that ends in 2026) narrows the index
 * to nothing, and clamping it would put a handle on a year that has entries.
 */
export function yearRangeOverlaps(range: YearRange, min: number, max: number): boolean {
	return range.max >= min && range.min <= max;
}

/** One year, a span, or an open-ended bound, as the read-out prints it. */
function formatYearSpan(lo: number, hi: number): string {
	if (!Number.isFinite(lo) && !Number.isFinite(hi)) return 'All years';
	if (!Number.isFinite(hi)) return `${lo} onwards`;
	if (!Number.isFinite(lo)) return `Up to ${hi}`;
	return lo === hi ? `${lo}` : `${lo}–${hi}`;
}

/**
 * The year read-out: what the filter state means, in words. An absent range is
 * the whole corpus span. A range that overlaps the corpus is printed clamped,
 * as the slider shows it, which within the corpus is exactly what the predicate
 * admits. A range that misses the corpus entirely is printed as given: clamped,
 * it would name a boundary year that has entries beside a count of zero.
 */
export function yearRangeReadout(
	range: YearRange | null | undefined,
	min: number,
	max: number
): string {
	if (!range) return `All years · ${min}–${max}`;
	if (min <= max && !yearRangeOverlaps(range, min, max)) {
		const ordered = normalizeYearRange(range.min, range.max);
		return formatYearSpan(ordered.min, ordered.max);
	}
	const shown = clampYearRange(range, min, max);
	return formatYearSpan(shown.min, shown.max);
}

/**
 * The reader's search term as it is quoted back in an empty state. Long terms
 * are cut at `maxLength` and closed with an ellipsis, so a pasted paragraph
 * cannot push the rest of the sentence off the line.
 */
export function truncateSearchTerm(term: string, maxLength = 60): string {
	const trimmed = term.trim();
	return trimmed.length <= maxLength ? trimmed : `${trimmed.slice(0, maxLength)}…`;
}
