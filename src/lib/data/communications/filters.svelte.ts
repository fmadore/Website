/**
 * Communications Filters
 *
 * Uses the filter store factory for standard filter logic.
 */

import type { Communication, YearRange } from '$lib/types';
import {
	allCommunications,
	communicationsByType,
	communicationsByYear,
	allTags,
	communicationsByCountry
} from './index';
import { createFilterSystem } from '$lib/utils/filterStoreFactory';

// --- Computed unique values ---

const allCoAuthors = Array.from(new Set(allCommunications.flatMap((comm) => comm.authors || [])))
	.filter((author) => author !== 'Frédérick Madore')
	.sort();

const allLanguages = Array.from(
	new Set(
		allCommunications.flatMap((comm) => {
			if (!comm.language) return [];
			if (Array.isArray(comm.language)) return comm.language;
			return comm.language.split(',').map((l) => l.trim());
		})
	)
).sort();

const allCountries = Object.keys(communicationsByCountry || {}).sort();

const allProjects = Array.from(
	new Set(allCommunications.filter((comm) => comm.project).map((comm) => comm.project as string))
).sort();

// --- Facet ordering by frequency ---
// Tags and co-authors surface most-used first so the truncated sidebar facet
// lists show the meaningful ones; ties fall back to alphabetical.
function countOccurrences(lists: string[][]): Map<string, number> {
	// eslint-disable-next-line svelte/prefer-svelte-reactivity -- build-time tally, never reactive
	const freq = new Map<string, number>();
	for (const list of lists) {
		for (const value of list) freq.set(value, (freq.get(value) ?? 0) + 1);
	}
	return freq;
}

function byFrequencyThenAlpha(values: string[], freq: Map<string, number>): string[] {
	return [...values].sort((a, b) => (freq.get(b) ?? 0) - (freq.get(a) ?? 0) || a.localeCompare(b));
}

const tagFrequency = countOccurrences(allCommunications.map((comm) => comm.tags ?? []));
const coAuthorFrequency = countOccurrences(
	allCommunications.map((comm) => (comm.authors ?? []).filter((a) => a !== 'Frédérick Madore'))
);

// --- Filter System ---

const system = createFilterSystem({
	items: allCommunications,
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
			match: (comm: Communication, values: string[]) => !!comm.type && values.includes(comm.type),
			countExtractor: (comm: Communication) => comm.type
		},
		yearRange: {
			type: 'range',
			match: (comm: Communication, range: YearRange) =>
				!!comm.year && comm.year >= range.min && comm.year <= range.max
		},
		tags: {
			match: (comm: Communication, values: string[]) =>
				!!comm.tags && comm.tags.some((t) => values.includes(t)),
			countExtractor: (comm: Communication) => comm.tags
		},
		languages: {
			match: (comm: Communication, values: string[]) => {
				const langs = comm.language
					? Array.isArray(comm.language)
						? comm.language
						: comm.language.split(',').map((l) => l.trim())
					: [];
				return langs.some((l) => values.includes(l));
			},
			countExtractor: (comm: Communication) => {
				if (!comm.language) return undefined;
				return Array.isArray(comm.language)
					? comm.language
					: comm.language.split(',').map((l) => l.trim());
			}
		},
		authors: {
			match: (comm: Communication, values: string[]) => {
				const authors = comm.authors || [];
				return authors.some((a) => a !== 'Frédérick Madore' && values.includes(a));
			},
			countExtractor: (comm: Communication) => comm.authors?.filter((a) => a !== 'Frédérick Madore')
		},
		countries: {
			match: (comm: Communication, values: string[]) =>
				!!comm.country && values.includes(comm.country),
			countExtractor: (comm: Communication) => comm.country
		},
		projects: {
			match: (comm: Communication, values: string[]) =>
				!!comm.project && values.includes(comm.project),
			countExtractor: (comm: Communication) => comm.project
		}
	},
	filterOptions: {
		types: Object.keys(communicationsByType || {}).sort(),
		years: Object.keys(communicationsByYear || {})
			.map(Number)
			.sort((a, b) => b - a),
		tags: byFrequencyThenAlpha(allTags || [], tagFrequency),
		languages: allLanguages,
		authors: byFrequencyThenAlpha(allCoAuthors, coAuthorFrequency),
		countries: allCountries,
		projects: allProjects
	}
});

// --- Re-exports (preserves existing consumer API) ---

export const { activeFilters, filterOptions, clearAllFilters } = system;
export const filteredCommunications = system.filteredItems;

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

export const typeCounts = system.counts.types;
export const tagCounts = system.counts.tags;
export const countryCounts = system.counts.countries;
export const projectCounts = system.counts.projects;
export const languageCounts = system.counts.languages;
export const authorCounts = system.counts.authors;
