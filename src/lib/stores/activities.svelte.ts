/**
 * Activities Store using Svelte 5 State Runes
 *
 * Manages the list of academic activities with reactive state.
 * Provides both Svelte 5 direct access and Svelte 4 store compatibility.
 */

import { allActivities, activitiesByDate } from '../data/activities';
import type { Activity } from '$lib/types';

// Re-export the Activity type for backward compatibility
export type { Activity };

// Svelte 5: Create reactive state using runes
let activityList = $state<Activity[]>(activitiesByDate);

/**
 * Store-like interface for activities
 * Provides backward compatibility with the writable store API
 */
export const activities = {
	// Subscribe function for reactive access (Svelte 4 compatibility)
	subscribe(fn: (value: Activity[]) => void) {
		// Use $effect to watch for changes and call the subscriber
		$effect(() => {
			fn(activityList);
		});
		// Return unsubscribe function
		return () => {};
	},

	// Set the entire activities list
	set(value: Activity[]) {
		activityList = value;
	},

	// Update function for compatibility
	update(fn: (value: Activity[]) => Activity[]) {
		activityList = fn(activityList);
	}
};

/**
 * Direct getter function for components using Svelte 5 patterns
 */
export function getActivities() {
	return activityList;
}

/**
 * Helper function to add a new activity
 */
export function addActivity(activity: Activity) {
	activityList = [activity, ...activityList];
}

/**
 * Helper function to get activities by year
 */
export function getActivitiesByYear(year: number): Activity[] {
	return activityList.filter((activity) => activity.year === year);
}

/**
 * Helper function to get an activity by ID
 */
export function getActivityById(id: string): Activity | undefined {
	return activityList.find((a) => a.id === id);
}
