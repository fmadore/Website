import { writable, derived } from 'svelte/store';
import type { Communication } from '$lib/types/communication';
import { allCommunications, communicationsByType, communicationsByYear, allTags, communicationsByCountry } from './index';

// Create a store for active filters
export const activeFilters = writable({
    types: [] as string[],
    years: [] as number[],
    tags: [] as string[],
    languages: [] as string[],
    countries: [] as string[]
});

// Extract all unique languages from communications
export const allLanguages = Array.from(new Set(
    allCommunications
        .filter(comm => comm.language)
        .map(comm => comm.language as string)
)).sort();

// Extract all unique countries
export const allCountries = Object.keys(communicationsByCountry).sort();

// Create a store for available filter options
export const filterOptions = writable({
    types: Object.keys(communicationsByType).sort(),
    years: Object.keys(communicationsByYear).map(Number).sort((a, b) => b - a),
    tags: allTags,
    languages: allLanguages,
    countries: allCountries
});

// A derived store that filters communications based on active filters
export const filteredCommunications = derived(
    [activeFilters],
    ([$activeFilters]) => {
        return allCommunications.filter(comm => {
            // Filter by communication type
            if ($activeFilters.types.length > 0 && 
                (!comm.type || !$activeFilters.types.includes(comm.type))) {
                return false;
            }
            
            // Filter by year
            if ($activeFilters.years.length > 0 && !$activeFilters.years.includes(comm.year)) {
                return false;
            }
            
            // Filter by tags (if communication has at least one of the selected tags)
            if ($activeFilters.tags.length > 0 && 
                (!comm.tags || !comm.tags.some(tag => $activeFilters.tags.includes(tag)))) {
                return false;
            }
            
            // Filter by language
            if ($activeFilters.languages.length > 0 && 
                (!comm.language || !$activeFilters.languages.includes(comm.language))) {
                return false;
            }
            
            // Filter by country
            if ($activeFilters.countries.length > 0 && 
                (!comm.country || !$activeFilters.countries.includes(comm.country))) {
                return false;
            }
            
            return true;
        });
    }
);

// Functions to toggle filters
export function toggleTypeFilter(type: string) {
    activeFilters.update(filters => {
        if (filters.types.includes(type)) {
            return { ...filters, types: filters.types.filter(t => t !== type) };
        } else {
            return { ...filters, types: [...filters.types, type] };
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

export function toggleTagFilter(tag: string) {
    activeFilters.update(filters => {
        if (filters.tags.includes(tag)) {
            return { ...filters, tags: filters.tags.filter(t => t !== tag) };
        } else {
            return { ...filters, tags: [...filters.tags, tag] };
        }
    });
}

export function toggleLanguageFilter(language: string) {
    activeFilters.update(filters => {
        if (filters.languages.includes(language)) {
            return { ...filters, languages: filters.languages.filter(l => l !== language) };
        } else {
            return { ...filters, languages: [...filters.languages, language] };
        }
    });
}

export function toggleCountryFilter(country: string) {
    activeFilters.update(filters => {
        if (filters.countries.includes(country)) {
            return { ...filters, countries: filters.countries.filter(c => c !== country) };
        } else {
            return { ...filters, countries: [...filters.countries, country] };
        }
    });
}

// Function to clear all filters
export function clearAllFilters() {
    activeFilters.set({
        types: [],
        years: [],
        tags: [],
        languages: [],
        countries: []
    });
}

// Get available tag counts for current filtered communications
export const tagCounts = derived(
    [filteredCommunications],
    ([$filteredCommunications]) => {
        const counts: Record<string, number> = {};
        $filteredCommunications.forEach(comm => {
            if (comm.tags) {
                comm.tags.forEach(tag => {
                    counts[tag] = (counts[tag] || 0) + 1;
                });
            }
        });
        return counts;
    }
);

// Get available country counts for current filtered communications
export const countryCounts = derived(
    [filteredCommunications],
    ([$filteredCommunications]) => {
        const counts: Record<string, number> = {};
        $filteredCommunications.forEach(comm => {
            if (comm.country) {
                counts[comm.country] = (counts[comm.country] || 0) + 1;
            }
        });
        return counts;
    }
); 