import { error } from '@sveltejs/kit';
import { allDhProjects } from '$lib/data/digital-humanities';
import { dhProjectMarkdown } from '$lib/server/markdown/digitalHumanities';
import { markdownResponse } from '$lib/server/markdown/site';
import type { EntryGenerator, RequestHandler } from './$types';

/** A digital humanities project's Markdown twin. */
export const prerender = true;

/** Every record gets a twin, as every record gets a page: see publications/[id]/+page.server.ts. */
export const entries: EntryGenerator = () => allDhProjects.map(({ id }) => ({ id }));

export const GET: RequestHandler = ({ params }) => {
	const record = allDhProjects.find((item) => item.id === params.id);
	if (!record) error(404, 'Project not found');
	return markdownResponse(dhProjectMarkdown(record));
};
