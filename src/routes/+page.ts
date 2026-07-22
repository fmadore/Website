import type { PageLoad } from './$types';
import { createFullPersonSchema } from '$lib/utils/jsonLdSchemas';

/**
 * Home page load: provides the full Person schema (the rich superset of the
 * layout's base Person schema, sharing the same `@id`) for the ProfilePage
 * structured data. All biographical fields are derived from the data in
 * `$lib/data/` — see `createFullPersonSchema` in `$lib/utils/jsonLdSchemas.ts`.
 */
export const load: PageLoad = () => {
	return {
		personSchema: createFullPersonSchema()
	};
};
