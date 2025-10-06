/**
 * Publications Filters - Svelte 5 Compatible Edition
 *
 * Exports proper Svelte stores that can be used with $ prefix in components.
 * Uses createActiveFiltersStore and other utilities to maintain reactivity.
 */

import type { Publication, YearRange } from '$lib/types';
import {
	allPublications as baseAllPublications,
	publicationsByType,
	publicationsByYear,
	allTags
} from './index';
import {
	createActiveFiltersStore,
	createToggleArrayFilter,
	createSetArrayFilter,
	createUpdateRangeFilter,
	createResetRangeFilter,
	createSetRangeFilter,
	createClearAllFilters,
	createDerivedCountStore
} from '$lib/utils/filterUtils';
import { derived, readable } from 'svelte/store';

// Explicitly type the imported allPublications to include sourceDirType
const allPublications: (Publication & { sourceDirType: string })[] = baseAllPublications;

// Helper function to extract editors from a publication
function extractEditors(publication: Publication & { sourceDirType?: string }): string[] {
	if (!publication.editors) return [];

	// Handle string format (e.g., "Editor1, Editor2" or "Editor1 and Editor2")
	if (typeof publication.editors === 'string') {
		return publication.editors.split(/\s*(?:,|and)\s*/).map((name) => name.trim());
	}

	// Handle array format
	if (Array.isArray(publication.editors)) {
		return publication.editors;
	}

	return [];
}

// Extract all unique co-authors from publications, excluding "Frédérick Madore"
export const allAuthors = Array.from(
	new Set([
		// Get authors from publications
		...allPublications.flatMap((pub: Publication & { sourceDirType: string }) => pub.authors || []),
		// Get editors from publications, excluding chapters and encyclopedia entries
		...allPublications
			.filter(
				(pub: Publication & { sourceDirType: string }) =>
					pub.type !== 'chapter' && pub.type !== 'encyclopedia'
			)
			.flatMap((pub: Publication & { sourceDirType: string }) => extractEditors(pub)),
		// Get preface authors
		...allPublications
			.filter((pub: Publication & { sourceDirType: string }) => pub.prefacedBy)
			.map((pub: Publication & { sourceDirType: string }) => pub.prefacedBy as string)
	])
)
	.filter((author: string) => author !== 'Frédérick Madore')
	.sort();

// Extract all unique countries from publications
export const allCountries = Array.from(
	new Set(
		allPublications.flatMap((pub: Publication & { sourceDirType: string }) => pub.country || [])
	)
).sort();

// Extract all unique projects from publications
export const allProjects = Array.from(
	new Set(
		allPublications
			.map((pub: Publication & { sourceDirType: string }) => pub.project)
			.filter(Boolean) as string[]
	)
).sort();

// Adjust allLanguages to handle comma-separated values consistently
const uniqueLanguages = Array.from(
	new Set(
		allPublications.flatMap((pub: Publication & { sourceDirType: string }) =>
			pub.language ? pub.language.split(',').map((l: string) => l.trim()) : []
		)
	)
).sort();

// Create reactive state for active filters
interface ActivePublicationFilters {
	types: string[];
	yearRange: YearRange | null;
	tags: string[];
	languages: string[];
	authors: string[];
	countries: string[];
	projects: string[];
}

const initialFilters: ActivePublicationFilters = {
	types: [],
	yearRange: null,
	tags: [],
	languages: [],
	authors: [],
	countries: [],
	projects: []
};

export const activeFilters = createActiveFiltersStore(initialFilters);

// Define type labels for sorting (matching the ones used in the UI)
const typeLabels: { [key: string]: string } = {
	blogpost: 'Blog post',
	book: 'Book',
	chapter: 'Book chapter',
	encyclopedia: 'Encyclopedia entry',
	article: 'Journal article',
	'masters-thesis': "Master's thesis",
	'phd-dissertation': 'Ph.D. dissertation',
	report: 'Report',
	'special-issue': 'Special issue'
};

// Create a readable store for filter options
export const filterOptions = readable({
	types: Object.keys(publicationsByType).sort((a, b) => {
		// Sort by display labels instead of raw values
		const labelA = typeLabels[a] || a;
		const labelB = typeLabels[b] || b;
		return labelA.localeCompare(labelB);
	}),
	// Years remain the same here, representing all available options
	years: Object.keys(publicationsByYear)
		.map(Number)
		.sort((a, b) => b - a),
	tags: allTags,
	languages: uniqueLanguages,
	authors: allAuthors,
	countries: allCountries,
	projects: allProjects
});

