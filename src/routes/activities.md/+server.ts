import { activitiesByDate } from '#lib/data/activities/index.ts';
import { activitiesIndexMarkdown } from '#lib/server/markdown/activities.ts';
import { markdownResponse } from '#lib/server/markdown/site.ts';
import type { RequestHandler } from './$types';

/** Every activity, which the HTML log shows a page at a time. */
export const prerender = true;

export const GET: RequestHandler = () =>
	markdownResponse(activitiesIndexMarkdown(activitiesByDate));
