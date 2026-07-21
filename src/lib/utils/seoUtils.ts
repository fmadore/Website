import type { Communication } from '$lib/types/communication';
import type { Publication } from '$lib/types';
import type { Activity } from '$lib/types/activity';
import { author } from '$lib/data/siteConfig';
import { smartTruncate } from '$lib/utils/textUtils';
import {
	COMMUNICATION_TYPE_SEO_LABELS,
	PUBLICATION_TYPE_SEO_LABELS,
	ACTIVITY_TYPE_SEO_LABELS
} from '$lib/utils/typeUtils';

// JSON-LD schema construction lives in jsonLdSchemas.ts. Re-exported here
// so existing `$lib/utils/seoUtils` imports keep working unchanged.
export * from '$lib/utils/jsonLdSchemas';

// ============================================================================
// SEO DESCRIPTION GENERATORS
// ============================================================================

/** The common 160-char SERP budget shared by all description builders. */
const SEO_DESCRIPTION_LIMIT = 160;

interface SeoDescriptionParts {
	/** Front-loaded lead, e.g. "Book: Title". */
	lead: string;
	/** Full context sentence (leading space included), e.g. " Presented at X, 2024." */
	contextSentence?: string;
	/** Compact fallback used when the full sentence doesn't fit and the lead is short. */
	contextCompact?: string;
	/** Abstract to fill remaining space with (smart-truncated). */
	abstract?: string;
	/** Used verbatim when everything else produced an empty string. */
	fallback: string;
}

/**
 * Shared SEO description algorithm (publications + communications):
 * front-loaded lead → context sentence if it fits (compact variant when the
 * lead is short) → abstract fill → 160-char smart truncation → fallback.
 */
function buildSeoDescription({
	lead,
	contextSentence,
	contextCompact,
	abstract,
	fallback
}: SeoDescriptionParts): string {
	let description = lead;

	if (contextSentence) {
		if ((description + contextSentence).length <= SEO_DESCRIPTION_LIMIT) {
			description += contextSentence;
		} else if (description.length < 100 && contextCompact) {
			if ((description + contextCompact).length <= SEO_DESCRIPTION_LIMIT) {
				description += contextCompact;
			}
		}
	}

	// If we have space and an abstract, add a summary
	if (abstract && description.length < 120) {
		const remainingSpace = SEO_DESCRIPTION_LIMIT - description.length - 1; // -1 for space
		const abstractPreview = smartTruncate(abstract, remainingSpace);
		if (abstractPreview.length > 20) {
			// Only add if meaningful content
			description += ` ${abstractPreview}`;
		}
	}

	if (description.length > SEO_DESCRIPTION_LIMIT) {
		description = smartTruncate(description, SEO_DESCRIPTION_LIMIT);
	}

	return description.trim() ? description : fallback;
}

/**
 * Creates an optimized SEO description for communication pages
 *
 * Best practices applied:
 * - 150-160 characters optimal length for Google SERPs
 * - Front-loads important keywords (type, topic, location)
 * - Uses smart truncation to avoid cutting mid-sentence
 * - Fallback logic for missing fields
 */
export function createCommunicationSEODescription(communication: Communication): string {
	const { type, title, conference, location, country, year, abstract, authors } = communication;

	const typeLabel = (type && COMMUNICATION_TYPE_SEO_LABELS[type]) || 'Academic presentation';
	const lead = type && title ? `${typeLabel}: ${title}` : (title ?? '');

	// Location and year context (highly valuable for academic presentations)
	const locationInfo = [];
	if (conference) locationInfo.push(conference);
	if (location && location !== conference) locationInfo.push(location);
	if (country && !location?.includes(country)) locationInfo.push(country);
	if (year) locationInfo.push(year.toString());

	const authorText = authors?.length ? ` by ${authors[0]}` : '';
	const eventText = conference ? ` at ${conference}` : '';
	const yearText = year ? ` (${year})` : '';

	return buildSeoDescription({
		lead,
		contextSentence:
			locationInfo.length > 0 ? ` Presented at ${locationInfo.join(', ')}.` : undefined,
		contextCompact: ` at ${conference || location || country || year}`,
		abstract,
		fallback: `Academic presentation${eventText}${authorText}${yearText}`
	});
}

/**
 * Creates optimized keywords for communication pages
 * Combines communication-specific terms with general academic keywords
 */
export function createCommunicationSEOKeywords(communication: Communication): string {
	const keywords = new Set<string>();

	// Add communication-specific keywords
	if (communication.type) keywords.add(communication.type);
	if (communication.tags) communication.tags.forEach((tag) => keywords.add(tag));
	if (communication.authors) communication.authors.forEach((author) => keywords.add(author));
	if (communication.country) keywords.add(communication.country);
	if (communication.language) {
		if (Array.isArray(communication.language)) {
			communication.language.forEach((lang) => keywords.add(lang));
		} else {
			keywords.add(communication.language);
		}
	}

	// Add context-appropriate academic keywords
	keywords.add('academic presentation');
	if (communication.type === 'conference') keywords.add('conference paper');
	if (communication.type === 'workshop') keywords.add('workshop presentation');

	// Add subject-matter keywords based on typical content
	keywords.add('Islam');
	keywords.add('West Africa');
	keywords.add('digital humanities');
	keywords.add(author.name);

	return Array.from(keywords).join(', ');
}

