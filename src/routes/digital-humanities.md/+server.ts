import { allDhProjects } from '#lib/data/digital-humanities/index.ts';
import { dhIndexMarkdown } from '#lib/server/markdown/digitalHumanities.ts';
import { markdownResponse } from '#lib/server/markdown/site.ts';
import type { RequestHandler } from './$types';

/** Every digital humanities project, which the HTML index shows a page at a time. */
export const prerender = true;

export const GET: RequestHandler = () => markdownResponse(dhIndexMarkdown(allDhProjects));
