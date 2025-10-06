import { page } from '$app/state';
import { goto } from '$app/navigation';
import type { Action } from 'svelte/action';

interface ActiveFilters {
	types?: string[];
	tags?: string[];
	languages?: string[];
	authors?: string[];
	countries?: string[];
	projects?: string[];
	yearRange?: { min: number; max: number } | null;
	// Add other filter categories as needed
}

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

// Define a type for keys corresponding to array filters
type ArrayFilterKey =
	| 'setTypes'
	| 'setTags'
	| 'setLanguages'
	| 'setAuthors'
	| 'setCountries'
	| 'setProjects';

/**
 * Svelte Action to synchronize filter state with URL query parameters.
 * Modernized for Svelte 5 using $effect() and $app/state.
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

		const urlParams = new URLSearchParams();

		// Add array filters to URL (only if they have values)
		if (filters.types?.length) urlParams.set('type', filters.types.join(','));
		if (filters.tags?.length) urlParams.set('tag', filters.tags.join(','));
		if (filters.languages?.length) urlParams.set('language', filters.languages.join(','));
		if (filters.authors?.length) urlParams.set('author', filters.authors.join(','));
		if (filters.countries?.length) urlParams.set('country', filters.countries.join(','));
		if (filters.projects?.length) urlParams.set('project', filters.projects.join(','));

		// Add year range filter
		if (filters.yearRange) {
			urlParams.set('year_min', filters.yearRange.min.toString());
			urlParams.set('year_max', filters.yearRange.max.toString());
		}

		const queryString = urlParams.toString();
		const url = new URL(page.url.href);
		url.search = queryString;

		// Use replaceState to avoid cluttering browser history
		goto(url, { replaceState: true, keepFocus: true, noScroll: true });
	});

	// --- Sync URL to filters ---
	$effect(() => {
		const searchParams = page.url.searchParams;
		let filtersChanged = false;

		// Helper to compare arrays and update if needed
		const syncArrayFilter = (
			key: ArrayFilterKey,
			paramName: string,
			currentValues: string[] | undefined
		) => {
			const setter = setters[key];
			if (!setter) return; // Skip if setter doesn't exist
			const valuesFromUrl = searchParams.get(paramName)?.split(',').filter(Boolean) || [];
			if (JSON.stringify(valuesFromUrl.sort()) !== JSON.stringify((currentValues || []).sort())) {
				setter(valuesFromUrl);
				filtersChanged = true;
			}
		};

		// Sync array filters
		if (setters.setTypes) syncArrayFilter('setTypes', 'type', filters.types);
		if (setters.setTags) syncArrayFilter('setTags', 'tag', filters.tags);
		if (setters.setLanguages) syncArrayFilter('setLanguages', 'language', filters.languages);
		if (setters.setAuthors) syncArrayFilter('setAuthors', 'author', filters.authors);
		if (setters.setCountries) syncArrayFilter('setCountries', 'country', filters.countries);
		if (setters.setProjects) syncArrayFilter('setProjects', 'project', filters.projects);

		// Sync year range filter
		if (setters.setYearRange) {
			const yearMinStr = searchParams.get('year_min');
			const yearMaxStr = searchParams.get('year_max');
			let newRange: { min: number; max: number } | null = null;
			if (yearMinStr && yearMaxStr) {
				const min = parseInt(yearMinStr, 10);
				const max = parseInt(yearMaxStr, 10);
				if (!isNaN(min) && !isNaN(max)) {
					newRange = { min, max };
				}
			}
			if (JSON.stringify(newRange) !== JSON.stringify(filters.yearRange || null)) {
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
