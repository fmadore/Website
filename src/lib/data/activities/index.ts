import type { Activity } from '$lib/types';
import { getYearFromISODate } from '$lib/utils/date-formatter';
import { sortByDate } from '$lib/utils/dataAggregation';
import { loadData } from '$lib/utils/dataLoader';

// Dynamically import all activity files
const activityModules = import.meta.glob<Record<string, Activity>>('./*.ts', { eager: true });

// Load and validate activities using loadData, filtering out template
const allActivities: Activity[] = loadData<Activity>(activityModules, 'activity-template-id', 'activity');

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

// Export the full list of activities
export { allActivities };
