/**
 * Communications Filters
 *
 * Instantiates the runed EntityFilterSystem for the /conference-activity index.
 */

import { countOccurrences, byFrequencyThenAlpha } from '#lib/utils/facetOrdering.ts';
import type { CommunicationSummary, YearRange } from '#lib/types/index.ts';
import {
	allCommunicationSummaries as allCommunications,
	communicationSummariesByType as communicationsByType,
	communicationSummariesByYear as communicationsByYear,
	communicationSummaryTags as allTags,
	communicationSummariesByCountry as communicationsByCountry
} from './summaries';
import { author as siteAuthor } from '#lib/data/siteConfig.ts';
import { EntityFilterSystem } from '#lib/utils/entityFilterSystem.svelte.ts';
import { getContributorNames } from '#lib/utils/contributor.ts';
import {
	COMMUNICATION_TYPE_BADGE_LABELS,
	COMMUNICATION_TYPE_CHIP_LABELS,
	COMMUNICATION_TYPE_LIST_LABELS
} from '#lib/utils/typeUtils.ts';

// --- Computed unique values ---

const allCoAuthors = Array.from(
	new Set(allCommunications.flatMap((comm) => getContributorNames(comm.authors)))
)
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

const allCountries = Object.keys(communicationsByCountry || {});

const allProjects = Array.from(
	new Set(allCommunications.filter((comm) => comm.project).map((comm) => comm.project as string))
).sort();

// --- Facet ordering by frequency ---
// Tags and co-authors surface most-used first so the truncated sidebar facet
// lists show the meaningful ones; ties fall back to alphabetical.

const tagFrequency = countOccurrences(allCommunications.map((comm) => comm.tags ?? []));
const coAuthorFrequency = countOccurrences(
	allCommunications.map((comm) =>
		getContributorNames(comm.authors).filter((a) => a !== siteAuthor.name)
	)
);

// Countries by how many talks were held there: alphabetical and cut at eight,
// the list hid the United States (12) while printing Cameroon (1).
const countryFrequency = countOccurrences(
	allCommunications.map((comm) => (comm.country ? [comm.country] : []))
);

// --- Free-text search ---

/**
 * What the search box reads: everything a row prints, so a word the reader
 * can see finds its row. Title, year, date, credited names, the venue (event,
 * city, country), the panel and its participants, the tags, the opening of
 * the abstract, the type in each form the page prints it, and the project.
 */
export function communicationSearchFields(comm: CommunicationSummary): string[] {
	const type = comm.type ?? '';
	return [
		comm.title,
		String(comm.year ?? ''),
		comm.date ?? '',
		...getContributorNames(comm.authors),
		comm.conference ?? '',
		comm.panelTitle ?? '',
		comm.location ?? '',
		comm.country ?? '',
		...(comm.participants ?? []).map((participant) => participant.name),
		...(comm.papers ?? []).flatMap((paper) => [
			paper.title,
			...paper.authors.map((paperAuthor) => paperAuthor.name)
		]),
		...(comm.tags ?? []),
		comm.abstractExcerpt ?? '',
		COMMUNICATION_TYPE_BADGE_LABELS[type] ?? '',
		COMMUNICATION_TYPE_LIST_LABELS[type] ?? '',
		COMMUNICATION_TYPE_CHIP_LABELS[type] ?? '',
		comm.project ?? ''
	];
}

// --- Filter System ---

export const communicationFilters = new EntityFilterSystem<CommunicationSummary>({
	items: allCommunications,
	searchFields: communicationSearchFields,
	// Where the talk was given, not what it was about: the publications index
	// reads the same parameter as the countries a work studies.
	labels: { countries: 'Held in' },
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
				const authors = getContributorNames(comm.authors);
				return authors.some((a) => a !== siteAuthor.name && values.includes(a));
			},
			countExtractor: (comm: CommunicationSummary) =>
				getContributorNames(comm.authors).filter((a) => a !== siteAuthor.name)
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
		countries: byFrequencyThenAlpha(allCountries, countryFrequency),
		projects: allProjects
	}
});
