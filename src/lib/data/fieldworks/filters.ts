import { writable, derived } from 'svelte/store';
import type { Fieldwork } from '$lib/types';
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
        fieldworkDataPromise = import('./index').then(module => ({
            allFieldworks: module.allFieldworks || [],
            fieldworksByYear: module.fieldworksByYear || {},
            allCountries: module.allCountries || [],
            allCities: module.allCities || [],
            allProjects: module.allProjects || []
        })).catch(error => {
            console.error("Error importing fieldworks index:", error);
            // Return default empty structures on error
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

// Create a store for active filters
export const activeFilters = writable({
    countries: [] as string[],
    cities: [] as string[],
    years: [] as number[],
    projects: [] as string[]
});

// Create a store for available filter options, loaded asynchronously
export const filterOptions = writable({
    countries: [] as string[],
    cities: [] as string[],
    years: [] as number[],
    projects: [] as string[]
});

// Load options when the module is loaded
loadFieldworkData().then(data => {
    filterOptions.set({
        countries: data.allCountries,
        cities: data.allCities,
        years: Object.keys(data.fieldworksByYear || {}).map(Number).sort((a, b) => b - a),
        projects: data.allProjects
    });
});

// A derived store that filters fieldworks based on active filters
export const filteredFieldworks = derived(
    [activeFilters, filterOptions], // Depend on filterOptions to ensure data is loaded
    ([$activeFilters, $filterOptions], set) => {
        loadFieldworkData().then(data => {
            const filtered = (data.allFieldworks || []).filter(fieldwork => {
                // Filter by country
                if ($activeFilters.countries.length > 0 &&
                    !$activeFilters.countries.includes(fieldwork.country)) {
                    return false;
                }
                // Filter by city
                if ($activeFilters.cities.length > 0 &&
                    !$activeFilters.cities.includes(fieldwork.city)) {
                    return false;
                }
                // Filter by year
                if ($activeFilters.years.length > 0 &&
                    !$activeFilters.years.includes(fieldwork.year)) {
                    return false;
                }
                // Filter by project
                if ($activeFilters.projects.length > 0 &&
                    (!fieldwork.project || !$activeFilters.projects.includes(fieldwork.project))) {
                    return false;
                }
                return true;
            });
            set(filtered); // Set the derived store value once data is loaded and filtered
        });

        // Optionally, return a cleanup function if needed
        // return () => { /* cleanup logic */ };
    },
    [] as Fieldwork[] // Initial value for the derived store
);

// Functions to toggle filters
export function toggleCountryFilter(country: string) {
    activeFilters.update(filters => {
        if (filters.countries.includes(country)) {
            return { ...filters, countries: filters.countries.filter(c => c !== country) };
        } else {
            return { ...filters, countries: [...filters.countries, country] };
        }
    });
}

export function toggleCityFilter(city: string) {
    activeFilters.update(filters => {
        if (filters.cities.includes(city)) {
            return { ...filters, cities: filters.cities.filter(c => c !== city) };
        } else {
            return { ...filters, cities: [...filters.cities, city] };
        }
    });
}

export function toggleYearFilter(year: number) {
    activeFilters.update(filters => {
        if (filters.years.includes(year)) {
            return { ...filters, years: filters.years.filter(y => y !== year) };
        } else {
            return { ...filters, years: [...filters.years, year] };
        }
    });
}

export function toggleProjectFilter(project: string) {
    activeFilters.update(filters => {
        if (filters.projects.includes(project)) {
            return { ...filters, projects: filters.projects.filter(p => p !== project) };
        } else {
            return { ...filters, projects: [...filters.projects, project] };
        }
    });
}

// Function to clear all filters
export function clearAllFilters() {
    activeFilters.set({
        countries: [],
        cities: [],
        years: [],
        projects: []
    });
}

// Get available country counts for current filtered fieldworks
export const countryCounts = derived(
    [filteredFieldworks],
    ([$filteredFieldworks]) => {
        const counts: Record<string, number> = {};
        // Ensure $filteredFieldworks is an array before iterating
        if (Array.isArray($filteredFieldworks)) {
            $filteredFieldworks.forEach(fieldwork => {
                counts[fieldwork.country] = (counts[fieldwork.country] || 0) + 1;
            });
        }
        return counts;
    }
);

// Get available city counts for current filtered fieldworks
export const cityCounts = derived(
    [filteredFieldworks],
    ([$filteredFieldworks]) => {
        const counts: Record<string, number> = {};
        // Ensure $filteredFieldworks is an array before iterating
        if (Array.isArray($filteredFieldworks)) {
            $filteredFieldworks.forEach(fieldwork => {
                counts[fieldwork.city] = (counts[fieldwork.city] || 0) + 1;
            });
        }
        return counts;
    }
);

// Get available project counts for current filtered fieldworks
export const projectCounts = derived(
    [filteredFieldworks],
    ([$filteredFieldworks]) => {
        const counts: Record<string, number> = {};
         // Ensure $filteredFieldworks is an array before iterating
        if (Array.isArray($filteredFieldworks)) {
            $filteredFieldworks.forEach(fieldwork => {
                if (fieldwork.project) {
                    counts[fieldwork.project] = (counts[fieldwork.project] || 0) + 1;
                }
            });
        }
        return counts;
    }
); 