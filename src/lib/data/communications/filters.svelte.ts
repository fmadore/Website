/**
 * Communications Filters
 *
 * Instantiates the runed EntityFilterSystem for the /conference-activity index.
 */

import { countOccurrences, byFrequencyThenAlpha } from '$lib/utils/facetOrdering';
import type { CommunicationSummary, YearRange } from '$lib/types';
import {
	allCommunicationSummaries as allCommunications,
	communicationSummariesByType as communicationsByType,
	communicationSummariesByYear as communicationsByYear,
	communicationSummaryTags as allTags,
	communicationSummariesByCountry as communicationsByCountry
} from './summaries';
import { author as siteAuthor } from '$lib/data/siteConfig';
import { EntityFilterSystem } from '$lib/utils/entityFilterSystem.svelte';

// --- Computed unique values ---

const allCoAuthors = Array.from(new Set(allCommunications.flatMap((comm) => comm.authors || [])))
	.filter((author) => author !== siteAuthor.name)
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

const tagFrequency = countOccurrences(allCommunications.map((comm) => comm.tags ?? []));
const coAuthorFrequency = countOccurrences(
	allCommunications.map((comm) => (comm.authors ?? []).filter((a) => a !== siteAuthor.name))
);

// --- Filter System ---

export const communicationFilters = new EntityFilterSystem<CommunicationSummary>({
	items: allCommunications,
	matchesYearRange: (comm: CommunicationSummary, range: YearRange) =>
		!!comm.year && comm.year >= range.min && comm.year <= range.max,
	dimensions: {
		types: {
			match: (comm: CommunicationSummary, values: string[]) =>
				!!comm.type && values.includes(comm.type),
			countExtractor: (comm: CommunicationSummary) => comm.type
		},
		tags: {
			match: (comm: CommunicationSummary, values: string[]) =>
				!!comm.tags && comm.tags.some((t) => values.includes(t)),
			countExtractor: (comm: CommunicationSummary) => comm.tags
		},
		languages: {
			match: (comm: CommunicationSummary, values: string[]) => {
				const langs = comm.language
					? Array.isArray(comm.language)
						? comm.language
						: comm.language.split(',').map((l) => l.trim())
					: [];
				return langs.some((l) => values.includes(l));
			},
			countExtractor: (comm: CommunicationSummary) => {
				if (!comm.language) return undefined;
				return Array.isArray(comm.language)
					? comm.language
					: comm.language.split(',').map((l) => l.trim());
			}
		},
		authors: {
			match: (comm: CommunicationSummary, values: string[]) => {
				const authors = comm.authors || [];
				return authors.some((a) => a !== siteAuthor.name && values.includes(a));
			},
			countExtractor: (comm: CommunicationSummary) =>
				comm.authors?.filter((a) => a !== siteAuthor.name)
		},
		countries: {
			match: (comm: CommunicationSummary, values: string[]) =>
				!!comm.country && values.includes(comm.country),
			countExtractor: (comm: CommunicationSummary) => comm.country
		},
		projects: {
			match: (comm: CommunicationSummary, values: string[]) =>
				!!comm.project && values.includes(comm.project),
			countExtractor: (comm: CommunicationSummary) => comm.project
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
