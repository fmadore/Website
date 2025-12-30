import type { Activity } from '$lib/types/activity';
import { author, contact, website } from '$lib/data/siteConfig';
import { getRssDescription, getEmailWithName } from '$lib/utils/siteHelpers';

// ============================================================================
// RSS FEED CONFIGURATION
// ============================================================================

export interface RSSFeedConfig {
	title: string;
	description: string;
	siteUrl: string;
	feedUrl: string;
	language?: string;
	copyright?: string;
	managingEditor?: string;
	webMaster?: string;
	lastBuildDate?: Date;
	ttl?: number; // Time to live in minutes
	imageUrl?: string;
	imageTitle?: string;
	imageLink?: string;
}

export interface RSSItem {
	title: string;
	link: string;
	description: string;
	pubDate: Date;
	guid: string;
	author?: string;
	categories?: string[];
	content?: string; // For content:encoded extension
}

// ============================================================================
// DEFAULT CONFIGURATION
// ============================================================================

export const DEFAULT_RSS_CONFIG: RSSFeedConfig = {
	title: `${author.name} - Activities`,
	description: getRssDescription(),
	siteUrl: website.url,
	feedUrl: `${website.url}${website.rssPath}`,
	language: 'en-us',
	copyright: `Copyright ${new Date().getFullYear()} ${author.name}. All rights reserved.`,
	managingEditor: getEmailWithName(),
	webMaster: getEmailWithName(),
	ttl: 60, // Cache for 1 hour
	imageUrl: `${website.url}/images/Profile-picture.webp`,
	imageTitle: author.name,
	imageLink: website.url
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Escapes special XML characters in a string
 */
function escapeXml(text: string): string {
	return text
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&apos;');
}

/**
 * Wraps content in CDATA section for RSS content:encoded
 */
function wrapCDATA(content: string): string {
	return `<![CDATA[${content}]]>`;
}

/**
 * Formats a Date object to RFC 822 format required by RSS 2.0
 * Example: "Mon, 06 Sep 2021 00:00:00 GMT"
 */
function formatRFC822Date(date: Date): string {
	return date.toUTCString();
}

/**
 * Strips HTML tags from a string for plain text description
 */
function stripHtml(html: string): string {
	return html
		.replace(/<[^>]*>/g, '')
		.replace(/\s+/g, ' ')
		.trim();
}

/**
 * Truncates text to a specified length, preserving word boundaries
 */
function truncateText(text: string, maxLength: number = 300): string {
	if (text.length <= maxLength) return text;
	const truncated = text.substring(0, maxLength);
	const lastSpace = truncated.lastIndexOf(' ');
	return lastSpace > 0 ? truncated.substring(0, lastSpace) + '...' : truncated + '...';
}

// ============================================================================
// ACTIVITY TO RSS ITEM CONVERSION
// ============================================================================

/**
 * Converts an Activity to an RSS item
 */
export function activityToRSSItem(activity: Activity, siteUrl: string): RSSItem {
	// Parse the date from ISO format or display date
	const pubDate = activity.dateISO
		? new Date(activity.dateISO)
		: new Date(activity.date);

	// Generate description from activity description or content
	let description = activity.description;
	if (!description && activity.content) {
		description = truncateText(stripHtml(activity.content), 300);
	}

	// Build the item
	return {
		title: activity.title,
		link: `${siteUrl}/activities/${activity.id}`,
		description: description || 'No description available',
		pubDate,
		guid: `${siteUrl}/activities/${activity.id}`,
		author: author.name,
		categories: activity.tags || [],
		content: activity.content
	};
}

// ============================================================================
// RSS FEED GENERATION
// ============================================================================

/**
 * Generates an RSS 2.0 compliant XML feed
 */
export function generateRSSFeed(items: RSSItem[], config: RSSFeedConfig = DEFAULT_RSS_CONFIG): string {
	const lastBuildDate = config.lastBuildDate || new Date();

	// Build the channel element
	let channel = `
    <title>${escapeXml(config.title)}</title>
    <link>${escapeXml(config.siteUrl)}</link>
    <description>${escapeXml(config.description)}</description>
    <language>${config.language || 'en-us'}</language>
    <lastBuildDate>${formatRFC822Date(lastBuildDate)}</lastBuildDate>
    <atom:link href="${escapeXml(config.feedUrl)}" rel="self" type="application/rss+xml"/>`;

	// Optional channel elements
	if (config.copyright) {
		channel += `\n    <copyright>${escapeXml(config.copyright)}</copyright>`;
	}
	if (config.managingEditor) {
		channel += `\n    <managingEditor>${escapeXml(config.managingEditor)}</managingEditor>`;
	}
	if (config.webMaster) {
		channel += `\n    <webMaster>${escapeXml(config.webMaster)}</webMaster>`;
	}
	if (config.ttl) {
		channel += `\n    <ttl>${config.ttl}</ttl>`;
	}

	// Channel image
	if (config.imageUrl) {
		channel += `
    <image>
      <url>${escapeXml(config.imageUrl)}</url>
      <title>${escapeXml(config.imageTitle || config.title)}</title>
      <link>${escapeXml(config.imageLink || config.siteUrl)}</link>
    </image>`;
	}

	// Build items
	const itemsXml = items
		.map((item) => {
			let itemXml = `
    <item>
      <title>${escapeXml(item.title)}</title>
      <link>${escapeXml(item.link)}</link>
      <description>${escapeXml(item.description)}</description>
      <pubDate>${formatRFC822Date(item.pubDate)}</pubDate>
      <guid isPermaLink="true">${escapeXml(item.guid)}</guid>`;

			if (item.author) {
				itemXml += `\n      <author>${escapeXml(item.author)}</author>`;
			}

			// Add categories
			if (item.categories && item.categories.length > 0) {
				item.categories.forEach((category) => {
					itemXml += `\n      <category>${escapeXml(category)}</category>`;
				});
			}

			// Add full content using content:encoded extension
			if (item.content) {
				itemXml += `\n      <content:encoded>${wrapCDATA(item.content)}</content:encoded>`;
			}

			itemXml += '\n    </item>';
			return itemXml;
		})
		.join('');

	// Assemble the full RSS feed
	return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" 
  xmlns:atom="http://www.w3.org/2005/Atom"
  xmlns:content="http://purl.org/rss/1.0/modules/content/"
  xmlns:dc="http://purl.org/dc/elements/1.1/">
  <channel>${channel}${itemsXml}
  </channel>
</rss>`;
}

/**
 * Generates an RSS feed from an array of activities
 */
export function generateActivitiesRSSFeed(
	activities: Activity[],
	config: Partial<RSSFeedConfig> = {}
): string {
	const fullConfig = { ...DEFAULT_RSS_CONFIG, ...config };

	// Convert activities to RSS items
	const items = activities.map((activity) =>
		activityToRSSItem(activity, fullConfig.siteUrl)
	);

	// Sort by date (most recent first)
	items.sort((a, b) => b.pubDate.getTime() - a.pubDate.getTime());

	// Limit to most recent 50 items for performance
	const limitedItems = items.slice(0, 50);

	return generateRSSFeed(limitedItems, fullConfig);
}
