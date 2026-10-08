import { error } from '@sveltejs/kit';
import { allActivities } from '$lib/data/activities';
import { activityMarkdown } from '$lib/server/markdown/activities';
import { markdownResponse } from '$lib/server/markdown/site';
import type { EntryGenerator, RequestHandler } from './$types';

/** An activity's Markdown twin, its HTML body converted. */
export const prerender = true;

/** Every record gets a twin, as every record gets a page: see publications/[id]/+page.server.ts. */
export const entries: EntryGenerator = () => allActivities.map(({ id }) => ({ id }));

export const GET: RequestHandler = ({ params }) => {
	const record = allActivities.find((item) => item.id === params.id);
	if (!record) error(404, 'Activity not found');
	return markdownResponse(activityMarkdown(record));
};
