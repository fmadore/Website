import teaching from '$lib/data/teaching';
import { allLectures } from '$lib/server/teachingLectures';
import { teachingMarkdown } from '$lib/server/markdown/teaching';
import { markdownResponse } from '$lib/server/markdown/site';
import type { RequestHandler } from './$types';

/** The courses taught and the guest lectures and workshops by host, as Markdown. */
export const prerender = true;

export const GET: RequestHandler = () => markdownResponse(teachingMarkdown(teaching, allLectures));
