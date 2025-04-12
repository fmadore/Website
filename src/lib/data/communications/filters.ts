import { writable, derived } from 'svelte/store';
import type { Communication } from '$lib/types/communication';

// Import safely handling any errors
let allCommunications: Communication[] = [];
let communicationsByType: Record<string, Communication[]> = {};
let communicationsByYear: Record<number, Communication[]> = {};
let allTags: string[] = [];
let communicationsByCountry: Record<string, Communication[]> = {};

try {
    const commModule = import.meta.glob<Record<string, any>>('./index.ts', { eager: true });
    const indexModule = Object.values(commModule)[0];
    if (indexModule) {
        allCommunications = indexModule.allCommunications || [];
        communicationsByType = indexModule.communicationsByType || {};
        communicationsByYear = indexModule.communicationsByYear || {};
        allTags = indexModule.allTags || [];
        communicationsByCountry = indexModule.communicationsByCountry || {};
    }
} catch (error) {
    console.error('Error importing communications module:', error);
}

// Define type for year range
type YearRange = { min: number; max: number };

// Create a store for active filters
export const activeFilters = writable({
    types: [] as string[],
    yearRange: null as YearRange | null,
    tags: [] as string[],
    languages: [] as string[],
    authors: [] as string[],
    countries: [] as string[],
    projects: [] as string[]
});

// Ensure allCommunications is defined
const safeAllCommunications = allCommunications || [];

// Extract all unique co-authors/participants, excluding "Frédérick Madore"
export const allCoAuthors = Array.from(new Set(
    safeAllCommunications.flatMap(comm => [
        ...(comm.authors || []),
        ...(comm.coAuthors || []),
        ...(comm.papers?.flatMap(p => p.authors?.map(a => a.name) || []) || []),
        ...(comm.participants?.map(p => p.name) || [])
    ])
))
.filter(author => author !== "Frédérick Madore") // Exclude primary author
.sort();

// Extract all unique languages from communications (safely)
export const allLanguages = Array.from(new Set(
    safeAllCommunications
        .filter((comm: Communication) => comm && comm.language)
        .map((comm: Communication) => comm.language as string)
)).sort();

// Extract all unique countries (safely)
export const allCountries = Object.keys(communicationsByCountry || {}).sort();

// Extract all unique projects (safely)
export const allProjects = Array.from(new Set(
    safeAllCommunications
        .filter((comm: Communication) => comm && comm.project)
        .map((comm: Communication) => comm.project as string)
)).sort();

// Create a store for available filter options
export const filterOptions = writable({
    types: Object.keys(communicationsByType || {}).sort(),
    years: Object.keys(communicationsByYear || {}).map(Number).sort((a, b) => b - a),
    tags: allTags || [],
    languages: allLanguages,
    authors: allCoAuthors,
    countries: allCountries,
    projects: allProjects
});

