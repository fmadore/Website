import type { Communication } from '$lib/types/communication';
import type { Publication } from '$lib/types';
import type { Activity } from '$lib/types/activity';
import { author } from '$lib/data/siteConfig';
import { smartTruncate } from '$lib/utils/textUtils';
import { COMMUNICATION_TYPE_SEO_LABELS, ACTIVITY_TYPE_SEO_LABELS } from '$lib/utils/typeUtils';
import { PUBLICATION_TYPE_SEO_LABELS } from '$lib/utils/publicationTypeLabels';

// JSON-LD schema construction (including `createSectionBreadcrumbs`, whose
// canonical definition lives in jsonLdSchemas.ts) is re-exported here so
// existing `$lib/utils/seoUtils` imports keep working unchanged.
export * from '$lib/utils/jsonLdSchemas';

// ============================================================================
// SEO DESCRIPTION GENERATORS
// ============================================================================

/** The common 160-char SERP budget shared by all description builders. */
const SEO_DESCRIPTION_LIMIT = 160;

/**
 * A description segment: given the entity and the description built so far,
 * returns the text to append (or `''` when it doesn't apply / doesn't fit).
 * Each segment encodes its own fit rules against `SEO_DESCRIPTION_LIMIT`.
 */
type SeoDescriptionSegment<T> = (entity: T, current: string) => string;

/** Per-entity configuration for {@link buildSeoDescription}. */
interface SeoDescriptionConfig<T> {
	/** Front-loaded lead, e.g. "Book: Title". */
	lead: (entity: T) => string;
	/** Ordered appendages (context sentence, abstract, tags, CTA, …). */
	segments: ReadonlyArray<SeoDescriptionSegment<T>>;
	/** Used verbatim when everything else produced an empty string. */
	fallback: (entity: T) => string;
}

/**
 * Shared SEO description algorithm for all entity types:
 * front-loaded lead → each configured segment in order (each enforcing its own
 * fit rules) → 160-char smart truncation → fallback when empty.
 */
function buildSeoDescription<T>(entity: T, config: SeoDescriptionConfig<T>): string {
	let description = config.lead(entity);

	for (const segment of config.segments) {
		description += segment(entity, description);
	}

	if (description.length > SEO_DESCRIPTION_LIMIT) {
		description = smartTruncate(description, SEO_DESCRIPTION_LIMIT);
	}

	return description.trim() ? description : config.fallback(entity);
}

/**
 * Segment factory: full context sentence when it fits within the budget,
 * otherwise a compact variant when the lead is still short (< 100 chars).
 */
function contextSegment<T>(
	sentence: (entity: T) => string | undefined,
	compact: (entity: T) => string | undefined
): SeoDescriptionSegment<T> {
	return (entity, current) => {
		const contextSentence = sentence(entity);
		if (!contextSentence) return '';
		if ((current + contextSentence).length <= SEO_DESCRIPTION_LIMIT) {
			return contextSentence;
		}
		if (current.length < 100) {
			const contextCompact = compact(entity);
			if (contextCompact && (current + contextCompact).length <= SEO_DESCRIPTION_LIMIT) {
				return contextCompact;
			}
		}
		return '';
	};
}

/**
 * Segment factory: fills remaining space with a smart-truncated abstract
 * preview when the description is still under 120 chars and the preview is
 * meaningful (> 20 chars).
 */
function abstractSegment<T>(
	getAbstract: (entity: T) => string | undefined
): SeoDescriptionSegment<T> {
	return (entity, current) => {
		const abstract = getAbstract(entity);
		// If we have space and an abstract, add a summary
		if (abstract && current.length < 120) {
			const remainingSpace = SEO_DESCRIPTION_LIMIT - current.length - 1; // -1 for space
			const abstractPreview = smartTruncate(abstract, remainingSpace);
			if (abstractPreview.length > 20) {
				// Only add if meaningful content
				return ` ${abstractPreview}`;
			}
		}
		return '';
	};
}

// ============================================================================
// SEO KEYWORD GENERATORS
// ============================================================================

/**
 * One keyword source: a static keyword, or a function of the entity returning
 * a keyword, a list of keywords, or a falsy guard result (`undefined` / `false`
 * / `''`) that skips the source entirely. Items inside a returned array are
 * added as-is, mirroring the original unguarded `forEach(add)` loops.
 */
type SeoKeywordSource<T> = string | ((entity: T) => string | readonly string[] | false | undefined);

/** Per-entity configuration for {@link buildSeoKeywords}. */
interface SeoKeywordConfig<T> {
	/** Ordered keyword sources; insertion order is preserved by the Set. */
	sources: ReadonlyArray<SeoKeywordSource<T>>;
	/** Optional cap on the number of keywords kept (in insertion order). */
	limit?: number;
}

