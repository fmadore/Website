import type { RequestHandler } from '@sveltejs/kit';
import { buildLlmsTxt } from '$lib/server/llmsTxt';

// Prerendered as a static text file, like the rest of the machine-readable surface.
export const prerender = true;

/**
 * /llms.txt (https://llmstxt.org/): a Markdown map of the site for language
 * models and agents. Built in `$lib/server/llmsTxt`, where its shape is tested.
 */
export const GET: RequestHandler = () =>
	new Response(buildLlmsTxt(), {
		headers: {
			'Content-Type': 'text/plain; charset=utf-8',
			'Cache-Control': 'max-age=3600, s-maxage=3600',
			'X-Content-Type-Options': 'nosniff'
		}
	});
