import { communicationsByDate } from '$lib/data/communications/index';
import { talksIndexMarkdown } from '$lib/server/markdown/communications';
import { markdownResponse } from '$lib/server/markdown/site';
import type { RequestHandler } from './$types';

/** Every talk, which the HTML index shows a page at a time. */
export const prerender = true;

export const GET: RequestHandler = () => markdownResponse(talksIndexMarkdown(communicationsByDate));
