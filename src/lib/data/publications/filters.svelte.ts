/**
 * Publications Filters
 *
 * Instantiates the runed EntityFilterSystem for the /publications index.
 * Publication-specific behavior (author extraction from editors/ToC)
 * is handled via dimension match functions.
 */

import type { PublicationSummary, YearRange } from '$lib/types';
import {
	allPublicationSummaries,
	publicationSummariesByType,
	publicationSummariesByYear,
	publicationSummaryTags
} from './summaries';
import { EntityFilterSystem } from '$lib/utils/entityFilterSystem.svelte';
import { PUBLICATION_TYPE_FILTER_LABELS as typeLabels } from '$lib/utils/publicationTypeLabels';
import { splitNames } from '$lib/utils/nameUtils';
import { author } from '$lib/data/siteConfig';

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

/**
 * Everyone the author facet credits with a publication: its authors, its
 * editors (unless they edited the host volume), the preface's author, and the
 * table of contents' contributors (projected into the summary by the
 * generator). One definition for the vocabulary, the frequency order, the
 * match and the count, so the four can never disagree about who is in a work.
 */
function publicationAuthorNames(pub: Pub): string[] {
	const names = [
		...(pub.authors ?? []),
		...(creditsEditors(pub) ? extractEditors(pub) : []),
		...(pub.prefacedBy ? [pub.prefacedBy] : []),
		...pub.tocAuthors
	];
	return names.filter((name, i) => names.indexOf(name) === i);
}

// --- Computed unique values ---

// Every value below is a one-shot build-time tally over a fixed dataset, never
// reactive state, hence the plain Set.
/* eslint-disable svelte/prefer-svelte-reactivity */
export const allAuthors = Array.from(new Set(allPublications.flatMap(publicationAuthorNames)))
	.filter((name: string) => name !== author.name)
	.sort();

const allCountries = Array.from(
	new Set(allPublications.flatMap((pub) => pub.country || []))
).sort();

const allProjects = Array.from(
	new Set(allPublications.map((pub) => pub.project).filter(Boolean) as string[])
).sort();

const uniqueLanguages = Array.from(new Set(allPublications.flatMap(publicationLanguages))).sort();
/* eslint-enable svelte/prefer-svelte-reactivity */

// --- Facet ordering by frequency ---
// Tags and authors surface most-used first so the truncated sidebar facet lists
// show the meaningful ones; ties fall back to alphabetical.
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

const tagFrequency = countOccurrences(allPublications.map((pub) => pub.tags ?? []));
const authorFrequency = countOccurrences(allPublications.map(publicationAuthorNames));

// --- Filter System ---

export const publicationFilters = new EntityFilterSystem<Pub>({
	items: allPublications,
	matchesYearRange: (pub: Pub, range: YearRange) => pub.year >= range.min && pub.year <= range.max,
	dimensions: {
		types: {
			match: (pub: Pub, values: string[]) => values.includes(pub.type),
			countExtractor: (pub: Pub) => pub.type
		},
		tags: {
			match: (pub: Pub, values: string[]) => !!pub.tags && pub.tags.some((t) => values.includes(t)),
			countExtractor: (pub: Pub) => pub.tags
		},
		languages: {
			match: (pub: Pub, values: string[]) =>
				publicationLanguages(pub).some((l) => values.includes(l)),
			countExtractor: publicationLanguages
		},
		authors: {
			match: (pub: Pub, values: string[]) =>
				publicationAuthorNames(pub).some((name) => values.includes(name)),
			countExtractor: publicationAuthorNames
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
		types: Object.keys(publicationSummariesByType).sort((a, b) => {
			const labelA = typeLabels[a] || a;
			const labelB = typeLabels[b] || b;
			return labelA.localeCompare(labelB);
		}),
		years: Object.keys(publicationSummariesByYear)
			.map(Number)
			.sort((a, b) => b - a),
		tags: byFrequencyThenAlpha(publicationSummaryTags, tagFrequency),
		languages: uniqueLanguages,
		authors: byFrequencyThenAlpha(allAuthors, authorFrequency),
		countries: allCountries,
		projects: allProjects
	}
});
