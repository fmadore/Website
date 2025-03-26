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
    // Get editors from publications
    ...allPublications.flatMap(pub => extractEditors(pub)),
    // Get preface authors
    ...allPublications.filter(pub => pub.prefacedBy).map(pub => pub.prefacedBy as string)
]))
.filter(author => author !== "Frédérick Madore")
.sort();

// Create a store for active filters
export const activeFilters = writable({
    types: [] as string[],
    years: [] as number[],
    tags: [] as string[],
    languages: [] as string[],
    authors: [] as string[]
});

// Create a store for available filter options (automatically derived from publications)
export const filterOptions = writable({
    types: Object.keys(publicationsByType).sort(),
    years: Object.keys(publicationsByYear).map(Number).sort((a, b) => b - a),
    tags: allTags,
    languages: allLanguages,
    authors: allAuthors
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
            
            // Filter by year
            if ($activeFilters.years.length > 0 && !$activeFilters.years.includes(pub.year)) {
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
                
                // Check editors (could be string or array)
                const hasMatchingEditor = pub.editors && (
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
                
                // If neither authors, editors, nor preface author match, filter out this publication
                if (!hasMatchingAuthor && !hasMatchingEditor && !hasMatchingPrefaceAuthor) {
                    return false;
                }
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
        years: [],
        tags: [],
        languages: [],
        authors: []
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
            
            // Count editors
            if (pub.editors) {
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