// Derived store that filters publications based on active filters
export const filteredPublications = derived(
	activeFilters,
	($activeFilters): (Publication & { sourceDirType: string })[] => {
		return allPublications.filter((pub: Publication & { sourceDirType: string }) => {
			// Filter by publication type
			if ($activeFilters.types.length > 0 && !$activeFilters.types.includes(pub.type)) {
				return false;
			}

			// Filter by year range
			if (
				$activeFilters.yearRange &&
				(pub.year < $activeFilters.yearRange.min || pub.year > $activeFilters.yearRange.max)
			) {
				return false;
			}

			// Filter by tags (if publication has at least one of the selected tags)
			if (
				$activeFilters.tags.length > 0 &&
				(!pub.tags || !pub.tags.some((tag: string) => $activeFilters.tags.includes(tag)))
			) {
				return false;
			}

			// Filter by language
			if ($activeFilters.languages.length > 0) {
				const pubLanguages = pub.language
					? pub.language.split(',').map((lang: string) => lang.trim())
					: [];
				if (!pubLanguages.some((lang: string) => $activeFilters.languages.includes(lang))) {
					return false;
				}
			}

			// Filter by author (if publication has at least one of the selected authors)
			if ($activeFilters.authors.length > 0) {
				// Check authors array
				const hasMatchingAuthor =
					pub.authors && pub.authors.some((author) => $activeFilters.authors.includes(author));

				// Check editors, but only if the publication type is not chapter or encyclopedia
				const isExcludedType = pub.type === 'chapter' || pub.type === 'encyclopedia';
				const hasMatchingEditor =
					!isExcludedType &&
					pub.editors &&
					((typeof pub.editors === 'string' &&
						pub.editors
							.split(/\s*(?:,|and)\s*/)
							.map((name) => name.trim())
							.some((editor) => $activeFilters.authors.includes(editor))) ||
						(Array.isArray(pub.editors) &&
							pub.editors.some((editor) => $activeFilters.authors.includes(editor))));

				// Check preface author
				const hasMatchingPrefaceAuthor =
					pub.prefacedBy && $activeFilters.authors.includes(pub.prefacedBy);

				// If neither authors, valid editors, nor preface author match, filter out this publication
				if (!hasMatchingAuthor && !hasMatchingEditor && !hasMatchingPrefaceAuthor) {
					return false;
				}
			}

			// Filter by country
			if (
				$activeFilters.countries.length > 0 &&
				(!pub.country ||
					!pub.country.some((country: string) => $activeFilters.countries.includes(country)))
			) {
				return false;
			}

			// Filter by project
			if (
				$activeFilters.projects.length > 0 &&
				(!pub.project || !$activeFilters.projects.includes(pub.project))
			) {
				return false;
			}

			return true;
		});
	}
); // Functions to toggle filters
export const toggleTypeFilter = createToggleArrayFilter(activeFilters, 'types');
export const toggleTagFilter = createToggleArrayFilter(activeFilters, 'tags');
export const toggleLanguageFilter = createToggleArrayFilter(activeFilters, 'languages');
export const toggleAuthorFilter = createToggleArrayFilter(activeFilters, 'authors');
export const toggleCountryFilter = createToggleArrayFilter(activeFilters, 'countries');
export const toggleProjectFilter = createToggleArrayFilter(activeFilters, 'projects');

// Add function to update year range
export const updateYearRange = createUpdateRangeFilter(activeFilters, 'yearRange');

// Add function to reset year range filter
export const resetYearRange = createResetRangeFilter(activeFilters, 'yearRange');

// Set Functions
export const setTypes = createSetArrayFilter(activeFilters, 'types');
export const setTags = createSetArrayFilter(activeFilters, 'tags');
export const setLanguages = createSetArrayFilter(activeFilters, 'languages');
export const setAuthors = createSetArrayFilter(activeFilters, 'authors');
export const setCountries = createSetArrayFilter(activeFilters, 'countries');
export const setProjects = createSetArrayFilter(activeFilters, 'projects');
export const setYearRange = createSetRangeFilter(updateYearRange, resetYearRange);

// Function to clear all filters
export const clearAllFilters = createClearAllFilters(activeFilters, initialFilters);

// Get available tag counts for current filtered publications
export const tagCounts = createDerivedCountStore(
	filteredPublications,
	(pub: Publication & { sourceDirType: string }) => pub.tags
);

