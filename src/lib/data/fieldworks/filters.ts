import { writable, derived } from 'svelte/store';
import type { Fieldwork } from '$lib/types';
import {
	createActiveFiltersStore,
	createToggleArrayFilter,
	// createSetArrayFilter, // Not currently needed for fieldworks
	createClearAllFilters,
	createDerivedCountStore
} from '$lib/utils/filterUtils'; // Import relevant utilities
// import { allFieldworks, fieldworksByYear, allCountries, allCities, allProjects } from './index';

// Store the promise for fieldwork data
let fieldworkDataPromise: Promise<{
	allFieldworks: Fieldwork[];
	fieldworksByYear: Record<number, Fieldwork[]>;
	allCountries: string[];
	allCities: string[];
	allProjects: string[];
}> | null = null;

// Function to load fieldwork data asynchronously
async function loadFieldworkData() {
	if (!fieldworkDataPromise) {
		fieldworkDataPromise = import('./index')
			.then((module) => ({
				allFieldworks: module.allFieldworks || [],
				fieldworksByYear: module.fieldworksByYear || {},
				allCountries: module.allCountries || [],
				allCities: module.allCities || [],
				allProjects: module.allProjects || []
			}))
			.catch((error) => {
				console.error('Error importing fieldworks index:', error);
				return {
					allFieldworks: [],
					fieldworksByYear: {},
					allCountries: [],
					allCities: [],
					allProjects: []
				};
			});
	}
	return fieldworkDataPromise;
}

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

// --- Available Filter Options Store (Async Loading) ---

// Initialize with empty arrays, populated async
export const filterOptions = writable({
	countries: [] as string[],
	cities: [] as string[],
	years: [] as number[],
	projects: [] as string[]
});

// Load options when the module is used
loadFieldworkData().then((data) => {
	filterOptions.set({
		countries: data.allCountries,
		cities: data.allCities,
		years: Object.keys(data.fieldworksByYear || {})
			.map(Number)
			.sort((a, b) => b - a),
		projects: data.allProjects
	});
});

// --- Filtered Fieldworks Derived Store (Async Handling) ---

// Create a writable store to hold the loaded fieldworks data
const allFieldworksStore = writable<Fieldwork[]>([]);
loadFieldworkData().then((data) => allFieldworksStore.set(data.allFieldworks || []));

// Derive filtered fieldworks based on active filters and the loaded data
export const filteredFieldworks = derived(
	[activeFilters, allFieldworksStore], // Depend on filters and loaded data
	([$activeFilters, $allFieldworks]) => {
		if (!$allFieldworks || $allFieldworks.length === 0) {
			return []; // Return empty if data not loaded yet
		}
		return $allFieldworks.filter((fieldwork) => {
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
	},
	[] as Fieldwork[] // Initial value
);

// --- Filter Control Functions ---

// Toggle Functions
export const toggleCountryFilter = createToggleArrayFilter(activeFilters, 'countries');
export const toggleCityFilter = createToggleArrayFilter(activeFilters, 'cities');
export const toggleYearFilter = createToggleArrayFilter(activeFilters, 'years');
export const toggleProjectFilter = createToggleArrayFilter(activeFilters, 'projects');

// Set Functions (if needed later for URL sync etc.)
// export const setCountries = createSetArrayFilter(activeFilters, 'countries');
// export const setCities = createSetArrayFilter(activeFilters, 'cities');
// export const setYears = createSetArrayFilter(activeFilters, 'years');
// export const setProjects = createSetArrayFilter(activeFilters, 'projects');

// Clear All Function
export const clearAllFilters = createClearAllFilters(activeFilters, initialFilters);

// --- Derived Count Stores ---
// These now correctly depend on the derived filteredFieldworks store

export const countryCounts = createDerivedCountStore(filteredFieldworks, (fw) => fw.country);
export const cityCounts = createDerivedCountStore(filteredFieldworks, (fw) => fw.city);
export const projectCounts = createDerivedCountStore(filteredFieldworks, (fw) => fw.project);

// Year counts might be less useful here as years are filters themselves, but could be added:
// export const yearCounts = createDerivedCountStore(filteredFieldworks, (fw) => String(fw.year));
