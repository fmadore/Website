import { allPublications } from '#lib/data/publications/index.ts';
import { citationContextSets } from '#lib/data/citation-contexts/index.ts';
import { citationsMarkdown } from '#lib/server/markdown/citations.ts';
import { markdownResponse } from '#lib/server/markdown/site.ts';
import { buildCitationContextSections, buildCitingWorkRows } from '#lib/utils/citationContexts.ts';
import type { RequestHandler } from './$types';

/** Every citing work read so far, its passages, and the coverage table, as Markdown. */
export const prerender = true;

export const GET: RequestHandler = () => {
	const sections = buildCitationContextSections(citationContextSets, allPublications);
	return markdownResponse(citationsMarkdown(sections, buildCitingWorkRows(sections)));
};
