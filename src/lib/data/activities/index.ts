import { religiousActivismCampuses } from './religious-activism-campuses';
import { etablirFaitiereIslamique } from './etablir-faitiere-islamique';
import { authorMeetsCritic } from './author-meets-critic';
import { guestLectureFlorida } from './guest-lecture-florida';
import type { Activity } from '$lib/types';

// Export individual activities for direct access
export {
    religiousActivismCampuses,
    etablirFaitiereIslamique,
    authorMeetsCritic,
    guestLectureFlorida
};

// Export the full list of activities 
export const allActivities: Activity[] = [
    religiousActivismCampuses,
    etablirFaitiereIslamique,
    authorMeetsCritic,
    guestLectureFlorida
];

// Sorted by date (most recent first)
export const activitiesByDate = [...allActivities].sort((a, b) => {
    // Convert date strings to Date objects for comparison
    const dateA = new Date(a.date);
    const dateB = new Date(b.date);
    return dateB.getTime() - dateA.getTime();
});

// Group activities by year
export const activitiesByYear = allActivities.reduce<Record<number, Activity[]>>((acc, activity) => {
    if (!acc[activity.year]) {
        acc[activity.year] = [];
    }
    acc[activity.year].push(activity);
    return acc;
}, {}); 