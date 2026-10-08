import { error } from '@sveltejs/kit';
import { allResearchProjects } from '$lib/data/research';
import { researchProjectMarkdown } from '$lib/server/markdown/research';
import { markdownResponse } from '$lib/server/markdown/site';
import type { EntryGenerator, RequestHandler } from './$types';

/**
 * A research project's Markdown twin. The project pages are literal routes
 * (`/research/<id>`), since each authors its prose in its own markup; the
 * twins share one parameterised route, read that markup, and need no page of
 * their own.
 */
export const prerender = true;

/** Every record gets a twin, as every record gets a page: see publications/[id]/+page.server.ts. */
export const entries: EntryGenerator = () => allResearchProjects.map(({ id }) => ({ id }));

export const GET: RequestHandler = ({ params }) => {
	const record = allResearchProjects.find((item) => item.id === params.id);
	if (!record) error(404, 'Project not found');
	return markdownResponse(researchProjectMarkdown(record));
};
