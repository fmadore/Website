import teaching from '$lib/data/teaching';
import guestLectures from '$lib/data/teaching/guest-lectures';
import { teachingMarkdown } from '$lib/server/markdown/teaching';
import { markdownResponse } from '$lib/server/markdown/site';
import type { RequestHandler } from './$types';

/** The courses taught and the guest lectures by host, as Markdown. */
export const prerender = true;

export const GET: RequestHandler = () =>
	markdownResponse(teachingMarkdown(teaching, guestLectures));
