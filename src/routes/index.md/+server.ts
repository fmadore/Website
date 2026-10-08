import { homeMarkdown } from '$lib/server/markdown/home';
import { markdownResponse } from '$lib/server/markdown/site';
import type { RequestHandler } from './$types';

/** The home page's Markdown twin (llms.txt v2: a URL with no filename takes `index.md`). */
export const prerender = true;

export const GET: RequestHandler = () => markdownResponse(homeMarkdown());