/**
 * Helper to truncate titles for breadcrumbs and titles
 * Used to prevent overly long titles in page headers
 */
export function truncateTitle(title: string, maxLength: number = 50): string {
	if (title.length <= maxLength) return title;

	// Check for natural break points like colons
	const colonIndex = title.indexOf(':');
	if (colonIndex > 0 && colonIndex < maxLength) {
		return title.substring(0, colonIndex) + '...';
	}

	// Otherwise truncate at word boundary
	const truncated = title.substring(0, maxLength);
	const lastSpace = truncated.lastIndexOf(' ');
	return lastSpace > maxLength * 0.6
		? title.substring(0, lastSpace) + '...'
		: title.substring(0, maxLength - 3) + '...';
}

/**
 * Creates an optimized SEO description for publication pages
 *
 * Best practices applied:
 * - 150-160 characters optimal length for Google SERPs
 * - Front-loads important keywords (type, journal/publisher, year)
 * - Uses smart truncation to avoid cutting mid-sentence
 * - Includes publication venue information
 * - Fallback logic for missing fields
 */
export function createPublicationSEODescription(publication: Publication): string {
	const { type, title, journal, publisher, book, year, abstract, authors, placeOfPublication } =
		publication;

	const typeLabel = PUBLICATION_TYPE_SEO_LABELS[type] || 'Academic publication';
	const lead = type && title ? `${typeLabel}: ${title}` : (title ?? '');

	// Publication venue context (highly valuable for academic publications)
	const venueInfo = [];
	if (type === 'article' || type === 'special-issue') {
		if (journal) venueInfo.push(journal);
	} else if (type === 'chapter') {
		if (book) venueInfo.push(`in ${book}`);
	} else if (type === 'book' || type === 'report') {
		if (publisher) venueInfo.push(publisher);
		if (placeOfPublication) venueInfo.push(placeOfPublication);
	} else if (type === 'encyclopedia') {
		if (publication.encyclopediaTitle) venueInfo.push(publication.encyclopediaTitle);
	} else if (type === 'masters-thesis' || type === 'phd-dissertation') {
		if (publication.university) venueInfo.push(publication.university);
	}
	if (year) venueInfo.push(year.toString());

	const authorText = authors?.length ? ` by ${authors[0]}` : '';
	const yearText = year ? ` (${year})` : '';

	return buildSeoDescription({
		lead,
		contextSentence: venueInfo.length > 0 ? ` Published in ${venueInfo.join(', ')}.` : undefined,
		contextCompact: ` (${venueInfo[0] || year})`,
		abstract,
		fallback: `${typeLabel}${authorText}${yearText}`
	});
}

/**
 * Creates optimized keywords for publication pages
 * Combines publication-specific terms with general academic keywords
 */
export function createPublicationSEOKeywords(publication: Publication): string {
	const keywords = new Set<string>();

	// Add publication-specific keywords
	if (publication.type) keywords.add(publication.type);
	if (publication.tags) publication.tags.forEach((tag) => keywords.add(tag));
	if (publication.authors) publication.authors.forEach((author) => keywords.add(author));
	if (publication.language) keywords.add(publication.language);

	// Add venue-specific keywords
	if (publication.journal) keywords.add(publication.journal);
	if (publication.publisher) keywords.add(publication.publisher);
	if (publication.book) keywords.add(publication.book);

	// Add context-appropriate academic keywords
	keywords.add('academic publication');
	if (publication.type === 'article') keywords.add('journal article');
	if (publication.type === 'book') keywords.add('academic book');
	if (publication.type === 'chapter') keywords.add('book chapter');

	// Add subject-matter keywords based on typical content
	keywords.add('Islam');
	keywords.add('West Africa');
	keywords.add('digital humanities');
	keywords.add(author.name);

	// Add research-specific terms
	if (publication.project) keywords.add(publication.project);

	return Array.from(keywords).join(', ');
}

/**
 * Creates an optimized SEO description for activity pages treated as blog posts
 *
 * Blog post SEO best practices applied:
 * - 150-160 characters optimal length for better click-through rates
 * - Front-loads value proposition and key takeaways
 * - Uses action-oriented language and engagement hooks
 * - Includes relevant context (dates, topics, outcomes)
 * - Smart truncation that preserves readability
 * - Focus on reader benefits rather than just event details
 */
