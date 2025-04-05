import { writable, derived } from 'svelte/store';
import type { Publication } from '$lib/types';
import { allPublications, publicationsByType, publicationsByYear, allTags, allLanguages } from './index';

// Helper function to extract editors from a publication
function extractEditors(publication: Publication): string[] {
    if (!publication.editors) return [];
    
    // Handle string format (e.g., "Editor1, Editor2" or "Editor1 and Editor2")
    if (typeof publication.editors === 'string') {
        return publication.editors.split(/\s*(?:,|and)\s*/).map(name => name.trim());
    }
    
    // Handle array format
    if (Array.isArray(publication.editors)) {
        return publication.editors;
    }
    
    return [];
}

// Extract all unique co-authors from publications, excluding "Frédérick Madore"
export const allAuthors = Array.from(new Set([
    // Get authors from publications
    ...allPublications.flatMap(pub => pub.authors || []),
    // Get editors from publications, excluding chapters and encyclopedia entries
    ...allPublications.filter(pub => pub.type !== 'chapter' && pub.type !== 'encyclopedia').flatMap(pub => extractEditors(pub)),
    // Get preface authors
    ...allPublications.filter(pub => pub.prefacedBy).map(pub => pub.prefacedBy as string)
]))
.filter(author => author !== "Frédérick Madore")
.sort();

// Extract all unique countries from publications
export const allCountries = Array.from(new Set(
    allPublications.flatMap(pub => pub.country || [])
)).sort();

// Extract all unique projects from publications
export const allProjects = Array.from(new Set(
    allPublications.map(pub => pub.project).filter(Boolean) as string[]
)).sort();

// Define type for year range
type YearRange = { min: number; max: number };

// Create a store for active filters
export const activeFilters = writable({
    types: [] as string[],
    // Replace years array with yearRange object
    yearRange: null as YearRange | null,
    tags: [] as string[],
    languages: [] as string[],
    authors: [] as string[],
    countries: [] as string[],
    projects: [] as string[]
});

// Create a store for available filter options (automatically derived from publications)
export const filterOptions = writable({
    types: Object.keys(publicationsByType).sort(),
    // Years remain the same here, representing all available options
    years: Object.keys(publicationsByYear).map(Number).sort((a, b) => b - a),
    tags: allTags,
    languages: allLanguages,
    authors: allAuthors,
    countries: allCountries,
    projects: allProjects
});

