/**
 * Activities Filters
 *
 * Instantiates the runed EntityFilterSystem for the /activities log — the same
 * filter architecture as /publications and /conference-activity. The log
 * declares only the two dimensions it has, type and tag.
 */

import type { ActivitySummary, YearRange } from '#lib/types/index.ts';
import {
	activitySummariesByDate as activitiesByDate,
	activitySummariesByYear as activitiesByYear
} from './summaries';
import { EntityFilterSystem, tagAlias } from '#lib/utils/entityFilterSystem.svelte.ts';
import { ACTIVITY_TYPE_BADGE_LABELS } from '#lib/utils/typeUtils.ts';

// --- Vocabularies ---

// Tags ordered by frequency (most used first), ties alphabetical — matches the
// facet ordering convention of the other filter modules.
// eslint-disable-next-line svelte/prefer-svelte-reactivity -- build-time tally, never reactive
const tagFrequency = new Map<string, number>();
for (const activity of activitiesByDate) {
	for (const tag of activity.tags ?? []) {
		tagFrequency.set(tag, (tagFrequency.get(tag) ?? 0) + 1);
	}
}
const allTags = Array.from(tagFrequency.keys()).sort(
	(a, b) => (tagFrequency.get(b) ?? 0) - (tagFrequency.get(a) ?? 0) || a.localeCompare(b)
);

// Types sorted by their display label.
const allTypes = Array.from(
	new Set(activitiesByDate.map((a) => a.type).filter((t): t is string => Boolean(t)))
).sort((a, b) =>
	(ACTIVITY_TYPE_BADGE_LABELS[a] ?? a).localeCompare(ACTIVITY_TYPE_BADGE_LABELS[b] ?? b)
);

// Dimensions activities don't have — empty vocabulary, never matches/counts.

// --- Free-text search ---

/** What the log's search reads: what a row prints (title, date, description, tags, type). */
export function activitySearchFields(activity: ActivitySummary): string[] {
	return [
		activity.title,
		String(activity.year ?? ''),
		activity.date ?? '',
		activity.description ?? '',
		...(activity.tags ?? []),
		activity.type ? (ACTIVITY_TYPE_BADGE_LABELS[activity.type] ?? activity.type) : ''
	];
}

// --- Filter System ---

export const activityFilters = new EntityFilterSystem({
	items: activitiesByDate,
	searchFields: activitySearchFields,
	matchesYearRange: (activity: ActivitySummary, range: YearRange) =>
		activity.year >= range.min && activity.year <= range.max,
	years: Object.keys(activitiesByYear)
		.map(Number)
		.sort((a, b) => b - a),
	// The log offers two facets, drawn by its own page rather than by the
	// entity-index bar and grid.
	dimensions: [
		{
			key: 'types',
			param: 'type',
			label: 'Type',
			placement: 'bar-primary',
			options: allTypes,
			match: (activity: ActivitySummary, values: string[]) =>
				!!activity.type && values.includes(activity.type),
			countExtractor: (activity: ActivitySummary) => activity.type
		},
		{
			key: 'tags',
			param: 'tag',
			label: 'Tags',
			placement: 'grid-chips',
			alias: tagAlias,
			options: allTags,
			match: (activity: ActivitySummary, values: string[]) =>
				!!activity.tags && activity.tags.some((t) => values.includes(t)),
			countExtractor: (activity: ActivitySummary) => activity.tags
		}
	]
});
