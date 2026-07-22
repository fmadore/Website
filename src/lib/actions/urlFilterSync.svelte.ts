import { page } from '$app/state';
import { goto } from '$app/navigation';
import type { Action } from 'svelte/action';
import {
	ARRAY_FILTER_PARAMS,
	serializeFiltersToQuery,
	parseArrayFilterParam,
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

interface UrlFilterSyncParams {
	/** Reactive filters object (using $state runes) */
	filters: ActiveFilters;
	/** Setter functions for each filter category */
	setters: FilterSetters;
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
	const { filters, setters } = params;
	let initialUrlApplied = false;
	let lastFiltersString = '';

	// --- Sync filters to URL ---
	$effect(() => {
		const currentFiltersString = JSON.stringify(filters);

		// Skip initial run until URL has been applied
		if (!initialUrlApplied || currentFiltersString === lastFiltersString) {
			return;
		}

		lastFiltersString = currentFiltersString;

		// Array filters use one entry per value so individual values can safely
		// contain commas (e.g. project names like "Islam's 'Peripheries':
		// Digital Humanities, Algorithmic Analysis, ..."); the year range
		// serializes as year_min/year_max.
		const queryString = serializeFiltersToQuery(filters);
		const basePath = page.url.pathname;
		const targetUrl = `${basePath}${queryString ? `?${queryString}` : ''}${page.url.hash || ''}`;

		// Deliberate trade-off: replaceState keeps filter tweaks out of browser
		// history, so Back/Forward leaves the page rather than stepping through
		// filter states. Switch to pushState if history-per-filter is wanted.
		// eslint-disable-next-line svelte/no-navigation-without-resolve -- targetUrl built from page.url.pathname which is already resolved
		goto(targetUrl, { replaceState: true, keepFocus: true, noScroll: true });
	});

	// --- Sync URL to filters ---
	$effect(() => {
		const searchParams = page.url.searchParams;
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
			lastFiltersString = JSON.stringify(filters);
		}
		initialUrlApplied = true;
	});
};
