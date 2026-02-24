/**
 * Publications Filters
 *
 * Uses the filter store factory for standard filter logic.
 * Publication-specific behavior (author extraction from editors/ToC)
 * is handled via dimension match functions.
 */

import type { Publication, YearRange, TableOfContentsEntry } from '$lib/types';
import {
	allPublications as baseAllPublications,
	publicationsByType,
	publicationsByYear,
	allTags
} from './index';
import { createFilterSystem } from '$lib/utils/filterStoreFactory';
import { SvelteSet } from 'svelte/reactivity';

type Pub = Publication & { sourceDirType: string };

const allPublications: Pub[] = baseAllPublications;

// --- Domain-specific helpers ---

function extractEditors(publication: Pub): string[] {
	if (!publication.editors) return [];
	if (typeof publication.editors === 'string') {
		return publication.editors.split(/\s*(?:,|and)\s*/).map((name) => name.trim());
	}
	if (Array.isArray(publication.editors)) {
		return publication.editors;
	}
	return [];
}

function extractTocAuthors(publication: Pub): string[] {
	if (!publication.tableOfContents) return [];
	return publication.tableOfContents.flatMap((entry) => {
		if (typeof entry === 'string') return [];
		return (entry as TableOfContentsEntry).authors || [];
	});
}

// --- Computed unique values ---

export const allAuthors = Array.from(
	new SvelteSet([
		...allPublications.flatMap((pub) => pub.authors || []),
		...allPublications
			.filter((pub) => pub.type !== 'chapter' && pub.type !== 'encyclopedia')
			.flatMap((pub) => extractEditors(pub)),
		...allPublications.filter((pub) => pub.prefacedBy).map((pub) => pub.prefacedBy as string),
		...allPublications.flatMap((pub) => extractTocAuthors(pub))
	])
)
	.filter((author: string) => author !== 'Frédérick Madore')
	.sort();

const allCountries = Array.from(
	new SvelteSet(allPublications.flatMap((pub) => pub.country || []))
).sort();

const allProjects = Array.from(
	new SvelteSet(allPublications.map((pub) => pub.project).filter(Boolean) as string[])
).sort();

const uniqueLanguages = Array.from(
	new Set(
		allPublications.flatMap((pub) =>
			pub.language ? pub.language.split(',').map((l: string) => l.trim()) : []
		)
	)
).sort();

const typeLabels: Record<string, string> = {
	blogpost: 'Blog post',
	book: 'Book',
	chapter: 'Book chapter',
	'conference-proceedings': 'Conference proceedings',
	encyclopedia: 'Encyclopedia entry',
	article: 'Journal article',
	'masters-thesis': "Master's thesis",
	'phd-dissertation': 'Ph.D. dissertation',
	report: 'Report',
	'special-issue': 'Special issue'
};

// --- Filter System ---

const system = createFilterSystem<
	Publication & { sourceDirType: string },
	{
		types: string[];
		yearRange: YearRange | null;
		tags: string[];
		languages: string[];
		authors: string[];
		countries: string[];
		projects: string[];
	}
>({
	items: allPublications,
	initialFilters: {
		types: [],
		yearRange: null,
		tags: [],
		languages: [],
		authors: [],
		countries: [],
		projects: []
	},
	dimensions: {
		types: {
			match: (pub: Pub, values: string[]) => values.includes(pub.type),
			countExtractor: (pub: Pub) => pub.type
		},
		yearRange: {
			type: 'range',
			match: (pub: Pub, range: YearRange) => pub.year >= range.min && pub.year <= range.max
		},
		tags: {
			match: (pub: Pub, values: string[]) =>
				!!pub.tags && pub.tags.some((t) => values.includes(t)),
			countExtractor: (pub: Pub) => pub.tags
		},
		languages: {
			match: (pub: Pub, values: string[]) => {
				const langs = pub.language ? pub.language.split(',').map((l) => l.trim()) : [];
				return langs.some((l) => values.includes(l));
			},
			countExtractor: (pub: Pub) => pub.language?.split(',').map((l) => l.trim())
		},
		authors: {
			match: (pub: Pub, values: string[]) => {
				const hasMatchingAuthor =
					pub.authors && pub.authors.some((a) => values.includes(a));
				const isExcludedType = pub.type === 'chapter' || pub.type === 'encyclopedia';
				const hasMatchingEditor =
					!isExcludedType &&
					pub.editors &&
					extractEditors(pub).some((e) => values.includes(e));
				const hasMatchingPrefaceAuthor = pub.prefacedBy && values.includes(pub.prefacedBy);
				const hasMatchingTocAuthor = extractTocAuthors(pub).some((a) =>
					values.includes(a)
				);
				return !!(
					hasMatchingAuthor ||
					hasMatchingEditor ||
					hasMatchingPrefaceAuthor ||
					hasMatchingTocAuthor
				);
			},
			countExtractor: (pub: Pub) => pub.authors
		},
		countries: {
			match: (pub: Pub, values: string[]) =>
				!!pub.country && pub.country.some((c) => values.includes(c)),
			countExtractor: (pub: Pub) => pub.country
		},
		projects: {
			match: (pub: Pub, values: string[]) => !!pub.project && values.includes(pub.project),
			countExtractor: (pub: Pub) => pub.project
		}
	},
	filterOptions: {
		types: Object.keys(publicationsByType).sort((a, b) => {
			const labelA = typeLabels[a] || a;
			const labelB = typeLabels[b] || b;
			return labelA.localeCompare(labelB);
		}),
		years: Object.keys(publicationsByYear)
			.map(Number)
			.sort((a, b) => b - a),
		tags: allTags,
		languages: uniqueLanguages,
		authors: allAuthors,
		countries: allCountries,
		projects: allProjects
	}
});

// --- Re-exports (preserves existing consumer API) ---

export const { activeFilters, filterOptions, clearAllFilters } = system;
export const filteredPublications = system.filteredItems;

export const toggleTypeFilter = system.toggles.types;
export const toggleTagFilter = system.toggles.tags;
export const toggleLanguageFilter = system.toggles.languages;
export const toggleAuthorFilter = system.toggles.authors;
export const toggleCountryFilter = system.toggles.countries;
export const toggleProjectFilter = system.toggles.projects;

export const updateYearRange = system.updateYearRange!;
export const resetYearRange = system.resetYearRange!;
export const setYearRange = system.setYearRange!;

export const setTypes = system.setters.types;
export const setTags = system.setters.tags;
export const setLanguages = system.setters.languages;
export const setAuthors = system.setters.authors;
export const setCountries = system.setters.countries;
export const setProjects = system.setters.projects;

export const tagCounts = system.counts.tags;
export const authorCounts = system.counts.authors;
export const typeCounts = system.counts.types;
export const languageCounts = system.counts.languages;
export const countryCounts = system.counts.countries;
export const projectCounts = system.counts.projects;
