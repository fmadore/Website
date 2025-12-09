import { activitiesByDate } from '$lib/data/activities';
import { generateActivitiesRSSFeed, DEFAULT_RSS_CONFIG } from '$lib/utils/rss';
import type { RequestHandler } from '@sveltejs/kit';

// Prerender this endpoint for static site generation
export const prerender = true;

/**
 * RSS Feed Endpoint
 *
 * Generates an RSS 2.0 compliant feed of activities.
 * This helps with:
 * - SEO: Search engines can discover new content faster
 * - User engagement: Users can subscribe to updates via feed readers
 * - Content syndication: Other sites can aggregate your content
 *
 * The feed is prerendered and cached for optimal performance.
 */
export const GET: RequestHandler = async () => {
	// Generate the RSS feed from activities
	const rssFeed = generateActivitiesRSSFeed(activitiesByDate, {
		...DEFAULT_RSS_CONFIG,
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
