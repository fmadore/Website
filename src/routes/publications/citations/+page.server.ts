import { allPublications } from '#lib/data/publications/index.ts';
import { citationContextSets } from '#lib/data/citation-contexts/index.ts';
import { buildCitationContextSections, buildCitingWorkRows } from '#lib/utils/citationContexts.ts';
import type { PageServerLoad } from './$types';

/**
 * Server-side, so the page receives the joined rows rather than importing the
 * full publication dataset (whose `citedBy` lists the summaries drop) and the
 * quotations into its bundle.
 */
export const load: PageServerLoad = () => {
	const sections = buildCitationContextSections(citationContextSets, allPublications);
	const byline = (entry: { authors: string[]; year: number; title: string }) => ({
		authors: entry.authors,
		year: entry.year,
		title: entry.title
	});
	return {
		works: buildCitingWorkRows(sections),
		coverage: sections.map((section) => ({
			id: section.id,
			title: section.title,
			year: section.year,
			quoted: section.quoted.length,
			passages: section.passageCount,
			bibliographyOnly: section.bibliographyOnly.map(byline),
			unread: section.unread.map(byline),
			pending: section.pending.length,
			entries: section.entryCount
		})),
		models: [...new Set(sections.map((section) => section.model))]
	};
};
