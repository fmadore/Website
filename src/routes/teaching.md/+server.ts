import teaching from '#lib/data/teaching/index.ts';
import { allLectures } from '#lib/server/teachingLectures.ts';
import { teachingMarkdown } from '#lib/server/markdown/teaching.ts';
import { markdownResponse } from '#lib/server/markdown/site.ts';
import type { RequestHandler } from './$types';

/** The courses taught and the guest lectures and workshops by host, as Markdown. */
export const prerender = true;

export const GET: RequestHandler = () => markdownResponse(teachingMarkdown(teaching, allLectures));
