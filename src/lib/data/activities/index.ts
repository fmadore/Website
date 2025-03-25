import type { Activity } from '$lib/types';
import { getYearFromISODate } from '$lib/utils/date-formatter';

// Import all activity files
const activityFiles = [
    import('./religious-activism-campuses'),
    import('./etablir-faitiere-islamique'),
    import('./author-meets-critic'),
    import('./guest-lecture-florida')
];

// Convert the modules to an array of activities
const allActivities: Activity[] = await Promise.all(
    activityFiles.map(async (module) => {
        const activity = Object.values(await module)[0] as Activity;
        return activity;
    })
);

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
export const activitiesByYear = allActivities.reduce<Record<number, Activity[]>>((acc, activity) => {
    // Get year from dateISO if available, otherwise use activity.year
    const year = activity.dateISO 
        ? getYearFromISODate(activity.dateISO) 
        : activity.year;
        
    if (!acc[year]) {
        acc[year] = [];
    }
    acc[year].push(activity);
    return acc;
}, {});

// Export the full list of activities
export { allActivities }; 