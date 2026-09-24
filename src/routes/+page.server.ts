import type { PageServerLoad } from './$types';
import { createFullPersonSchema } from '$lib/server/personSchema';

/**
 * Home page load: provides the full Person schema (the rich superset of the
 * layout's base Person schema, sharing the same `@id`) for the ProfilePage
 * structured data. All biographical fields are derived from the data in
 * `$lib/data/` — see `createFullPersonSchema` in `$lib/server/personSchema.ts`.
 */
export const load: PageServerLoad = () => {
	return {
		personSchema: createFullPersonSchema()
	};
};
