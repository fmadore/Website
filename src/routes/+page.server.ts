import type { PageServerLoad } from './$types';
import { createFullPersonSchema } from '$lib/server/personSchema';
import { activitiesByDate } from '$lib/data/activities';
import { summariseActivityLog } from '$lib/utils/activityLog';
import { citedReferences } from '$lib/server/references';

/**
 * Home page load: provides the full Person schema (the rich superset of the
 * layout's base Person schema, sharing the same `@id`) for the ProfilePage
 * structured data. All biographical fields are derived from the data in
 * `$lib/data/` — see `createFullPersonSchema` in `$lib/server/personSchema.ts`.
 */
export const load: PageServerLoad = (event) => {
	return {
		personSchema: createFullPersonSchema(),
		// The latest-activities rail, as five rows and a year meter — not the
		// activity dataset (every entry's HTML body) it is computed from.
		activityLog: summariseActivityLog(activitiesByDate, 5),
		// The reference-index entries the page's inline citations need.
		...citedReferences(event)
	};
};
