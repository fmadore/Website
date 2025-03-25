import { writable } from 'svelte/store';
import { allActivities, activitiesByDate } from '../data/activities';
import type { Activity } from '$lib/types';

// Re-export the Activity type for backward compatibility
export type { Activity };

// Create a writable store with the activities from our data files
export const activities = writable<Activity[]>(activitiesByDate);

// Helper function to add a new activity
export function addActivity(activity: Activity) {
    activities.update(items => {
        return [activity, ...items];
    });
}

// Helper function to get activities by year
export function getActivitiesByYear(year: number) {
    let filteredActivities: Activity[] = [];
    
    activities.subscribe(value => {
        filteredActivities = value.filter(activity => activity.year === year);
    })();
    
    return filteredActivities;
}

// Helper function to get an activity by ID
export function getActivityById(id: string): Activity | undefined {
    let activity: Activity | undefined;
    
    activities.subscribe(value => {
        activity = value.find(a => a.id === id);
    })();
    
    return activity;
} 