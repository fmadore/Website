/**
 * The home page's latest-activities feed, as data: the newest entries and the
 * size of the log. Computed by the home page's server load, so the page ships
 * four titles and a count instead of the activity dataset they come from.
 */
import type { Activity } from '#lib/types/activity.ts';

/** One entry in the feed. */
export interface ActivityLogEntry {
	id: string;
	title: string;
	/**
	 * The ISO date the feed's dateline is formatted from. Never the display
	 * `date`: read back through `new Date()`, a display string parses as local
	 * midnight, and east of UTC that is the previous day.
	 */
	dateISO: string;
}

export interface ActivityLog {
	/** How many entries the whole log holds. */
	total: number;
	latest: ActivityLogEntry[];
}

/** The first `limit` entries of `activities` (newest first), and the log's size. */
export function summariseActivityLog(
	activities: readonly Pick<Activity, 'id' | 'title' | 'dateISO'>[],
	limit: number
): ActivityLog {
	return {
		total: activities.length,
		latest: activities.slice(0, limit).map(({ id, title, dateISO }) => ({ id, title, dateISO }))
	};
}
