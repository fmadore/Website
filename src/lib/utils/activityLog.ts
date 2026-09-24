/**
 * The home page's latest-activities rail, as data: the newest entries and the
 * per-year meter. Computed by the home page's server load, so the page ships
 * five titles and a dozen counts instead of the activity dataset they come
 * from.
 */
import type { Activity } from '$lib/types/activity';

/** One row of the rail's ledger. */
export interface ActivityLogEntry {
	id: string;
	title: string;
	/** The display date the ledger key is formatted from. */
	date: string;
}

/** One row of the "Browse by year" meter. */
export interface ActivityLogYear {
	year: number;
	count: number;
	/** Bar length as a percentage of the busiest year. */
	pct: number;
}

export interface ActivityLog {
	/** How many entries the whole log holds. */
	total: number;
	latest: ActivityLogEntry[];
	/** Newest year first. */
	years: ActivityLogYear[];
}

/**
 * The rail for `activities` (newest first): the first `limit` entries, and a
 * meter row per year — counted on the record's `year` — scaled so the busiest
 * year fills the bar.
 */
export function summariseActivityLog(
	activities: readonly Pick<Activity, 'id' | 'title' | 'date' | 'year'>[],
	limit: number
): ActivityLog {
	const counts = new Map<number, number>();
	for (const { year } of activities) counts.set(year, (counts.get(year) ?? 0) + 1);
	const busiest = Math.max(1, ...counts.values());
	return {
		total: activities.length,
		latest: activities.slice(0, limit).map(({ id, title, date }) => ({ id, title, date })),
		years: [...counts]
			.map(([year, count]) => ({ year, count, pct: (count / busiest) * 100 }))
			.sort((a, b) => b.year - a.year)
	};
}
