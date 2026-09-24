/**
 * The activity summaries and the collections built from them — the
 * counterpart of ./index.ts for every page that lists activities without
 * opening one (the /activities log, its year pages, the style guide). Same
 * ordering and grouping as the full index, applied to the generated
 * projection, so a list built here matches one built there row for row. Only
 * the activity record page and the server endpoints (API, RSS, sitemap) read
 * the full index.
 */
import type { ActivitySummary } from '$lib/types/activity';
import { getYearFromISODate } from '$lib/utils/date-formatter';
import { sortByDate } from '$lib/utils/dataAggregation';
import { activitySummaries } from './summaries.generated';

export const allActivitySummaries: ActivitySummary[] = activitySummaries;

// Sort by date (most recent first).
export const activitySummariesByDate = sortByDate(allActivitySummaries);

// Group by year: the dateISO year when there is one, as the full index does.
export const activitySummariesByYear = allActivitySummaries.reduce<
	Record<number, ActivitySummary[]>
>((acc, activity) => {
	const year = activity.dateISO ? getYearFromISODate(activity.dateISO) : activity.year;
	(acc[year] ??= []).push(activity);
	return acc;
}, {});
