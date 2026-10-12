import { allPublications } from '$lib/data/publications/index';
import { citationContextSets } from '$lib/data/citation-contexts';
import { buildCitationContextSections } from '$lib/utils/citationContexts';
import type { PageServerLoad } from './$types';

/**
 * Server-side, so the page receives the joined entries rather than importing
 * the full publication dataset (whose `citedBy` lists the summaries drop) and
 * the quotations into its bundle.
 */
export const load: PageServerLoad = () => ({
	sections: buildCitationContextSections(citationContextSets, allPublications)
});
