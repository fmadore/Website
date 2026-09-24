import { citedReferences } from '$lib/server/references';
import type { PageServerLoad } from './$types';

/** The project cites publications and talks inline: send just those entries. */
export const load: PageServerLoad = citedReferences;
