/**
 * The talk summaries and the collections built from them — the counterpart of
 * ./index.ts for every page that lists talks without opening one (the
 * /conference-activity index and its slides and visualisations pages, the CV,
 * the timeline, the research projects, the style guide). Same ordering and
 * grouping helpers as the full index, applied to the generated projection, so
 * a list built here matches one built there row for row. Only the talk record
 * page (/communications/[id]) and the server endpoints that serialise whole
 * records keep the full index.
 */
import type { CommunicationSummary } from '$lib/types/communication';
import {
	sortByDate,
	groupByYear,
	groupByField,
	extractUniqueTags
} from '$lib/utils/dataAggregation';
import { communicationSummaries } from './summaries.generated';

export const allCommunicationSummaries: CommunicationSummary[] = communicationSummaries;

// Sort by date (most recent first).
export const communicationSummariesByDate = sortByDate(allCommunicationSummaries);

// Talks that ship an embeddable slide deck, newest first — the Slides gallery.
export const communicationSummariesWithSlides = communicationSummariesByDate.filter(
	(comm) => !!comm.slidesUrl
);

// Group by year, type, country, and project.
export const communicationSummariesByYear = groupByYear(allCommunicationSummaries);
export const communicationSummariesByType = groupByField(allCommunicationSummaries, 'type');
export const communicationSummariesByCountry = groupByField(allCommunicationSummaries, 'country');
export const communicationSummariesByProject = groupByField(allCommunicationSummaries, 'project');

// All unique tags, for the facet vocabulary.
export const communicationSummaryTags = extractUniqueTags(allCommunicationSummaries, 'tags');
