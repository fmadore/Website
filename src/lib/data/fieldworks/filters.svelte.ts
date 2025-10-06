/**
 * Fieldworks Filters - Svelte 5 Compatible Edition
 *
 * Exports proper Svelte stores that can be used with $ prefix in components.
 * Uses createActiveFiltersStore and other utilities to maintain reactivity.
 */

import type { Fieldwork } from '$lib/types';
import {
	createActiveFiltersStore,
	createToggleArrayFilter,
	createClearAllFilters,
	createDerivedCountStore
} from '$lib/utils/filterUtils';
import { derived, readable } from 'svelte/store';
// Use static import instead of dynamic to avoid build warnings
import { allFieldworks, fieldworksByYear, allCountries, allCities, allProjects } from './index';

// --- Active Filters Store ---

interface ActiveFieldworkFilters {
	countries: string[];
	cities: string[];
	years: number[]; // Fieldworks uses years array, not range
	projects: string[];
}

const initialFilters: ActiveFieldworkFilters = {
	countries: [],
	cities: [],
	years: [],
	projects: []
};

export const activeFilters = createActiveFiltersStore(initialFilters);

// --- Available Filter Options ---

export const filterOptions = readable({
	countries: allCountries,
	cities: allCities,
	years: Object.keys(fieldworksByYear)
		.map(Number)
		.sort((a, b) => b - a),
	projects: allProjects
});

// --- Filtered Fieldworks ---

export const filteredFieldworks = derived(activeFilters, ($activeFilters): Fieldwork[] => {
	return allFieldworks.filter((fieldwork: Fieldwork) => {
		// Country
		if (
			$activeFilters.countries.length > 0 &&
			!$activeFilters.countries.includes(fieldwork.country)
		) {
			return false;
		}
		// City
		if ($activeFilters.cities.length > 0 && !$activeFilters.cities.includes(fieldwork.city)) {
			return false;
		}
		// Year (array check)
		if ($activeFilters.years.length > 0 && !$activeFilters.years.includes(fieldwork.year)) {
			return false;
		}
		// Project
		if (
			$activeFilters.projects.length > 0 &&
			(!fieldwork.project || !$activeFilters.projects.includes(fieldwork.project))
		) {
			return false;
		}
		return true;
	});
});

// --- Filter Control Functions ---

// Toggle Functions
export const toggleCountryFilter = createToggleArrayFilter(activeFilters, 'countries');
export const toggleCityFilter = createToggleArrayFilter(activeFilters, 'cities');
export const toggleYearFilter = createToggleArrayFilter(activeFilters, 'years');
export const toggleProjectFilter = createToggleArrayFilter(activeFilters, 'projects');

// Clear All Function
export const clearAllFilters = createClearAllFilters(activeFilters, initialFilters);

// --- Derived Count Stores ---

export const countryCounts = createDerivedCountStore(
	filteredFieldworks,
	(fw: Fieldwork) => fw.country
);

export const cityCounts = createDerivedCountStore(filteredFieldworks, (fw: Fieldwork) => fw.city);

export const projectCounts = createDerivedCountStore(
	filteredFieldworks,
	(fw: Fieldwork) => fw.project
);
