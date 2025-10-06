import type { Activity } from '$lib/types';
import { getYearFromISODate } from '$lib/utils/date-formatter';

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
export const activitiesByDate = [...allActivities].sort((a, b) => {
	// Use dateISO for sorting if available, otherwise fall back to the current method
	if (a.dateISO && b.dateISO) {
		return new Date(b.dateISO).getTime() - new Date(a.dateISO).getTime();
	}

	// Fallback to current method for backwards compatibility
	const dateA = new Date(a.date);
	const dateB = new Date(b.date);
	return dateB.getTime() - dateA.getTime();
});

// Group activities by year
export const activitiesByYear = allActivities.reduce<Record<number, Activity[]>>(
	(acc, activity) => {
		// Get year from dateISO if available, otherwise use activity.year
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
