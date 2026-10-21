import { error } from '@sveltejs/kit';
import { allCommunications } from '#lib/data/communications/index.ts';
import { communicationMarkdown } from '#lib/server/markdown/communications.ts';
import { markdownResponse } from '#lib/server/markdown/site.ts';
import type { EntryGenerator, RequestHandler } from './$types';

/** A talk's Markdown twin: abstract, programme and participants. */
export const prerender = true;

/** Every record gets a twin, as every record gets a page: see publications/[id]/+page.server.ts. */
export const entries: EntryGenerator = () => allCommunications.map(({ id }) => ({ id }));

export const GET: RequestHandler = ({ params }) => {
	const record = allCommunications.find((item) => item.id === params.id);
	if (!record) error(404, 'Talk not found');
	return markdownResponse(communicationMarkdown(record));
};
