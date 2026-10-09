import guestLectures from '$lib/data/teaching/guest-lectures';
import { guestLecturesMarkdown } from '$lib/server/markdown/teaching';
import { markdownResponse } from '$lib/server/markdown/site';
import type { RequestHandler } from './$types';

/** Every guest lecture, under the institution that hosted it, as Markdown. */
export const prerender = true;

export const GET: RequestHandler = () => markdownResponse(guestLecturesMarkdown(guestLectures));