/**
 * Shared SEO keyword algorithm for all entity types: evaluate each source in
 * order, dedupe via a Set (insertion order preserved), optionally cap the
 * list, and join with ", ".
 */
function buildSeoKeywords<T>(entity: T, { sources, limit }: SeoKeywordConfig<T>): string {
	const keywords = new Set<string>();

	for (const source of sources) {
		const value = typeof source === 'function' ? source(entity) : source;
		if (!value) continue;
		if (Array.isArray(value)) {
			value.forEach((keyword: string) => keywords.add(keyword));
		} else {
			keywords.add(value as string);
		}
	}

	const list = Array.from(keywords);
	return (limit !== undefined ? list.slice(0, limit) : list).join(', ');
}

// ============================================================================
// COMMUNICATIONS
// ============================================================================

/** Location and year context (highly valuable for academic presentations). */
function communicationLocationInfo({ conference, location, country, year }: Communication) {
	const locationInfo: string[] = [];
	if (conference) locationInfo.push(conference);
	if (location && location !== conference) locationInfo.push(location);
	if (country && !location?.includes(country)) locationInfo.push(country);
	if (year) locationInfo.push(year.toString());
	return locationInfo;
}

const COMMUNICATION_SEO_DESCRIPTION: SeoDescriptionConfig<Communication> = {
	lead: ({ type, title }) => {
		const typeLabel = (type && COMMUNICATION_TYPE_SEO_LABELS[type]) || 'Academic presentation';
		return type && title ? `${typeLabel}: ${title}` : (title ?? '');
	},
	segments: [
		contextSegment(
			(communication) => {
				const locationInfo = communicationLocationInfo(communication);
				return locationInfo.length > 0 ? ` Presented at ${locationInfo.join(', ')}.` : undefined;
			},
			({ conference, location, country, year }) =>
				` at ${conference || location || country || year}`
		),
		abstractSegment(({ abstract }) => abstract)
	],
	fallback: ({ conference, authors, year }) => {
		const authorText = authors?.length ? ` by ${authors[0]}` : '';
		const eventText = conference ? ` at ${conference}` : '';
		const yearText = year ? ` (${year})` : '';
		return `Academic presentation${eventText}${authorText}${yearText}`;
	}
};

const COMMUNICATION_SEO_KEYWORDS: SeoKeywordConfig<Communication> = {
	sources: [
		// Communication-specific keywords
		(communication) => communication.type,
		(communication) => communication.tags,
		(communication) => communication.authors,
		(communication) => communication.country,
		(communication) => communication.language,
		// Context-appropriate academic keywords
		'academic presentation',
		(communication) => communication.type === 'conference' && 'conference paper',
		(communication) => communication.type === 'workshop' && 'workshop presentation',
		// Subject-matter keywords based on typical content
		'Islam',
		'West Africa',
		'digital humanities',
		author.name
	]
};

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
	return buildSeoDescription(communication, COMMUNICATION_SEO_DESCRIPTION);
}

/**
 * Creates optimized keywords for communication pages
 * Combines communication-specific terms with general academic keywords
 */
export function createCommunicationSEOKeywords(communication: Communication): string {
	return buildSeoKeywords(communication, COMMUNICATION_SEO_KEYWORDS);
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

// ============================================================================
// PUBLICATIONS
// ============================================================================

/** Publication venue context (highly valuable for academic publications). */
function publicationVenueInfo(publication: Publication) {
	const { type, journal, publisher, book, year, placeOfPublication } = publication;

	const venueInfo: string[] = [];
	if (type === 'article' || type === 'special-issue') {
		if (journal) venueInfo.push(journal);
	} else if (type === 'chapter') {
		if (book) venueInfo.push(book);
	} else if (type === 'book' || type === 'report') {
		if (publisher) venueInfo.push(publisher);
		if (placeOfPublication) venueInfo.push(placeOfPublication);
	} else if (type === 'encyclopedia') {
		if (publication.encyclopediaTitle) venueInfo.push(publication.encyclopediaTitle);
	} else if (type === 'masters-thesis' || type === 'phd-dissertation') {
		if (publication.university) venueInfo.push(publication.university);
	}
	if (year) venueInfo.push(year.toString());
	return venueInfo;
}

const PUBLICATION_SEO_DESCRIPTION: SeoDescriptionConfig<Publication> = {
	lead: ({ type, title }) => {
		const typeLabel = PUBLICATION_TYPE_SEO_LABELS[type] || 'Academic publication';
		return type && title ? `${typeLabel}: ${title}` : (title ?? '');
	},
	segments: [
		contextSegment(
			(publication) => {
				const venueInfo = publicationVenueInfo(publication);
				return venueInfo.length > 0 ? ` Published in ${venueInfo.join(', ')}.` : undefined;
			},
			(publication) => ` (${publicationVenueInfo(publication)[0] || publication.year})`
		),
		abstractSegment(({ abstract }) => abstract)
	],
	fallback: ({ type, authors, year }) => {
		const typeLabel = PUBLICATION_TYPE_SEO_LABELS[type] || 'Academic publication';
		const authorText = authors?.length ? ` by ${authors[0]}` : '';
		const yearText = year ? ` (${year})` : '';
		return `${typeLabel}${authorText}${yearText}`;
	}
};

const PUBLICATION_SEO_KEYWORDS: SeoKeywordConfig<Publication> = {
	sources: [
		// Publication-specific keywords
		(publication) => publication.type,
		(publication) => publication.tags,
		(publication) => publication.authors,
		(publication) => publication.language,
		// Venue-specific keywords
		(publication) => publication.journal,
		(publication) => publication.publisher,
		(publication) => publication.book,
		// Context-appropriate academic keywords
		'academic publication',
		(publication) => publication.type === 'article' && 'journal article',
		(publication) => publication.type === 'book' && 'academic book',
		(publication) => publication.type === 'chapter' && 'book chapter',
		// Subject-matter keywords based on typical content
		'Islam',
		'West Africa',
		'digital humanities',
		author.name,
		// Research-specific terms
		(publication) => publication.project
	]
};

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
	return buildSeoDescription(publication, PUBLICATION_SEO_DESCRIPTION);
}

