import { describe, it, expect } from 'vitest';

import { allActivities, activitiesByDate, activitiesByYear } from '$lib/data/activities';
import {
	allActivitySummaries,
	activitySummariesByDate,
	activitySummariesByYear
} from '$lib/data/activities/summaries';
import { HEAVY_ACTIVITY_FIELDS } from '$lib/data/activities/summaryConfig';

/**
 * The committed summaries must be a faithful projection of the full dataset:
 * this is what lets the /activities log, its year pages and the style guide
 * drop the entries' bodies without rendering anything differently. It fails
 * when a data file changes without `npm run gen:summaries` (CI also runs the
 * generator's --check).
 */

const summariesById = new Map(allActivitySummaries.map((s) => [s.id, s]));

describe('activity summaries', () => {
	it('cover exactly the activities the full index ships', () => {
		expect(allActivitySummaries.map((s) => s.id).sort()).toEqual(
			allActivities.map((a) => a.id).sort()
		);
	});

	it('arrive in the same order as the full index', () => {
		expect(allActivitySummaries.map((s) => s.id)).toEqual(allActivities.map((a) => a.id));
		expect(activitySummariesByDate.map((s) => s.id)).toEqual(activitiesByDate.map((a) => a.id));
	});

	it('group by year exactly as the full index does', () => {
		const ids = (groups: Record<number, { id: string }[]>) =>
			Object.fromEntries(
				Object.entries(groups).map(([year, items]) => [year, items.map((i) => i.id)])
			);
		expect(ids(activitySummariesByYear)).toEqual(ids(activitiesByYear));
	});

	it('carry none of the heavy fields', () => {
		for (const summary of allActivitySummaries) {
			for (const field of HEAVY_ACTIVITY_FIELDS) {
				expect(field in summary, `${summary.id} carries ${field}`).toBe(false);
			}
		}
	});

	it('keep every other field identical to the full record', () => {
		for (const activity of allActivities) {
			const summary = summariesById.get(activity.id);
			expect(summary, `no summary for ${activity.id}`).toBeDefined();
			const heavy: readonly string[] = HEAVY_ACTIVITY_FIELDS;
			for (const [key, value] of Object.entries(activity)) {
				if (heavy.includes(key)) continue;
				expect(summary![key as keyof typeof summary], `${activity.id}.${key}`).toEqual(value);
			}
		}
	});
});
