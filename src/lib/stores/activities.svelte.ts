/**
 * Read-only accessor over the activity log, for the pages that list it.
 *
 * It serves the summaries (`$lib/data/activities/summaries`): every field but
 * the `content` body, which only the record page prints and which that page
 * receives from its server load. Reaching for the full `$lib/data/activities`
 * index from a list page puts every body back into its bundle.
 */

import { activitySummariesByDate } from '$lib/data/activities/summaries';
import type { ActivitySummary } from '$lib/types';

export type { ActivitySummary };

/** Every activity, newest first. */
export function getActivities(): ActivitySummary[] {
	return activitySummariesByDate;
}