/**
 * Creates optimized keywords for publication pages
 * Combines publication-specific terms with general academic keywords
 */
export function createPublicationSEOKeywords(publication: Publication): string {
	return buildSeoKeywords(publication, PUBLICATION_SEO_KEYWORDS);
}

// ============================================================================
// ACTIVITIES
// ============================================================================

/** Get blog-friendly type label from centralized mapping */
const getBlogTypeLabel = (type?: string): string =>
	ACTIVITY_TYPE_SEO_LABELS[type || ''] || 'Academic update';

const ACTIVITY_SEO_DESCRIPTION: SeoDescriptionConfig<Activity> = {
	lead: ({ title, description, type, year }) => {
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
		return seoDescription;
	},
	segments: [
		// Contextual tag keywords, added only when they fit and add value
		({ tags }, current) => {
			const remainingSpace = SEO_DESCRIPTION_LIMIT - current.length;
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
						return tagText;
					}
				}
			}
			return '';
		},
		// Engaging call-to-action if space allows
		({ type }, current) => {
			if (current.length < 140) {
				// Choose CTA based on activity type
				let cta = 'Learn more →';
				if (type === 'publication') cta = 'Read details →';
				else if (type === 'conference' || type === 'workshop') cta = 'Read insights →';
				else if (type === 'grant') cta = 'Discover details →';

				if (current.length + cta.length + 1 <= SEO_DESCRIPTION_LIMIT) {
					return ` ${cta}`;
				}
			}
			return '';
		}
	],
	fallback: ({ type, year }) => {
		const typeLabel = getBlogTypeLabel(type);
		const yearText = year ? ` ${year}` : '';
		return `${typeLabel}${yearText} by ${author.name}`;
	}
};

/** Maps activity types to blog-friendly keywords. */
const ACTIVITY_TYPE_KEYWORDS: Record<string, string[]> = {
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

const ACTIVITY_SEO_KEYWORDS: SeoKeywordConfig<Activity> = {
	sources: [
		// Activity-specific keywords (mapped to blog-friendly terms)
		(activity) => activity.type && (ACTIVITY_TYPE_KEYWORDS[activity.type] || ['academic activity']),
		// Tag-based keywords (these are often topical)
		(activity) => activity.tags,
		// Blog-relevant keywords
		'blog post',
		'academic blog',
		'research update',
		// Author/personal branding keywords
		author.name,
		'digital humanities',
		'Islam studies',
		'West Africa research',
		'academic researcher',
		// Year if available (helps with temporal searches)
		(activity) => (activity.year ? activity.year.toString() : undefined),
		// Content-type specific keywords (generic blog-post terms)
		(activity) => activity.content && ['analysis', 'insights', 'findings'],
		// Geographic keywords commonly relevant
		'Africa',
		'Francophone Africa',
		// Methodological keywords common to digital humanities
		'research methods',
		'academic research'
	],
	limit: 15 // Limit to 15 most relevant keywords
};

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
	return buildSeoDescription(activity, ACTIVITY_SEO_DESCRIPTION);
}

/**
 * Creates optimized keywords for activity pages treated as blog posts
 * Focuses on blog-relevant keywords, topics, and searchable terms
 */
export function createActivitySEOKeywords(activity: Activity): string {
	return buildSeoKeywords(activity, ACTIVITY_SEO_KEYWORDS);
}
