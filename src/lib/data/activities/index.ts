import type { Activity } from '$lib/types';
import { getYearFromISODate } from '$lib/utils/date-formatter';
import { sortByDate } from '$lib/utils/dataAggregation';

// Dynamically import all activity files
const activityModules = import.meta.glob<{ [key: string]: Activity }>('./*.ts', { eager: true });

// Convert the modules to an array of activities, excluding the index file and template
const allActivities: Activity[] = Object.entries(activityModules)
	.filter(([path]) => !path.includes('index.ts') && !path.includes('activity-template.ts'))
	.map(([, module]) => {
		const activity = Object.values(module)[0] as Activity;
		return activity;
	});

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
