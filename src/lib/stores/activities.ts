import { writable } from 'svelte/store';
import { allActivities, activitiesByDate } from '../data/activities';
import type { Activity } from '$lib/types';

// Re-export the Activity type for backward compatibility
export type { Activity };

// Create a writable store with the activities from our data files
// We keep the traditional store pattern for now as it's working well
// and provides good compatibility with the existing codebase
export const activities = writable<Activity[]>(activitiesByDate);

// Helper function to add a new activity
export function addActivity(activity: Activity) {
	activities.update((items) => {
		return [activity, ...items];
	});
}

// Helper function to get activities by year using store subscription
export function getActivitiesByYear(year: number) {
	let filteredActivities: Activity[] = [];

	// Use unsubscribe pattern for one-time read
	const unsubscribe = activities.subscribe((value) => {
		filteredActivities = value.filter((activity) => activity.year === year);
	});
	unsubscribe();

	return filteredActivities;
}

// Helper function to get an activity by ID using store subscription
export function getActivityById(id: string): Activity | undefined {
	let activity: Activity | undefined;

	// Use unsubscribe pattern for one-time read
	const unsubscribe = activities.subscribe((value) => {
		activity = value.find((a) => a.id === id);
	});
	unsubscribe();

	return activity;
}
