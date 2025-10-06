/**
 * Activities Store using Svelte 5 State Runes
 *
 * Manages the list of academic activities with reactive state.
 */

import { activitiesByDate } from '../data/activities';
import type { Activity } from '$lib/types';

// Re-export the Activity type for backward compatibility
export type { Activity };

// Svelte 5: Create reactive state using runes
let activityList = $state<Activity[]>(activitiesByDate);

/**
 * Get all activities (reactive in component context)
 */
export function getActivities() {
	return activityList;
}

/**
 * Set the entire activities list
 */
export function setActivities(value: Activity[]) {
	activityList = value;
}

/**
 * Add a new activity to the list
 */
export function addActivity(activity: Activity) {
	activityList = [activity, ...activityList];
}

/**
 * Get activities filtered by year
 */
export function getActivitiesByYear(year: number): Activity[] {
	return activityList.filter((activity) => activity.year === year);
}

/**
 * Get a single activity by ID
 */
export function getActivityById(id: string): Activity | undefined {
	return activityList.find((a) => a.id === id);
}
