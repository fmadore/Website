import { writable, derived } from 'svelte/store';
import type { Fieldwork } from '$lib/types';
// import { allFieldworks, fieldworksByYear, allCountries, allCities, allProjects } from './index';

// Import safely handling any errors
let allFieldworks: Fieldwork[] = [];
let fieldworksByYear: Record<number, Fieldwork[]> = {};
let allCountries: string[] = [];
let allCities: string[] = [];
let allProjects: string[] = [];

try {
    // Use a dynamic import or ensure index is fully loaded.
    // For simplicity with eager glob, let's assume index exports are available
    // but might be undefined initially during SSR runs.
    const fieldworkIndex = await import('./index');
    allFieldworks = fieldworkIndex.allFieldworks || [];
    fieldworksByYear = fieldworkIndex.fieldworksByYear || {};
    allCountries = fieldworkIndex.allCountries || [];
    allCities = fieldworkIndex.allCities || [];
    allProjects = fieldworkIndex.allProjects || [];
} catch (error) {
    console.error("Error importing fieldworks index:", error);
    // Keep defaults if import fails
}

// Create a store for active filters
export const activeFilters = writable({
    countries: [] as string[],
    cities: [] as string[],
    years: [] as number[],
    projects: [] as string[]
});

// Create a store for available filter options (use safely imported data)
export const filterOptions = writable({
    countries: allCountries, // Use safe variable
    cities: allCities,       // Use safe variable
    years: Object.keys(fieldworksByYear || {}).map(Number).sort((a, b) => b - a), // Add safety check
    projects: allProjects    // Use safe variable
});

// A derived store that filters fieldworks based on active filters
export const filteredFieldworks = derived(
    [activeFilters],
    ([$activeFilters]) => {
        // Ensure allFieldworks is used safely
        const safeAllFieldworks = allFieldworks || [];
        return safeAllFieldworks.filter(fieldwork => {
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
    }
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
        $filteredFieldworks.forEach(fieldwork => {
            counts[fieldwork.country] = (counts[fieldwork.country] || 0) + 1;
        });
        return counts;
    }
);

// Get available city counts for current filtered fieldworks
export const cityCounts = derived(
    [filteredFieldworks],
    ([$filteredFieldworks]) => {
        const counts: Record<string, number> = {};
        $filteredFieldworks.forEach(fieldwork => {
            counts[fieldwork.city] = (counts[fieldwork.city] || 0) + 1;
        });
        return counts;
    }
);

// Get available project counts for current filtered fieldworks
export const projectCounts = derived(
    [filteredFieldworks],
    ([$filteredFieldworks]) => {
        const counts: Record<string, number> = {};
        $filteredFieldworks.forEach(fieldwork => {
            if (fieldwork.project) {
                counts[fieldwork.project] = (counts[fieldwork.project] || 0) + 1;
            }
        });
        return counts;
    }
); 