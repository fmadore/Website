import { cvMarkdown } from '#lib/server/markdown/cv.ts';
import { markdownResponse } from '#lib/server/markdown/site.ts';
import type { RequestHandler } from './$types';

/** The full CV as Markdown, from the same records the HTML CV prints. */
export const prerender = true;

export const GET: RequestHandler = () => markdownResponse(cvMarkdown());
