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
import { EntityFilterSystem, tagAlias } from '#lib/utils/entityFilterSystem.svelte.ts';
import { buildPersonFacet, type Credit } from '#lib/utils/personFacet.ts';
import { getContributorNames } from '#lib/utils/contributor.ts';
import {
	COMMUNICATION_TYPE_BADGE_LABELS,
	COMMUNICATION_TYPE_CHIP_LABELS,
	COMMUNICATION_TYPE_LIST_LABELS
} from '#lib/utils/typeUtils.ts';

// --- Co-authors, keyed on people ---

const credits = (comm: CommunicationSummary): Credit[] =>
	(comm.authors ?? []).map((contributor) =>
		typeof contributor === 'string'
			? { name: contributor }
			: { name: contributor.name, personId: contributor.personId }
	);

const people = buildPersonFacet(allCommunications.flatMap(credits));
const siteAuthorKey = people.alias(siteAuthor.name);

/** A talk's co-presenters as facet keys, the site's own author left out. */
const coAuthorKeys = (comm: CommunicationSummary): string[] =>
	[...new Set(credits(comm).map(people.keyOf))].filter((key) => key !== siteAuthorKey);

// --- Computed unique values ---

// One-shot build-time tallies over a fixed dataset, never reactive state.

const allCoAuthors = Array.from(new Set(allCommunications.flatMap(coAuthorKeys))).sort((a, b) =>
	people.label(a).localeCompare(people.label(b))
);

/** A talk's languages, from a list or a comma-separated field. */
const talkLanguages = (comm: CommunicationSummary): string[] =>
	!comm.language
		? []
		: Array.isArray(comm.language)
			? comm.language
			: comm.language.split(',').map((l) => l.trim());

const allLanguages = Array.from(new Set(allCommunications.flatMap(talkLanguages))).sort();

const allCountries = Object.keys(communicationsByCountry || {});

const allProjects = Array.from(
	new Set(allCommunications.filter((comm) => comm.project).map((comm) => comm.project as string))
).sort();

// --- Facet ordering by frequency ---
// Tags and co-authors surface most-used first so the truncated sidebar facet
// lists show the meaningful ones; ties fall back to alphabetical.

const tagFrequency = countOccurrences(allCommunications.map((comm) => comm.tags ?? []));
const coAuthorFrequency = countOccurrences(allCommunications.map(coAuthorKeys));

// Countries by how many talks were held there: alphabetical and cut at eight,
// the list hid the United States (12) while printing Cameroon (1).
const countryFrequency = countOccurrences(
	allCommunications.map((comm) => (comm.country ? [comm.country] : []))
);

// --- Slides: a one-value facet over the talks whose deck is published ---

export const WITH_SLIDES = 'With slides';
const slidesOf = (comm: CommunicationSummary) => (comm.slidesUrl ? WITH_SLIDES : undefined);

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

type Talk = CommunicationSummary;

export const communicationFilters = new EntityFilterSystem({
	items: allCommunications,
	searchFields: communicationSearchFields,
	matchesYearRange: (comm: Talk, range: YearRange) =>
		!!comm.year && comm.year >= range.min && comm.year <= range.max,
	years: Object.keys(communicationsByYear || {})
		.map(Number)
		.sort((a, b) => b - a),
	dimensions: [
		{
			key: 'types',
			param: 'type',
			label: 'Type',
			placement: 'bar-primary',
			options: Object.keys(communicationsByType || {}).sort(),
			match: (comm: Talk, values: string[]) => !!comm.type && values.includes(comm.type),
			countExtractor: (comm: Talk) => comm.type
		},
		{
			key: 'languages',
			param: 'language',
			label: 'Language',
			placement: 'bar-secondary',
			options: allLanguages,
			match: (comm: Talk, values: string[]) => talkLanguages(comm).some((l) => values.includes(l)),
			countExtractor: (comm: Talk) => (comm.language ? talkLanguages(comm) : undefined)
		},
		{
			key: 'projects',
			param: 'project',
			label: 'Projects',
			placement: 'grid-list',
			options: allProjects,
			match: (comm: Talk, values: string[]) => !!comm.project && values.includes(comm.project),
			countExtractor: (comm: Talk) => comm.project
		},
		{
			key: 'authors',
			param: 'author',
			label: 'Co-authors',
			placement: 'grid-list',
			limit: 8,
			options: byFrequencyThenAlpha(allCoAuthors, coAuthorFrequency),
			valueLabel: people.label,
			alias: people.alias,
			match: (comm: Talk, values: string[]) =>
				coAuthorKeys(comm).some((key) => values.includes(key)),
			countExtractor: coAuthorKeys
		},
		{
			key: 'countries',
			param: 'country',
			// Where the talk was given, not what it was about: the publications
			// index reads the same parameter as the countries a work studies.
			label: 'Held in',
			placement: 'grid-list',
			limit: 8,
			noun: 'countries',
			yearsBeside: true,
			options: byFrequencyThenAlpha(allCountries, countryFrequency),
			match: (comm: Talk, values: string[]) => !!comm.country && values.includes(comm.country),
			countExtractor: (comm: Talk) => comm.country
		},
		{
			key: 'tags',
			param: 'tag',
			label: 'Tags',
			placement: 'grid-chips',
			limit: 12,
			alias: tagAlias,
			options: byFrequencyThenAlpha(allTags || [], tagFrequency),
			match: (comm: Talk, values: string[]) =>
				!!comm.tags && comm.tags.some((t) => values.includes(t)),
			countExtractor: (comm: Talk) => comm.tags
		},
		{
			key: 'slides',
			param: 'slides',
			label: 'Slides',
			placement: 'grid-chips',
			options: allCommunications.some((comm) => comm.slidesUrl) ? [WITH_SLIDES] : [],
			match: (comm: Talk, values: string[]) => values.includes(slidesOf(comm) ?? ''),
			countExtractor: slidesOf
		}
	]
});
