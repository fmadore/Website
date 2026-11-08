import { communicationSummariesWithSlides } from '#lib/data/communications/summaries.ts';
import { slidesMarkdown } from '#lib/server/markdown/communications.ts';
import { markdownResponse } from '#lib/server/markdown/site.ts';
import type { RequestHandler } from './$types';

/** Every talk with a slide deck, newest first, as the gallery lists them, as Markdown. */
export const prerender = true;

export const GET: RequestHandler = () =>
	markdownResponse(slidesMarkdown(communicationSummariesWithSlides));
