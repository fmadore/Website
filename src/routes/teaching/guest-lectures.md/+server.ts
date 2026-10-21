import { allLectures } from '#lib/server/teachingLectures.ts';
import { guestLecturesMarkdown } from '#lib/server/markdown/teaching.ts';
import { markdownResponse } from '#lib/server/markdown/site.ts';
import type { RequestHandler } from './$types';

/** Every guest lecture and workshop, under the institution that hosted it, as Markdown. */
export const prerender = true;

export const GET: RequestHandler = () => markdownResponse(guestLecturesMarkdown(allLectures));
