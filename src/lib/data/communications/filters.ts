import { derived, writable } from 'svelte/store';
import type { Communication, YearRange } from '$lib/types';
import {
	createActiveFiltersStore,
	createToggleArrayFilter,
	createSetArrayFilter,
	createUpdateRangeFilter,
	createResetRangeFilter,
    createSetRangeFilter,
	createClearAllFilters,
	createDerivedCountStore
} from '$lib/utils/filterUtils'; // Import utilities

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

const safeAllCommunications = allCommunications || [];

// Extract unique values for filter options
const allCoAuthors = Array.from(new Set(
    safeAllCommunications.flatMap(comm => comm.authors || []) // Use authors field
))
.filter(author => author !== "Frédérick Madore") // Exclude primary author
.sort();

const allLanguages = Array.from(new Set(
    safeAllCommunications
        .filter((comm: Communication) => comm && comm.language)
        .flatMap((comm: Communication) => comm.language?.split(',').map(l => l.trim()) || []) // Handle multiple languages
)).sort();

const allCountries = Object.keys(communicationsByCountry || {}).sort();

const allProjects = Array.from(new Set(
    safeAllCommunications
        .filter((comm: Communication) => comm && comm.project)
        .map((comm: Communication) => comm.project as string)
)).sort();

// --- Active Filters Store ---

interface ActiveCommunicationFilters {
	types: string[];
	yearRange: YearRange | null;
	tags: string[];
	languages: string[];
	authors: string[];
	countries: string[];
	projects: string[];
}

const initialFilters: ActiveCommunicationFilters = {
	types: [],
	yearRange: null,
	tags: [],
	languages: [],
	authors: [],
	countries: [],
	projects: []
};

export const activeFilters = createActiveFiltersStore(initialFilters);

// --- Available Filter Options Store ---

export const filterOptions = writable({
	types: Object.keys(communicationsByType || {}).sort(),
	years: Object.keys(communicationsByYear || {}).map(Number).sort((a, b) => b - a),
	tags: allTags || [],
	languages: allLanguages,
	authors: allCoAuthors,
	countries: allCountries,
	projects: allProjects
});

// --- Filtered Communications Derived Store ---

export const filteredCommunications = derived(
	[activeFilters],
	([$activeFilters]) => {
		return safeAllCommunications.filter((comm: Communication) => {
			if (!comm) return false;

			// Type
			if ($activeFilters.types.length > 0 &&
				(!comm.type || !$activeFilters.types.includes(comm.type))) {
				return false;
			}

			// Year Range
			if ($activeFilters.yearRange &&
				(!comm.year || comm.year < $activeFilters.yearRange.min || comm.year > $activeFilters.yearRange.max)) {
				return false;
			}

			// Tags
			if ($activeFilters.tags.length > 0 &&
				(!comm.tags || !comm.tags.some((tag: string) => $activeFilters.tags.includes(tag)))) {
				return false;
			}

			// Language
			if ($activeFilters.languages.length > 0) {
                const commLanguages = comm.language ? comm.language.split(',').map(lang => lang.trim()) : [];
                if (!commLanguages.some(lang => $activeFilters.languages.includes(lang))) {
                    return false;
                }
            }

			// Co-author Filter (using 'authors' key in activeFilters)
            if ($activeFilters.authors.length > 0) {
                const authorsList = comm.authors || [];
                // Check if any of the communication's *authors* (excluding self) are in the active filter list
                if (!authorsList.some(authorName => authorName !== "Frédérick Madore" && $activeFilters.authors.includes(authorName))) {
                    return false;
                }
            }

			// Country
			if ($activeFilters.countries.length > 0 &&
				(!comm.country || !$activeFilters.countries.includes(comm.country))) {
				return false;
			}

			// Project
			if ($activeFilters.projects.length > 0 &&
				(!comm.project || !$activeFilters.projects.includes(comm.project))) {
				return false;
			}

			return true;
		});
	}
);

// --- Filter Control Functions ---

// Toggle Functions
export const toggleTypeFilter = createToggleArrayFilter(activeFilters, 'types');
export const toggleTagFilter = createToggleArrayFilter(activeFilters, 'tags');
export const toggleLanguageFilter = createToggleArrayFilter(activeFilters, 'languages');
export const toggleAuthorFilter = createToggleArrayFilter(activeFilters, 'authors');
export const toggleCountryFilter = createToggleArrayFilter(activeFilters, 'countries');
export const toggleProjectFilter = createToggleArrayFilter(activeFilters, 'projects');

// Year Range Functions
export const updateYearRange = createUpdateRangeFilter(activeFilters, 'yearRange');
export const resetYearRange = createResetRangeFilter(activeFilters, 'yearRange');

// Set Functions (for URL sync etc.)
export const setTypes = createSetArrayFilter(activeFilters, 'types');
export const setTags = createSetArrayFilter(activeFilters, 'tags');
export const setLanguages = createSetArrayFilter(activeFilters, 'languages');
export const setAuthors = createSetArrayFilter(activeFilters, 'authors');
export const setCountries = createSetArrayFilter(activeFilters, 'countries');
export const setProjects = createSetArrayFilter(activeFilters, 'projects');
export const setYearRange = createSetRangeFilter(updateYearRange, resetYearRange);

// Clear All Function
export const clearAllFilters = createClearAllFilters(activeFilters, initialFilters);

// --- Derived Count Stores ---

export const tagCounts = createDerivedCountStore(filteredCommunications, (comm) => comm.tags);
export const countryCounts = createDerivedCountStore(filteredCommunications, (comm) => comm.country);
export const projectCounts = createDerivedCountStore(filteredCommunications, (comm) => comm.project);
export const languageCounts = createDerivedCountStore(filteredCommunications, (comm) => comm.language?.split(',').map(l => l.trim()));

// Count store for co-authors (based on authors field, excluding self)
export const authorCounts = derived(
    [filteredCommunications],
    ([$filteredCommunications]) => {
        const counts: Record<string, number> = {};
        ($filteredCommunications || []).forEach((comm: Communication) => {
            if (comm.authors) {
                comm.authors.forEach(authorName => {
                    // Only count actual co-authors, not the site owner
                    if (authorName !== "Frédérick Madore") {
                       counts[authorName] = (counts[authorName] || 0) + 1;
                    }
                });
            }
        });
        return counts;
    }
);

// Note: Type counts might not be needed here if types are static, but could be added if necessary.
// export const typeCounts = createDerivedCountStore(filteredCommunications, (comm) => comm.type); 