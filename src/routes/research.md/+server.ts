import { allResearchProjects } from '$lib/data/research';
import { researchIndexMarkdown } from '$lib/server/markdown/research';
import { markdownResponse } from '$lib/server/markdown/site';
import type { RequestHandler } from './$types';

/** The research section's Markdown twin. */
export const prerender = true;

export const GET: RequestHandler = () =>
	markdownResponse(researchIndexMarkdown(allResearchProjects));
