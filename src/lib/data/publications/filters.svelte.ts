/**
 * Publications Filters
 *
 * Instantiates the runed EntityFilterSystem for the /publications index.
 * Publication-specific behavior (author extraction from editors/ToC)
 * is handled via dimension match functions.
 */

import { countOccurrences, byFrequencyThenAlpha } from '#lib/utils/facetOrdering.ts';
import type { PublicationSummary, YearRange } from '#lib/types/index.ts';
import {
	allPublicationSummaries,
	publicationSummariesByType,
	publicationSummariesByYear,
	publicationSummaryTags
} from './summaries';
import { EntityFilterSystem, tagAlias } from '#lib/utils/entityFilterSystem.svelte.ts';
import { buildPersonFacet, type Credit } from '#lib/utils/personFacet.ts';
import {
	PUBLICATION_TYPE_BADGE_LABELS,
	PUBLICATION_TYPE_CHIP_LABELS,
	PUBLICATION_TYPE_FILTER_LABELS as typeLabels
} from '#lib/utils/publicationTypeLabels.ts';
import { isForthcoming } from '#lib/utils/date-formatter.ts';
import { splitNames } from '#lib/utils/nameUtils.ts';
import { getContributorNames } from '#lib/utils/contributor.ts';
import { author } from '#lib/data/siteConfig.ts';

// The index filters over the summaries: every facet, count and sort key below
// is a summary field, so the page never pays for abstracts or citation lists.
type Pub = PublicationSummary;

const allPublications: Pub[] = allPublicationSummaries;

// --- Domain-specific helpers ---

function extractEditors(publication: Pub): string[] {
	if (!publication.editors) return [];
	return typeof publication.editors === 'string'
		? splitNames(publication.editors)
		: publication.editors;
}

/** A chapter's or entry's `editors` edited the host volume, not this work. */
function creditsEditors(publication: Pub): boolean {
	return publication.type !== 'chapter' && publication.type !== 'encyclopedia';
}

/** A comma-separated `language` field as its values. */
function publicationLanguages(publication: Pub): string[] {
	return publication.language ? publication.language.split(',').map((l) => l.trim()) : [];
}

// --- Co-authors, keyed on people ---

/** Every credit the author facet counts on a work, with its person id where the record has one. */
function publicationCredits(pub: Pub): Credit[] {
	const fromAuthors: Credit[] = (pub.authors ?? []).map((contributor) =>
		typeof contributor === 'string'
			? { name: contributor }
			: { name: contributor.name, personId: contributor.personId }
	);
	const named = [
		...(creditsEditors(pub) ? extractEditors(pub) : []),
		...(pub.prefacedBy ? [pub.prefacedBy] : []),
		...pub.tocAuthors
	].map((name): Credit => ({ name }));
	return [...fromAuthors, ...named];
}

const people = buildPersonFacet(allPublications.flatMap(publicationCredits));

/**
 * Everyone the author facet credits with a publication, as facet keys: its
 * authors, its editors (unless they edited the host volume), the preface's
 * author, and the table of contents' contributors (projected into the summary
 * by the generator). One definition for the vocabulary, the frequency order,
 * the match and the count, so the four can never disagree about who is in a work.
 */
function publicationAuthorKeys(pub: Pub): string[] {
	return [...new Set(publicationCredits(pub).map(people.keyOf))];
}

// --- Computed unique values ---

// Every value below is a one-shot build-time tally over a fixed dataset, never
// reactive state, hence the plain Set.

const siteAuthorKey = people.alias(author.name);
const allAuthorKeys = Array.from(new Set(allPublications.flatMap(publicationAuthorKeys)))
	.filter((key) => key !== siteAuthorKey)
	.sort((a, b) => people.label(a).localeCompare(people.label(b)));

const allCountries = Array.from(new Set(allPublications.flatMap((pub) => pub.country || [])));

const allProjects = Array.from(
	new Set(allPublications.map((pub) => pub.project).filter(Boolean) as string[])
).sort();

const uniqueLanguages = Array.from(new Set(allPublications.flatMap(publicationLanguages))).sort();

// --- Facet ordering by frequency ---
// Tags and authors surface most-used first so the truncated sidebar facet lists
// show the meaningful ones; ties fall back to alphabetical.

const tagFrequency = countOccurrences(allPublications.map((pub) => pub.tags ?? []));
const authorFrequency = countOccurrences(allPublications.map(publicationAuthorKeys));
// Countries too: alphabetical and cut at eight, the list hid busy countries
// behind the combobox while printing ones studied once.
const countryFrequency = countOccurrences(allPublications.map((pub) => pub.country ?? []));

// --- Access and status: one- and two-value facets over flags the records carry ---

export const OPEN_ACCESS = 'Open access';
export const PUBLISHED = 'Published';
export const FORTHCOMING = 'Forthcoming';

