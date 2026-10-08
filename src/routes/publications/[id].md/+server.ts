import { error } from '@sveltejs/kit';
import { allPublications } from '$lib/data/publications/index';
import { publicationMarkdown } from '$lib/server/markdown/publications';
import { markdownResponse } from '$lib/server/markdown/site';
import type { EntryGenerator, RequestHandler } from './$types';

/** A publication's Markdown twin: reference, abstract, apparatus and BibTeX. */
export const prerender = true;

/** Every record gets a twin, as every record gets a page: see publications/[id]/+page.server.ts. */
export const entries: EntryGenerator = () => allPublications.map(({ id }) => ({ id }));

export const GET: RequestHandler = ({ params }) => {
	const record = allPublications.find((item) => item.id === params.id);
	if (!record) error(404, 'Publication not found');
	return markdownResponse(publicationMarkdown(record));
};
