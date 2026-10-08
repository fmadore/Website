import { cvMarkdown } from '$lib/server/markdown/cv';
import { markdownResponse } from '$lib/server/markdown/site';
import type { RequestHandler } from './$types';

/** The full CV as Markdown, from the same records the HTML CV prints. */
export const prerender = true;

export const GET: RequestHandler = () => markdownResponse(cvMarkdown());