const accessOf = (pub: Pub) => (pub.openAccess ? OPEN_ACCESS : undefined);
const statusOf = (pub: Pub) => (isForthcoming(pub) ? FORTHCOMING : PUBLISHED);

// --- Free-text search ---

/**
 * What the search box reads: everything a row prints, so a word the reader
 * can see on the page finds its row. That is the title, year and date (which
 * carries "Forthcoming"), the credited names, the venue, the tags, the opening
 * of the abstract the row shows, the type in each of the forms the page prints
 * it, the countries studied and the project.
 */
export function publicationSearchFields(pub: Pub): string[] {
	return [
		pub.title,
		String(pub.year ?? ''),
		pub.date ?? '',
		isForthcoming(pub) ? 'Forthcoming' : '',
		...getContributorNames(pub.authors),
		...extractEditors(pub),
		pub.journal ?? '',
		pub.book ?? '',
		pub.publisher ?? '',
		pub.encyclopediaTitle ?? '',
		pub.proceedingsTitle ?? '',
		pub.series ?? '',
		...(pub.tags ?? []),
		pub.abstractExcerpt ?? '',
		PUBLICATION_TYPE_BADGE_LABELS[pub.type] ?? '',
		typeLabels[pub.type] ?? '',
		PUBLICATION_TYPE_CHIP_LABELS[pub.type] ?? '',
		...(pub.country ?? []),
		pub.project ?? ''
	];
}

// --- Filter System ---

export const publicationFilters = new EntityFilterSystem({
	items: allPublications,
	searchFields: publicationSearchFields,
	matchesYearRange: (pub: Pub, range: YearRange) => pub.year >= range.min && pub.year <= range.max,
	years: Object.keys(publicationSummariesByYear)
		.map(Number)
		.sort((a, b) => b - a),
	dimensions: [
		{
			key: 'types',
			param: 'type',
			label: 'Type',
			placement: 'bar-primary',
			options: Object.keys(publicationSummariesByType).sort((a, b) =>
				(typeLabels[a] || a).localeCompare(typeLabels[b] || b)
			),
			match: (pub: Pub, values: string[]) => values.includes(pub.type),
			countExtractor: (pub: Pub) => pub.type
		},
		{
			key: 'languages',
			param: 'language',
			label: 'Language',
			placement: 'bar-secondary',
			options: uniqueLanguages,
			match: (pub: Pub, values: string[]) =>
				publicationLanguages(pub).some((l) => values.includes(l)),
			countExtractor: publicationLanguages
		},
		{
			key: 'projects',
			param: 'project',
			label: 'Projects',
			placement: 'grid-list',
			options: allProjects,
			match: (pub: Pub, values: string[]) => !!pub.project && values.includes(pub.project),
			countExtractor: (pub: Pub) => pub.project
		},
		{
			key: 'authors',
			param: 'author',
			label: 'Co-authors',
			placement: 'grid-list',
			limit: 8,
			options: byFrequencyThenAlpha(allAuthorKeys, authorFrequency),
			valueLabel: people.label,
			alias: people.alias,
			match: (pub: Pub, values: string[]) =>
				publicationAuthorKeys(pub).some((key) => values.includes(key)),
			countExtractor: publicationAuthorKeys
		},
		{
			key: 'countries',
			param: 'country',
			// The countries a work is about, not where it appeared: on the talks
			// index the same parameter means where a talk was held, and each
			// heading says so.
			label: 'Countries studied',
			placement: 'grid-list',
			limit: 8,
			noun: 'countries',
			yearsBeside: true,
			options: byFrequencyThenAlpha(allCountries, countryFrequency),
			match: (pub: Pub, values: string[]) =>
				!!pub.country && pub.country.some((c) => values.includes(c)),
			countExtractor: (pub: Pub) => pub.country
		},
		{
			key: 'tags',
			param: 'tag',
			label: 'Tags',
			placement: 'grid-chips',
			limit: 12,
			alias: tagAlias,
			options: byFrequencyThenAlpha(publicationSummaryTags, tagFrequency),
			match: (pub: Pub, values: string[]) => !!pub.tags && pub.tags.some((t) => values.includes(t)),
			countExtractor: (pub: Pub) => pub.tags
		},
		{
			key: 'access',
			param: 'access',
			label: 'Access',
			placement: 'grid-chips',
			options: allPublications.some((pub) => pub.openAccess) ? [OPEN_ACCESS] : [],
			match: (pub: Pub, values: string[]) => values.includes(accessOf(pub) ?? ''),
			countExtractor: accessOf
		},
		{
			key: 'status',
			param: 'status',
			label: 'Status',
			placement: 'grid-chips',
			// Offered only when the corpus holds both: one value is no choice.
			options: allPublications.some((pub) => isForthcoming(pub)) ? [PUBLISHED, FORTHCOMING] : [],
			match: (pub: Pub, values: string[]) => values.includes(statusOf(pub)),
			countExtractor: statusOf
		}
	]
});
