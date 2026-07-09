/**
 * Read-only accessors over the activities data.
 *
 * The list is static (built from `$lib/data/activities` at module load); these
 * helpers exist so consumers share one import point and an id lookup.
 */

import { activitiesByDate } from '../data/activities';
import type { Activity } from '$lib/types';

// Re-export the Activity type for backward compatibility
export type { Activity };

/**
 * Get all activities, newest first
 */
export function getActivities(): Activity[] {
	return activitiesByDate;
}

/**
 * Get a single activity by ID
 */
export function getActivityById(id: string): Activity | undefined {
	return activitiesByDate.find((a) => a.id === id);
}
