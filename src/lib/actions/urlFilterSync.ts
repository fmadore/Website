import { page } from '$app/stores';
import { goto } from '$app/navigation';
import type { Writable } from 'svelte/store';
import { get } from 'svelte/store'; // To read store value once

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
	filtersStore: Writable<ActiveFilters>;
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
 * Svelte Action to synchronize filter state (from a writable store)
 * with URL query parameters.
 *
 * It listens to changes in the filtersStore and updates the URL.
 * It also listens to changes in the URL (page store) and updates the filtersStore
 * using the provided setter functions.
 */
export function urlFilterSync(node: HTMLElement, params: UrlFilterSyncParams) {
	const { filtersStore, setters } = params;
	let initialUrlApplied = false; // Flag to prevent infinite loops on initial load
	let lastFiltersString = ''; // Store the last state stringified

	// --- Update URL from Filter Store ---
	const unsubscribeFilters = filtersStore.subscribe(($filters) => {
		const currentFiltersString = JSON.stringify($filters); // Simple way to check for changes
		if (!initialUrlApplied || currentFiltersString === lastFiltersString) {
			// Avoid updating URL based on the initial store state before URL is parsed
			// or if the filters haven't actually changed
			return;
		}
		lastFiltersString = currentFiltersString;

		const params = new URLSearchParams();

		// Add array filters to URL (only if they have values)
		if ($filters.types?.length) params.set('type', $filters.types.join(','));
		if ($filters.tags?.length) params.set('tag', $filters.tags.join(','));
		if ($filters.languages?.length) params.set('language', $filters.languages.join(','));
		if ($filters.authors?.length) params.set('author', $filters.authors.join(','));
		if ($filters.countries?.length) params.set('country', $filters.countries.join(','));
		if ($filters.projects?.length) params.set('project', $filters.projects.join(','));

		// Add year range filter
		if ($filters.yearRange) {
			params.set('year_min', $filters.yearRange.min.toString());
			params.set('year_max', $filters.yearRange.max.toString());
		}

		const queryString = params.toString();
		const currentPath = get(page).url.pathname; // Use get() for one-time read inside subscribe
		const targetUrl = queryString ? `${currentPath}?${queryString}` : currentPath;

		// Use replaceState to avoid cluttering browser history
		goto(targetUrl, { replaceState: true, keepFocus: true, noScroll: true });
	});

	// --- Update Filter Store from URL ---
	const unsubscribePage = page.subscribe(($page) => {
		const searchParams = $page.url.searchParams;
		const currentFilters = get(filtersStore); // Get current filters state
		let filtersChanged = false;

		// Helper to compare arrays and update if needed
		const syncArrayFilter = (
			key: ArrayFilterKey,
			paramName: string,
			currentValues: string[] | undefined
		) => {
			const setter = setters[key];
			if (!setter) return; // Skip if setter doesn't exist
			const valuesFromUrl = searchParams.get(paramName)?.split(',').filter(Boolean) || []; // Filter out empty strings
			if (JSON.stringify(valuesFromUrl.sort()) !== JSON.stringify((currentValues || []).sort())) {
				// Sort for comparison
				setter(valuesFromUrl);
				filtersChanged = true;
			}
		};

		// Sync array filters
		if (setters.setTypes) syncArrayFilter('setTypes', 'type', currentFilters.types);
		if (setters.setTags) syncArrayFilter('setTags', 'tag', currentFilters.tags);
		if (setters.setLanguages) syncArrayFilter('setLanguages', 'language', currentFilters.languages);
		if (setters.setAuthors) syncArrayFilter('setAuthors', 'author', currentFilters.authors);
		if (setters.setCountries) syncArrayFilter('setCountries', 'country', currentFilters.countries);
		if (setters.setProjects) syncArrayFilter('setProjects', 'project', currentFilters.projects);

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
			if (JSON.stringify(newRange) !== JSON.stringify(currentFilters.yearRange || null)) {
				setters.setYearRange(newRange);
				filtersChanged = true;
			}
		}

		if (filtersChanged) {
			lastFiltersString = JSON.stringify(get(filtersStore)); // Update last known state after URL sync
		}
		initialUrlApplied = true; // Mark URL as processed
	});

	return {
		destroy() {
			unsubscribeFilters();
			unsubscribePage();
		}
	};
}
