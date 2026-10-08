import { activitiesByDate } from '$lib/data/activities';
import { activitiesIndexMarkdown } from '$lib/server/markdown/activities';
import { markdownResponse } from '$lib/server/markdown/site';
import type { RequestHandler } from './$types';

/** Every activity, which the HTML log shows a page at a time. */
export const prerender = true;

export const GET: RequestHandler = () =>
	markdownResponse(activitiesIndexMarkdown(activitiesByDate));
