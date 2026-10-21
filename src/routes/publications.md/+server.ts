import { publicationsByDate } from '#lib/data/publications/index.ts';
import { publicationsIndexMarkdown } from '#lib/server/markdown/publications.ts';
import { markdownResponse } from '#lib/server/markdown/site.ts';
import type { RequestHandler } from './$types';

/** Every publication, which the HTML index shows a page at a time. */
export const prerender = true;

export const GET: RequestHandler = () =>
	markdownResponse(publicationsIndexMarkdown(publicationsByDate));
