import { communicationsByDate } from '#lib/data/communications/index.ts';
import { talksIndexMarkdown } from '#lib/server/markdown/communications.ts';
import { markdownResponse } from '#lib/server/markdown/site.ts';
import type { RequestHandler } from './$types';

/** Every talk, which the HTML index shows a page at a time. */
export const prerender = true;

export const GET: RequestHandler = () => markdownResponse(talksIndexMarkdown(communicationsByDate));