// Derive displayed authors based on selected publication types, year range, tags, and languages
export const displayedAuthors = derived(activeFilters, ($activeFilters): string[] => {
	const noTypeFilter = $activeFilters.types.length === 0;
	const noYearFilter = !$activeFilters.yearRange;
	const noTagFilter = $activeFilters.tags.length === 0;
	const noLanguageFilter = $activeFilters.languages.length === 0;
	const noCountryFilter = $activeFilters.countries.length === 0;

	// If no types, years, tags, or languages are filtered, show all available authors
	if (noTypeFilter && noYearFilter && noTagFilter && noLanguageFilter && noCountryFilter) {
		return allAuthors; // Use the static allAuthors list
	}

	// Filter publications based on active types, year range, tags, and languages
	const relevantPublications = allPublications.filter((pub) => {
		// Type filter
		if (!noTypeFilter && !$activeFilters.types.includes(pub.type)) {
			return false;
		}
		// Year range filter
		if (
			!noYearFilter &&
			(pub.year < $activeFilters.yearRange!.min || pub.year > $activeFilters.yearRange!.max)
		) {
			return false;
		}
		// Tag filter
		if (!noTagFilter && (!pub.tags || !pub.tags.some((tag) => $activeFilters.tags.includes(tag)))) {
			return false;
		}
		// Language filter
		if (!noLanguageFilter) {
			const pubLanguages = pub.language ? pub.language.split(',').map((lang) => lang.trim()) : [];
			if (!pubLanguages.some((lang) => $activeFilters.languages.includes(lang))) {
				return false;
			}
		}
		// Country filter
		if (
			!noCountryFilter &&
			(!pub.country || !pub.country.some((country) => $activeFilters.countries.includes(country)))
		) {
			return false;
		}
		return true;
	});

	// Extract authors and applicable editors from these relevant publications
	const authorsFromRelevantPubs = new Set<string>();
	relevantPublications.forEach((pub) => {
		// Add authors
		if (pub.authors) {
			pub.authors.forEach((author) => {
				if (author !== 'Frédérick Madore') {
					authorsFromRelevantPubs.add(author);
				}
			});
		}

		// Add editors, excluding chapter and encyclopedia types
		if (pub.editors && pub.type !== 'chapter' && pub.type !== 'encyclopedia') {
			const editorNames = extractEditors(pub);
			editorNames.forEach((editor) => {
				if (editor !== 'Frédérick Madore') {
					authorsFromRelevantPubs.add(editor);
				}
			});
		}

		// Add preface authors
		if (pub.prefacedBy && pub.prefacedBy !== 'Frédérick Madore') {
			authorsFromRelevantPubs.add(pub.prefacedBy);
		}
	});

	// Convert Set to array and sort
	return Array.from(authorsFromRelevantPubs).sort();
});

// Get available author counts for current filtered publications
export const authorCounts = createDerivedCountStore(
	filteredPublications,
	(pub: Publication & { sourceDirType: string }) => pub.authors
);

// Get available country counts for current filtered publications
export const countryCounts = createDerivedCountStore(
	filteredPublications,
	(pub: Publication & { sourceDirType: string }) => pub.country
);

// Get available project counts for current filtered publications
export const projectCounts = createDerivedCountStore(
	filteredPublications,
	(pub: Publication & { sourceDirType: string }) => pub.project
);

// Get available type counts for current filtered publications
export const typeCounts = createDerivedCountStore(
	filteredPublications,
	(pub: Publication & { sourceDirType: string }) => pub.type
);

// Get available language counts for current filtered publications
export const languageCounts = createDerivedCountStore(
	filteredPublications,
	(pub: Publication & { sourceDirType: string }) =>
		pub.language?.split(',').map((l: string) => l.trim())
);

// Derive displayed types based on other active filters
export const displayedTypes = derived(activeFilters, ($activeFilters): string[] => {
	const relevantPublications = allPublications.filter((pub) => {
		// Year range filter
		if (
			$activeFilters.yearRange &&
			(pub.year < $activeFilters.yearRange.min || pub.year > $activeFilters.yearRange.max)
		)
			return false;
		// Tag filter
		if (
			$activeFilters.tags.length > 0 &&
			(!pub.tags || !pub.tags.some((tag) => $activeFilters.tags.includes(tag)))
		)
			return false;
		// Language filter
		if ($activeFilters.languages.length > 0) {
			const pubLanguages = pub.language ? pub.language.split(',').map((lang) => lang.trim()) : [];
			if (!pubLanguages.some((lang) => $activeFilters.languages.includes(lang))) return false;
		}
		// Author filter
		if ($activeFilters.authors.length > 0) {
			const hasMatchingAuthor =
				pub.authors && pub.authors.some((author) => $activeFilters.authors.includes(author));
			const isExcludedType = pub.type === 'chapter' || pub.type === 'encyclopedia';
			const hasMatchingEditor =
				!isExcludedType &&
				pub.editors &&
				extractEditors(pub).some((editor) => $activeFilters.authors.includes(editor));
			const hasMatchingPrefaceAuthor =
				pub.prefacedBy && $activeFilters.authors.includes(pub.prefacedBy);
			if (!hasMatchingAuthor && !hasMatchingEditor && !hasMatchingPrefaceAuthor) return false;
		}
		// Country filter
		if (
			$activeFilters.countries.length > 0 &&
			(!pub.country || !pub.country.some((country) => $activeFilters.countries.includes(country)))
		)
			return false;
		// Project filter
		if (
			$activeFilters.projects.length > 0 &&
			(!pub.project || !$activeFilters.projects.includes(pub.project))
		)
			return false;
		return true;
	});
	const types = new Set(relevantPublications.map((pub) => pub.type));
	return Array.from(types).sort((a, b) => {
		// Sort by display labels instead of raw values
		const labelA = typeLabels[a] || a;
		const labelB = typeLabels[b] || b;
		return labelA.localeCompare(labelB);
	});
});

