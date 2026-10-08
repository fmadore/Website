import { publicationsByDate } from '$lib/data/publications/index';
import { publicationsIndexMarkdown } from '$lib/server/markdown/publications';
import { markdownResponse } from '$lib/server/markdown/site';
import type { RequestHandler } from './$types';

/** Every publication, which the HTML index shows a page at a time. */
export const prerender = true;

export const GET: RequestHandler = () =>
	markdownResponse(publicationsIndexMarkdown(publicationsByDate));
