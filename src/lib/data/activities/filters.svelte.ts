/**
 * Activities Filters
 *
 * Instantiates the runed EntityFilterSystem for the /activities log — the same
 * filter architecture as /publications and /conference-activity. Activities
 * only carry type/tag/year dimensions; the system's remaining dimensions
 * (languages, authors, countries, projects) are declared as inert no-ops with
 * empty vocabularies so no UI or URL surface ever exercises them.
 */

import type { Activity, YearRange } from '$lib/types';
import { activitiesByDate, activitiesByYear } from './index';
import {
	EntityFilterSystem,
	type EntityArrayDimension
} from '$lib/utils/entityFilterSystem.svelte';
import { ACTIVITY_TYPE_BADGE_LABELS } from '$lib/utils/typeUtils';

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
const inertDimension: EntityArrayDimension<Activity> = {
	match: () => true,
	countExtractor: () => undefined
};

// --- Filter System ---

export const activityFilters = new EntityFilterSystem<Activity>({
	items: activitiesByDate,
	matchesYearRange: (activity: Activity, range: YearRange) =>
		activity.year >= range.min && activity.year <= range.max,
	dimensions: {
		types: {
			match: (activity: Activity, values: string[]) =>
				!!activity.type && values.includes(activity.type),
			countExtractor: (activity: Activity) => activity.type
		},
		tags: {
			match: (activity: Activity, values: string[]) =>
				!!activity.tags && activity.tags.some((t) => values.includes(t)),
			countExtractor: (activity: Activity) => activity.tags
		},
		languages: inertDimension,
		authors: inertDimension,
		countries: inertDimension,
		projects: inertDimension
	},
	filterOptions: {
		types: allTypes,
		years: Object.keys(activitiesByYear)
			.map(Number)
			.sort((a, b) => b - a),
		tags: allTags,
		languages: [],
		authors: [],
		countries: [],
		projects: []
	}
});
