import { page } from '$app/state';
import { replaceState } from '$app/navigation';
import { browser } from '$app/environment';
import { untrack } from 'svelte';
import type { Action } from 'svelte/action';
import {
	ARRAY_FILTER_PARAMS,
	serializeFiltersToQuery,
	parseArrayFilterParam,
	parseSearchParam,
	parseYearRangeParams,
	arrayValuesEqual,
	yearRangesEqual,
	type UrlSyncableFilters
} from '$lib/utils/filterSerialization';

type ActiveFilters = UrlSyncableFilters;

interface FilterSetters {
	setTypes?: (value: string[]) => void;
	setTags?: (value: string[]) => void;
	setLanguages?: (value: string[]) => void;
	setAuthors?: (value: string[]) => void;
	setCountries?: (value: string[]) => void;
	setProjects?: (value: string[]) => void;
	setYearRange?: (value: { min: number; max: number } | null) => void;
	// Add other setters corresponding to ActiveFilters
}

/**
 * Read/write access to a page's free-text search box. It is page-local state
 * rather than part of the filter system, so the action takes an accessor pair
 * whose getter is read inside the effects (which is what makes it tracked).
 */
export interface SearchTermAccessor {
	get value(): string;
	set value(next: string);
}

interface UrlFilterSyncParams {
	/** Reactive filters object (using $state runes) */
	filters: ActiveFilters;
	/** Setter functions for each filter category */
	setters: FilterSetters;
	/** Optional free-text search, synced as `q`. */
	search?: SearchTermAccessor;
}

/** Setter name for each array-valued filter key. */
const ARRAY_FILTER_SETTERS = {
	types: 'setTypes',
	tags: 'setTags',
	languages: 'setLanguages',
	authors: 'setAuthors',
	countries: 'setCountries',
	projects: 'setProjects'
} as const;

/**
 * Svelte Action to synchronize filter state with URL query parameters.
 * Modernized for Svelte 5 using $effect() and $app/state. The pure
 * serialization/parsing logic lives in `$lib/utils/filterSerialization`.
 *
 * @example
 * ```svelte
 * <script>
 *   let filters = $state({ types: [], tags: [] });
 *
 *   function setTypes(value: string[]) { filters.types = value; }
 *   function setTags(value: string[]) { filters.tags = value; }
 * </script>
 *
 * <div use:urlFilterSync={{ filters, setters: { setTypes, setTags } }}>
 * ```
 */
export const urlFilterSync: Action<HTMLElement, UrlFilterSyncParams> = (node, params) => {
	const { filters, setters, search } = params;
	let initialUrlApplied = false;
	let lastFiltersString = '';

	/** The whole URL-syncable state as one comparable string. */
	const stateSignature = () => JSON.stringify({ f: filters, q: search?.value ?? '' });

	// --- Sync filters to URL ---
	$effect(() => {
		const currentFiltersString = stateSignature();

		// Skip initial run until URL has been applied
		if (!initialUrlApplied || currentFiltersString === lastFiltersString) {
			return;
		}

		lastFiltersString = currentFiltersString;

		// Array filters use one entry per value so individual values can safely
		// contain commas (e.g. project names like "Islam's 'Peripheries':
		// Digital Humanities, Algorithmic Analysis, ..."); the year range
		// serializes as year_min/year_max.
		const queryString = serializeFiltersToQuery(filters, search?.value ?? '');
		const basePath = page.url.pathname;
		const targetUrl = `${basePath}${queryString ? `?${queryString}` : ''}${page.url.hash || ''}`;

		// Shallow replaceState, not goto(). goto() runs a full client-side
		// navigation for what is only a query-string edit: it re-runs the load
		// functions, and — because the route's `title` is re-rendered — makes
		// SvelteKit's #svelte-announcer speak the page title on every chip click,
		// so a screen-reader user narrowing by three tags heard "Publications |
		// Frédérick Madore" three times and the facet summary's own live region
		// never got a word in. replaceState edits the address bar and page.url
		// without a navigation, which is exactly the amount of work a filter
		// change is. Still replace and not push, so Back/Forward leaves the page
		// rather than stepping through filter states.
		// eslint-disable-next-line svelte/no-navigation-without-resolve -- targetUrl is built from page.url.pathname, which is already resolved
		if (browser) replaceState(targetUrl, page.state);
	});

	// --- Sync URL to filters ---
	// `page.url` is the ONLY tracked read here. Everything else is untracked on
	// purpose: this effect answers "the URL changed, catch the filters up", and
	// a version of it that also depended on the filters ran a second time on
	// every chip click and helpfully reset the state the click had just set.
	// (That was survivable while the writer used `goto()`, whose navigation
	// eventually pushed the new URL back through here; `replaceState` updates
	// the address bar and `page.state` but deliberately leaves `page.url` alone,
	// so nothing would have undone the undo.)
	$effect(() => {
		const searchParams = page.url.searchParams;
		untrack(() => syncFromUrl(searchParams));
	});

	function syncFromUrl(searchParams: URLSearchParams) {
		let filtersChanged = false;

		// Sync array filters: compare order-insensitively and update via the
		// dimension's setter only when the URL disagrees with current state.
		for (const [paramName, filterKey] of ARRAY_FILTER_PARAMS) {
			const setter = setters[ARRAY_FILTER_SETTERS[filterKey]];
			if (!setter) continue; // Skip if setter doesn't exist
			const valuesFromUrl = parseArrayFilterParam(searchParams, paramName);
			const currentValues = filters[filterKey];
			if (!arrayValuesEqual(valuesFromUrl, currentValues)) {
				setter(valuesFromUrl);
				filtersChanged = true;
			}
		}

		// Sync the free-text search
		if (search) {
			const termFromUrl = parseSearchParam(searchParams);
			if (termFromUrl !== search.value.trim()) {
				search.value = termFromUrl;
				filtersChanged = true;
			}
		}

		// Sync year range filter
		if (setters.setYearRange) {
			const newRange = parseYearRangeParams(
				searchParams.get('year_min'),
				searchParams.get('year_max')
			);
			if (!yearRangesEqual(newRange, filters.yearRange)) {
				setters.setYearRange(newRange);
				filtersChanged = true;
			}
		}

		if (filtersChanged) {
			lastFiltersString = stateSignature();
		}
		initialUrlApplied = true;
	}
};