// A derived store that filters communications based on active filters
export const filteredCommunications = derived(
    [activeFilters],
    ([$activeFilters]) => {
        return safeAllCommunications.filter((comm: Communication) => {
            if (!comm) return false;
            
            // Filter by communication type
            if ($activeFilters.types.length > 0 && 
                (!comm.type || !$activeFilters.types.includes(comm.type))) {
                return false;
            }
            
            // Filter by year range
            if ($activeFilters.yearRange && 
                (!comm.year || comm.year < $activeFilters.yearRange.min || comm.year > $activeFilters.yearRange.max)) {
                return false;
            }
            
            // Filter by tags
            if ($activeFilters.tags.length > 0 && 
                (!comm.tags || !comm.tags.some((tag: string) => $activeFilters.tags.includes(tag)))) {
                return false;
            }
            
            // Filter by language
            if ($activeFilters.languages.length > 0 && 
                (!comm.language || !$activeFilters.languages.includes(comm.language))) {
                return false;
            }
            
            // Filter by author
            if ($activeFilters.authors.length > 0) {
                const communicationAuthors = [
                    ...(comm.authors || []),
                    ...(comm.coAuthors || []),
                    ...(comm.papers?.flatMap(p => p.authors?.map(a => a.name) || []) || []),
                    ...(comm.participants?.map(p => p.name) || [])
                ];
                if (!communicationAuthors.some(authorName => $activeFilters.authors.includes(authorName))) {
                    return false;
                }
            }
            
            // Filter by country
            if ($activeFilters.countries.length > 0 && 
                (!comm.country || !$activeFilters.countries.includes(comm.country))) {
                return false;
            }
            
            // Filter by project
            if ($activeFilters.projects.length > 0 && 
                (!comm.project || !$activeFilters.projects.includes(comm.project))) {
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

// Add function to update year range
export function updateYearRange(min: number, max: number) {
    activeFilters.update(filters => ({ ...filters, yearRange: { min, max } }));
}

// Reset year range filter
export function resetYearRange() {
    activeFilters.update(filters => ({ ...filters, yearRange: null }));
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

export function toggleProjectFilter(project: string) {
    activeFilters.update(filters => {
        if (filters.projects.includes(project)) {
            return { ...filters, projects: filters.projects.filter(p => p !== project) };
        } else {
            return { ...filters, projects: [...filters.projects, project] };
        }
    });
}

// Add function to toggle author filter
export function toggleAuthorFilter(author: string) {
    activeFilters.update(filters => {
        if (filters.authors.includes(author)) {
            return { ...filters, authors: filters.authors.filter(a => a !== author) };
        } else {
            return { ...filters, authors: [...filters.authors, author] };
        }
    });
}

// Function to clear all filters
export function clearAllFilters() {
    activeFilters.set({
        types: [],
        yearRange: null,
        tags: [],
        languages: [],
        authors: [],
        countries: [],
        projects: []
    });
}

// Get available tag counts for current filtered communications
export const tagCounts = derived(
    [filteredCommunications],
    ([$filteredCommunications]) => {
        const counts: Record<string, number> = {};
        ($filteredCommunications || []).forEach((comm: Communication) => {
            if (comm && comm.tags) {
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
        ($filteredCommunications || []).forEach((comm: Communication) => {
            if (comm && comm.country) {
                counts[comm.country] = (counts[comm.country] || 0) + 1;
            }
        });
        return counts;
    }
);

// Get available author counts for current filtered communications
export const authorCounts = derived(
    [filteredCommunications],
    ([$filteredCommunications]) => {
        const counts: Record<string, number> = {};
        ($filteredCommunications || []).forEach((comm: Communication) => {
            const communicationAuthors = new Set([
                ...(comm.authors || []),
                ...(comm.coAuthors || []),
                ...(comm.papers?.flatMap(p => p.authors?.map(a => a.name) || []) || []),
                ...(comm.participants?.map(p => p.name) || [])
            ]);
            communicationAuthors.forEach(authorName => {
                 // Only count co-authors, not the site owner
                 if (authorName !== "Frédérick Madore") {
                    counts[authorName] = (counts[authorName] || 0) + 1;
                 }
            });
        });
        return counts;
    }
);

// Get available project counts for current filtered communications
export const projectCounts = derived(
    [filteredCommunications],
    ([$filteredCommunications]) => {
        const counts: Record<string, number> = {};
        ($filteredCommunications || []).forEach((comm: Communication) => {
            if (comm && comm.project) {
                counts[comm.project] = (counts[comm.project] || 0) + 1;
            }
        });
        return counts;
    }
);

// Functions to set filters directly (needed for URL sync)
export function setTypes(types: string[]) {
    activeFilters.update(filters => ({ ...filters, types }));
}

export function setTags(tags: string[]) {
    activeFilters.update(filters => ({ ...filters, tags }));
}

export function setLanguages(languages: string[]) {
    activeFilters.update(filters => ({ ...filters, languages }));
}

export function setAuthors(authors: string[]) {
    activeFilters.update(filters => ({ ...filters, authors }));
}

export function setCountries(countries: string[]) {
    activeFilters.update(filters => ({ ...filters, countries }));
}

export function setProjects(projects: string[]) {
    activeFilters.update(filters => ({ ...filters, projects }));
}

// Set year range (uses existing update/reset functions)
export function setYearRange(range: YearRange | null) {
    if (range) {
        updateYearRange(range.min, range.max);
    } else {
        resetYearRange();
    }
}

// Get available language counts for current filtered communications
export const languageCounts = derived(
    [filteredCommunications],
    ([$filteredCommunications]) => {
        const counts: Record<string, number> = {};
        ($filteredCommunications || []).forEach((comm: Communication) => {
            if (comm && comm.language) {
                // Handle potential multiple languages if comma-separated
                const langs = comm.language.split(',').map(l => l.trim());
                langs.forEach(lang => {
                    counts[lang] = (counts[lang] || 0) + 1;
                });
            }
        });
        return counts;
    }
); 