// Derive displayed tags based on other active filters
export const displayedTags = derived(activeFilters, ($activeFilters): string[] => {
	const relevantPublications = allPublications.filter((pub) => {
		// Type filter
		if ($activeFilters.types.length > 0 && !$activeFilters.types.includes(pub.type)) return false;
		// Year range filter
		if (
			$activeFilters.yearRange &&
			(pub.year < $activeFilters.yearRange.min || pub.year > $activeFilters.yearRange.max)
		)
			return false;
		// Language filter
		if ($activeFilters.languages.length > 0) {
			const pubLanguages = pub.language ? pub.language.split(',').map((lang) => lang.trim()) : [];
			if (!pubLanguages.some((lang) => $activeFilters.languages.includes(lang))) return false;
		}
		// Author filter
		if ($activeFilters.authors.length > 0) {
			const hasMatchingAuthor =
				pub.authors && pub.authors.some((author) => $activeFilters.authors.includes(author));
			const isExcludedType = pub.type === 'chapter' || pub.type === 'encyclopedia';
			const hasMatchingEditor =
				!isExcludedType &&
				pub.editors &&
				extractEditors(pub).some((editor) => $activeFilters.authors.includes(editor));
			const hasMatchingPrefaceAuthor =
				pub.prefacedBy && $activeFilters.authors.includes(pub.prefacedBy);
			if (!hasMatchingAuthor && !hasMatchingEditor && !hasMatchingPrefaceAuthor) return false;
		}
		// Country filter
		if (
			$activeFilters.countries.length > 0 &&
			(!pub.country || !pub.country.some((country) => $activeFilters.countries.includes(country)))
		)
			return false;
		// Project filter
		if (
			$activeFilters.projects.length > 0 &&
			(!pub.project || !$activeFilters.projects.includes(pub.project))
		)
			return false;
		return true;
	});
	const tags = new Set(relevantPublications.flatMap((pub) => pub.tags || []));
	return Array.from(tags).sort();
});

// Derive displayed languages based on other active filters
export const displayedLanguages = derived(activeFilters, ($activeFilters): string[] => {
	const relevantPublications = allPublications.filter((pub) => {
		// Type filter
		if ($activeFilters.types.length > 0 && !$activeFilters.types.includes(pub.type)) return false;
		// Year range filter
		if (
			$activeFilters.yearRange &&
			(pub.year < $activeFilters.yearRange.min || pub.year > $activeFilters.yearRange.max)
		)
			return false;
		// Tag filter
		if (
			$activeFilters.tags.length > 0 &&
			(!pub.tags || !pub.tags.some((tag) => $activeFilters.tags.includes(tag)))
		)
			return false;
		// Author filter
		if ($activeFilters.authors.length > 0) {
			const hasMatchingAuthor =
				pub.authors && pub.authors.some((author) => $activeFilters.authors.includes(author));
			const isExcludedType = pub.type === 'chapter' || pub.type === 'encyclopedia';
			const hasMatchingEditor =
				!isExcludedType &&
				pub.editors &&
				extractEditors(pub).some((editor) => $activeFilters.authors.includes(editor));
			const hasMatchingPrefaceAuthor =
				pub.prefacedBy && $activeFilters.authors.includes(pub.prefacedBy);
			if (!hasMatchingAuthor && !hasMatchingEditor && !hasMatchingPrefaceAuthor) return false;
		}
		// Country filter
		if (
			$activeFilters.countries.length > 0 &&
			(!pub.country || !pub.country.some((country) => $activeFilters.countries.includes(country)))
		)
			return false;
		// Project filter
		if (
			$activeFilters.projects.length > 0 &&
			(!pub.project || !$activeFilters.projects.includes(pub.project))
		)
			return false;
		return true;
	});
	const languages = new Set(
		relevantPublications.flatMap((pub) =>
			pub.language ? pub.language.split(',').map((l) => l.trim()) : []
		)
	);
	return Array.from(languages).sort();
});
