/**
 * Communications Filters
 *
 * Instantiates the runed EntityFilterSystem for the /conference-activity index.
 */

import type { Communication, YearRange } from '$lib/types';
import {
	allCommunications,
	communicationsByType,
	communicationsByYear,
	allTags,
	communicationsByCountry
} from './index';
import { EntityFilterSystem } from '$lib/utils/entityFilterSystem.svelte';

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

export const communicationFilters = new EntityFilterSystem<Communication>({
	items: allCommunications,
	matchesYearRange: (comm: Communication, range: YearRange) =>
		!!comm.year && comm.year >= range.min && comm.year <= range.max,
	dimensions: {
		types: {
			match: (comm: Communication, values: string[]) => !!comm.type && values.includes(comm.type),
			countExtractor: (comm: Communication) => comm.type
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
