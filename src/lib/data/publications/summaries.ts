/**
 * The publication summaries and the collections the list pages derive from
 * them — the counterpart of ./index.ts for pages that list publications
 * without opening them (/publications, /cv, the research pages, the style
 * guide). Same ordering and grouping helpers as the full index, applied to the
 * generated projection, so a list built here matches one built there row for
 * row. The publication page and the visualisations keep the full index.
 */
import type { PublicationSummary } from '$lib/types';
import { isForthcoming } from '$lib/utils/date-formatter';
import {
	sortByDate,
	groupByYear,
	groupByField,
	extractUniqueTags
} from '$lib/utils/dataAggregation';
import { publicationSummaries } from './summaries.generated';

export const allPublicationSummaries: PublicationSummary[] = publicationSummaries;

// Sort by date (most recent first), with forthcoming items floated to the top.
const dateSorted = sortByDate(allPublicationSummaries);
export const publicationSummariesByDate = [
	...dateSorted.filter(isForthcoming),
	...dateSorted.filter((p) => !isForthcoming(p))
];

export const publicationSummariesByYear = groupByYear(allPublicationSummaries);
export const publicationSummariesByType = groupByField(allPublicationSummaries, 'type');
export const publicationSummaryTags = extractUniqueTags(allPublicationSummaries, 'tags');
