import { activitySummariesByDate } from '#lib/data/activities/summaries.ts';

/**
 * Every year with an entry gets a page. Until this export the route prerendered
 * only because the /activities meter happens to link every year; a year the
 * index stopped linking would have dropped out of the build while the
 * year-step links still pointed at it. No `load`: the page reads the summaries
 * it already imports, so the client fetches no data for it.
 */
export const entries = () =>
	[...new Set(activitySummariesByDate.map(({ year }) => year))].map((year) => ({
		year: String(year)
	}));