export function createActivitySEODescription(activity: Activity): string {
	const { title, description, type, year, tags } = activity;

	// Get blog-friendly type label from centralized mapping
	const getBlogTypeLabel = (type?: string): string =>
		ACTIVITY_TYPE_SEO_LABELS[type || ''] || 'Academic update';

	// Start with the activity description (primary content)
	let seoDescription = description || '';

	// If description is too short or missing, build one from available data
	if (!seoDescription || seoDescription.length < 50) {
		const typeLabel = getBlogTypeLabel(type);
		const yearText = year ? ` (${year})` : '';

		// Create engaging blog-style description
		if (type === 'publication') {
			seoDescription = `Latest publication update${yearText}: ${title}`;
		} else if (type === 'grant') {
			seoDescription = `Research funding news${yearText}: ${title}`;
		} else if (['conference', 'workshop', 'panel'].includes(type || '')) {
			seoDescription = `${typeLabel} from ${title}${yearText}`;
		} else {
			seoDescription = `${typeLabel}${yearText}: ${title}`;
		}
	}

	// Add contextual keywords if we have space and they add value
	const remainingSpace = 160 - seoDescription.length;
	if (remainingSpace > 20 && tags && tags.length > 0) {
		// Add relevant tags that provide additional context
		const contextTags = tags
			.filter((tag) =>
				['Digital Humanities', 'Islam', 'West Africa', 'Research', 'Academic'].some((keyword) =>
					tag.toLowerCase().includes(keyword.toLowerCase())
				)
			)
			.slice(0, 2); // Limit to 2 most relevant tags

		if (contextTags.length > 0) {
			const tagText = ` Topics: ${contextTags.join(', ')}.`;
			if (tagText.length <= remainingSpace) {
				seoDescription += tagText;
			}
		}
	}

	// Add engaging call-to-action if space allows
	if (seoDescription.length < 140) {
		// Choose CTA based on activity type
		let cta = 'Learn more →';
		if (type === 'publication') cta = 'Read details →';
		else if (type === 'conference' || type === 'workshop') cta = 'Read insights →';
		else if (type === 'grant') cta = 'Discover details →';

		if (seoDescription.length + cta.length + 1 <= 160) {
			seoDescription += ` ${cta}`;
		}
	}

	// Ensure optimal length (150-160 characters)
	if (seoDescription.length > 160) {
		seoDescription = smartTruncate(seoDescription, 160);
	}

	// Final fallback if somehow we don't have content
	if (!seoDescription.trim()) {
		const typeLabel = getBlogTypeLabel(type);
		const yearText = year ? ` ${year}` : '';
		seoDescription = `${typeLabel}${yearText} by ${author.name}`;
	}

	return seoDescription;
}

/**
 * Creates optimized keywords for activity pages treated as blog posts
 * Focuses on blog-relevant keywords, topics, and searchable terms
 */
export function createActivitySEOKeywords(activity: Activity): string {
	const keywords = new Set<string>();

	// Add activity-specific keywords
	if (activity.type) {
		// Map activity types to blog-friendly keywords
		const typeKeywords: Record<string, string[]> = {
			conference: ['conference', 'academic conference', 'research presentation'],
			workshop: ['workshop', 'academic workshop', 'professional development'],
			seminar: ['seminar', 'academic seminar', 'research seminar'],
			lecture: ['lecture', 'academic lecture', 'keynote'],
			panel: ['panel discussion', 'academic panel', 'expert panel'],
			grant: ['research grant', 'funding', 'academic funding'],
			publication: ['publication', 'academic publication', 'research'],
			event: ['academic event', 'scholarly event'],
			visit: ['academic visit', 'research visit', 'collaboration'],
			news: ['academic news', 'research news', 'updates']
		};

		const relatedKeywords = typeKeywords[activity.type] || ['academic activity'];
		relatedKeywords.forEach((keyword) => keywords.add(keyword));
	}

	// Add tag-based keywords (these are often topical)
	if (activity.tags) {
		activity.tags.forEach((tag) => keywords.add(tag));
	}

	// Add blog-relevant keywords
	keywords.add('blog post');
	keywords.add('academic blog');
	keywords.add('research update');

	// Add author/personal branding keywords
	keywords.add(author.name);
	keywords.add('digital humanities');
	keywords.add('Islam studies');
	keywords.add('West Africa research');
	keywords.add('academic researcher');

	// Add year if available (helps with temporal searches)
	if (activity.year) {
		keywords.add(activity.year.toString());
	}

	// Add content-type specific keywords
	if (activity.content) {
		// Add generic content keywords for blog posts
		keywords.add('analysis');
		keywords.add('insights');
		keywords.add('findings');
	}

	// Add geographic keywords if commonly relevant
	keywords.add('Africa');
	keywords.add('Francophone Africa');

	// Add methodological keywords common to digital humanities
	keywords.add('research methods');
	keywords.add('academic research');

	return Array.from(keywords).slice(0, 15).join(', '); // Limit to 15 most relevant keywords
}
