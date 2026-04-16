import type { Activity } from '$lib/types';
import { getYearFromISODate } from '$lib/utils/date-formatter';
import { sortByDate } from '$lib/utils/dataAggregation';
import { loadData } from '$lib/utils/dataLoader';

// Dynamically import all activity files
const activityModules = import.meta.glob<Record<string, Activity>>('./*.ts', { eager: true });

// Load and validate activities using loadData, filtering out template
const allActivities: Activity[] = loadData<Activity>(
	activityModules,
	'activity-template-id',
	'activity'
);

// Sort by date (most recent first)
export const activitiesByDate = sortByDate(allActivities);

// Group activities by year (uses dateISO year when available, falls back to activity.year)
export const activitiesByYear = allActivities.reduce<Record<number, Activity[]>>(
	(acc, activity) => {
		const year = activity.dateISO ? getYearFromISODate(activity.dateISO) : activity.year;

		if (!acc[year]) {
			acc[year] = [];
		}
		acc[year].push(activity);
		return acc;
	},
	{}
);

// Group activities by type (conference, workshop, lecture, etc.). Activities
// without an explicit type are bucketed under "Other" so the visualisations
// don't silently drop them.
export const activitiesByType = allActivities.reduce<Record<string, Activity[]>>(
	(acc, activity) => {
		const type = activity.type?.trim() || 'other';
		if (!acc[type]) {
			acc[type] = [];
		}
		acc[type].push(activity);
		return acc;
	},
	{}
);

// Sorted list of unique activity types
export const activityTypes = Object.keys(activitiesByType).sort();

// Tag frequency map — number of activities carrying each tag
export const activityTagCounts = allActivities.reduce<Record<string, number>>((acc, activity) => {
	activity.tags?.forEach((tag) => {
		const trimmed = tag.trim();
		if (!trimmed) return;
		acc[trimmed] = (acc[trimmed] || 0) + 1;
	});
	return acc;
}, {});

// Unique list of all tags used across activities (sorted alphabetically)
export const allActivityTags = Object.keys(activityTagCounts).sort();

// Group activities by country (requires location.country to be set)
export const activitiesByCountry = allActivities.reduce<Record<string, Activity[]>>(
	(acc, activity) => {
		const country = activity.location?.country?.trim();
		if (!country) return acc;
		if (!acc[country]) {
			acc[country] = [];
		}
		acc[country].push(activity);
		return acc;
	},
	{}
);

// Group activities by series (lecture cycles, grant programmes, etc.)
export const activitiesBySeries = allActivities.reduce<Record<string, Activity[]>>(
	(acc, activity) => {
		const series = activity.series?.trim();
		if (!series) return acc;
		if (!acc[series]) {
			acc[series] = [];
		}
		acc[series].push(activity);
		return acc;
	},
	{}
);

// Export the full list of activities
export { allActivities };
