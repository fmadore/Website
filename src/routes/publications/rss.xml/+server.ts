import { allPublications } from '$lib/data/publications/index';
import { generatePublicationsRSSFeed } from '$lib/utils/rss';
import type { RequestHandler } from '@sveltejs/kit';

// Prerender this endpoint for static site generation
export const prerender = true;

/**
 * Publications RSS Feed Endpoint
 *
 * The highest-value feed for academic subscribers: new books, articles, and
 * chapters as they are added. Mirrors /rss.xml (activities); advertised via
 * <link rel="alternate"> in SEO.svelte and robots.txt.
 */
export const GET: RequestHandler = async () => {
	const rssFeed = generatePublicationsRSSFeed(allPublications, {
		lastBuildDate: new Date()
	});

	return new Response(rssFeed, {
		headers: {
			'Content-Type': 'application/rss+xml; charset=utf-8',
			'Cache-Control': 'max-age=3600, s-maxage=3600', // Cache for 1 hour
			'X-Content-Type-Options': 'nosniff'
		}
	});
};