// A derived store that filters publications based on active filters
export const filteredPublications = derived(
    [activeFilters],
    ([$activeFilters]) => {
        return allPublications.filter(pub => {
            // Filter by publication type
            if ($activeFilters.types.length > 0 && !$activeFilters.types.includes(pub.type)) {
                return false;
            }
            
            // Filter by year range
            if ($activeFilters.yearRange && 
                (pub.year < $activeFilters.yearRange.min || pub.year > $activeFilters.yearRange.max)) {
                return false;
            }
            
            // Filter by tags (if publication has at least one of the selected tags)
            if ($activeFilters.tags.length > 0 && 
                (!pub.tags || !pub.tags.some(tag => $activeFilters.tags.includes(tag)))) {
                return false;
            }
            
            // Filter by language
            if ($activeFilters.languages.length > 0) {
                // Split comma-separated language values
                const pubLanguages = pub.language ? pub.language.split(',').map(lang => lang.trim()) : [];
                if (!pubLanguages.some(lang => $activeFilters.languages.includes(lang))) {
                    return false;
                }
            }
            
            // Filter by author (if publication has at least one of the selected authors)
            if ($activeFilters.authors.length > 0) {
                // Check authors array
                const hasMatchingAuthor = pub.authors && 
                    pub.authors.some(author => $activeFilters.authors.includes(author));
                
                // Check editors, but only if the publication type is not chapter or encyclopedia
                const isExcludedType = pub.type === 'chapter' || pub.type === 'encyclopedia';
                const hasMatchingEditor = !isExcludedType && pub.editors && (
                    (typeof pub.editors === 'string' && 
                        pub.editors.split(/\s*(?:,|and)\s*/)
                            .map(name => name.trim())
                            .some(editor => $activeFilters.authors.includes(editor))) ||
                    (Array.isArray(pub.editors) && 
                        pub.editors.some(editor => $activeFilters.authors.includes(editor)))
                );
                
                // Check preface author
                const hasMatchingPrefaceAuthor = pub.prefacedBy && 
                    $activeFilters.authors.includes(pub.prefacedBy);
                
                // If neither authors, valid editors, nor preface author match, filter out this publication
                if (!hasMatchingAuthor && !hasMatchingEditor && !hasMatchingPrefaceAuthor) {
                    return false;
                }
            }
            
            // Filter by country
            if ($activeFilters.countries.length > 0 && 
                (!pub.country || !pub.country.some(country => $activeFilters.countries.includes(country)))) {
                return false;
            }
            
            // Filter by project
            if ($activeFilters.projects.length > 0 && 
                (!pub.project || !$activeFilters.projects.includes(pub.project))) {
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
    // Ensure min is not greater than max before updating
    const validatedMin = Math.min(min, max);
    const validatedMax = Math.max(min, max);
    activeFilters.update(filters => ({ ...filters, yearRange: { min: validatedMin, max: validatedMax } }));
}

// Add function to reset year range filter
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

export function toggleAuthorFilter(author: string) {
    activeFilters.update(filters => {
        if (filters.authors.includes(author)) {
            return { ...filters, authors: filters.authors.filter(a => a !== author) };
        } else {
            return { ...filters, authors: [...filters.authors, author] };
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

// Function to clear all filters
export function clearAllFilters() {
    activeFilters.set({
        types: [],
        // Reset yearRange to null
        yearRange: null,
        tags: [],
        languages: [],
        authors: [],
        countries: [],
        projects: []
    });
}

// Get available tag counts for current filtered publications
export const tagCounts = derived(
    [filteredPublications],
    ([$filteredPublications]) => {
        const counts: Record<string, number> = {};
        $filteredPublications.forEach(pub => {
            if (pub.tags) {
                pub.tags.forEach(tag => {
                    counts[tag] = (counts[tag] || 0) + 1;
                });
            }
        });
        return counts;
    }
);

// Derive displayed authors based on selected publication types, year range, tags, and languages
export const displayedAuthors = derived(
    activeFilters, // Depend only on activeFilters
    ($activeFilters) => {
        const noTypeFilter = $activeFilters.types.length === 0;
        const noYearFilter = !$activeFilters.yearRange;
        const noTagFilter = $activeFilters.tags.length === 0;
        const noLanguageFilter = $activeFilters.languages.length === 0;

        // If no types, years, tags, or languages are filtered, show all available authors
        if (noTypeFilter && noYearFilter && noTagFilter && noLanguageFilter) {
            return allAuthors; // Use the static allAuthors list
        }

        // Filter publications based on active types, year range, tags, and languages
        const relevantPublications = allPublications.filter(pub => {
            // Type filter
            if (!noTypeFilter && !$activeFilters.types.includes(pub.type)) {
                return false;
            }
            // Year range filter
            if (!noYearFilter && 
                (pub.year < $activeFilters.yearRange!.min || pub.year > $activeFilters.yearRange!.max)) {
                return false;
            }
            // Tag filter
            if (!noTagFilter && 
                (!pub.tags || !pub.tags.some(tag => $activeFilters.tags.includes(tag)))) {
                return false;
            }
            // Language filter
            if (!noLanguageFilter) {
                const pubLanguages = pub.language ? pub.language.split(',').map(lang => lang.trim()) : [];
                if (!pubLanguages.some(lang => $activeFilters.languages.includes(lang))) {
                    return false;
                }
            }
            return true;
        });

        // Extract authors and applicable editors from these relevant publications
        const authorsFromRelevantPubs = new Set<string>();
        relevantPublications.forEach(pub => {
            // Add authors
            if (pub.authors) {
                pub.authors.forEach(author => {
                    if (author !== "Frédérick Madore") {
                        authorsFromRelevantPubs.add(author);
                    }
                });
            }
            
            // Add editors, excluding chapter and encyclopedia types
            if (pub.editors && pub.type !== 'chapter' && pub.type !== 'encyclopedia') {
                const editorNames = extractEditors(pub);
                editorNames.forEach(editor => {
                    if (editor !== "Frédérick Madore") {
                        authorsFromRelevantPubs.add(editor);
                    }
                });
            }
            
            // Add preface authors
            if (pub.prefacedBy && pub.prefacedBy !== "Frédérick Madore") {
                authorsFromRelevantPubs.add(pub.prefacedBy);
            }
        });

        // Convert Set to array and sort
        return Array.from(authorsFromRelevantPubs).sort();
    }
);

// Get available author counts for current filtered publications
export const authorCounts = derived(
    [filteredPublications],
    ([$filteredPublications]) => {
        const counts: Record<string, number> = {};
        
        $filteredPublications.forEach(pub => {
            // Count authors
            if (pub.authors) {
                pub.authors.forEach(author => {
                    // Only count co-authors, not the site owner
                    if (author !== "Frédérick Madore") {
                        counts[author] = (counts[author] || 0) + 1;
                    }
                });
            }
            
            // Count editors, but only if the publication type is not 'chapter' or 'encyclopedia'
            if (pub.editors && pub.type !== 'chapter' && pub.type !== 'encyclopedia') {
                const editorNames = extractEditors(pub);
                editorNames.forEach(editor => {
                    // Only count co-editors, not the site owner
                    if (editor !== "Frédérick Madore") {
                        counts[editor] = (counts[editor] || 0) + 1;
                    }
                });
            }
            
            // Count preface authors
            if (pub.prefacedBy && pub.prefacedBy !== "Frédérick Madore") {
                counts[pub.prefacedBy] = (counts[pub.prefacedBy] || 0) + 1;
            }
        });
        
        return counts;
    }
);

// Get available country counts for current filtered publications
export const countryCounts = derived(
    [filteredPublications],
    ([$filteredPublications]) => {
        const counts: Record<string, number> = {};
        $filteredPublications.forEach(pub => {
            if (pub.country) {
                pub.country.forEach(country => {
                    counts[country] = (counts[country] || 0) + 1;
                });
            }
        });
        return counts;
    }
);

// Get available project counts for current filtered publications
export const projectCounts = derived(
    [filteredPublications],
    ([$filteredPublications]) => {
        const counts: Record<string, number> = {};
        $filteredPublications.forEach(pub => {
            if (pub.project) {
                counts[pub.project] = (counts[pub.project] || 0) + 1;
            }
        });
        return counts;
    }
);

// Get available type counts for current filtered publications
export const typeCounts = derived(
    [filteredPublications],
    ([$filteredPublications]) => {
        const counts: Record<string, number> = {};
        $filteredPublications.forEach(pub => {
            counts[pub.type] = (counts[pub.type] || 0) + 1;
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

// Get available language counts for current filtered publications
export const languageCounts = derived(
    [filteredPublications],
    ([$filteredPublications]) => {
        const counts: Record<string, number> = {};
        $filteredPublications.forEach(pub => {
            if (pub.language) {
                const langs = pub.language.split(',').map(l => l.trim());
                langs.forEach(lang => {
                    counts[lang] = (counts[lang] || 0) + 1;
                });
            }
        });
        return counts;
    }
);

// Derive displayed types based on other active filters
export const displayedTypes = derived(
    activeFilters,
    ($activeFilters) => {
        const relevantPublications = allPublications.filter(pub => {
            // Year range filter
            if ($activeFilters.yearRange && (pub.year < $activeFilters.yearRange.min || pub.year > $activeFilters.yearRange.max)) return false;
            // Tag filter
            if ($activeFilters.tags.length > 0 && (!pub.tags || !pub.tags.some(tag => $activeFilters.tags.includes(tag)))) return false;
            // Language filter
            if ($activeFilters.languages.length > 0) {
                const pubLanguages = pub.language ? pub.language.split(',').map(lang => lang.trim()) : [];
                if (!pubLanguages.some(lang => $activeFilters.languages.includes(lang))) return false;
            }
            // Author filter
            if ($activeFilters.authors.length > 0) {
                const hasMatchingAuthor = pub.authors && pub.authors.some(author => $activeFilters.authors.includes(author));
                const isExcludedType = pub.type === 'chapter' || pub.type === 'encyclopedia';
                const hasMatchingEditor = !isExcludedType && pub.editors && extractEditors(pub).some(editor => $activeFilters.authors.includes(editor));
                const hasMatchingPrefaceAuthor = pub.prefacedBy && $activeFilters.authors.includes(pub.prefacedBy);
                if (!hasMatchingAuthor && !hasMatchingEditor && !hasMatchingPrefaceAuthor) return false;
            }
            // TODO: Add Country & Project filters if needed for consistency
            return true;
        });
        const types = new Set(relevantPublications.map(pub => pub.type));
        return Array.from(types).sort();
    }
);

// Derive displayed tags based on other active filters
export const displayedTags = derived(
    activeFilters,
    ($activeFilters) => {
        const relevantPublications = allPublications.filter(pub => {
            // Type filter
            if ($activeFilters.types.length > 0 && !$activeFilters.types.includes(pub.type)) return false;
            // Year range filter
            if ($activeFilters.yearRange && (pub.year < $activeFilters.yearRange.min || pub.year > $activeFilters.yearRange.max)) return false;
            // Language filter
            if ($activeFilters.languages.length > 0) {
                const pubLanguages = pub.language ? pub.language.split(',').map(lang => lang.trim()) : [];
                if (!pubLanguages.some(lang => $activeFilters.languages.includes(lang))) return false;
            }
            // Author filter
            if ($activeFilters.authors.length > 0) {
                const hasMatchingAuthor = pub.authors && pub.authors.some(author => $activeFilters.authors.includes(author));
                const isExcludedType = pub.type === 'chapter' || pub.type === 'encyclopedia';
                const hasMatchingEditor = !isExcludedType && pub.editors && extractEditors(pub).some(editor => $activeFilters.authors.includes(editor));
                const hasMatchingPrefaceAuthor = pub.prefacedBy && $activeFilters.authors.includes(pub.prefacedBy);
                if (!hasMatchingAuthor && !hasMatchingEditor && !hasMatchingPrefaceAuthor) return false;
            }
            // TODO: Add Country & Project filters if needed for consistency
            return true;
        });
        const tags = new Set(relevantPublications.flatMap(pub => pub.tags || []));
        return Array.from(tags).sort();
    }
);

// Derive displayed languages based on other active filters
export const displayedLanguages = derived(
    activeFilters,
    ($activeFilters) => {
        const relevantPublications = allPublications.filter(pub => {
            // Type filter
            if ($activeFilters.types.length > 0 && !$activeFilters.types.includes(pub.type)) return false;
            // Year range filter
            if ($activeFilters.yearRange && (pub.year < $activeFilters.yearRange.min || pub.year > $activeFilters.yearRange.max)) return false;
            // Tag filter
            if ($activeFilters.tags.length > 0 && (!pub.tags || !pub.tags.some(tag => $activeFilters.tags.includes(tag)))) return false;
            // Author filter
            if ($activeFilters.authors.length > 0) {
                const hasMatchingAuthor = pub.authors && pub.authors.some(author => $activeFilters.authors.includes(author));
                const isExcludedType = pub.type === 'chapter' || pub.type === 'encyclopedia';
                const hasMatchingEditor = !isExcludedType && pub.editors && extractEditors(pub).some(editor => $activeFilters.authors.includes(editor));
                const hasMatchingPrefaceAuthor = pub.prefacedBy && $activeFilters.authors.includes(pub.prefacedBy);
                if (!hasMatchingAuthor && !hasMatchingEditor && !hasMatchingPrefaceAuthor) return false;
            }
            // TODO: Add Country & Project filters if needed for consistency
            return true;
        });
        const languages = new Set(relevantPublications.flatMap(pub => pub.language ? pub.language.split(',').map(l => l.trim()) : []));
        return Array.from(languages).sort();
    }
); 