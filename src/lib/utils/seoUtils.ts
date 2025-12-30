import type { Communication } from '$lib/types/communication';
import type { Publication } from '$lib/types';
import type { Activity } from '$lib/types/activity';
import {
	author,
	contact,
	address,
	website,
	socialLinks
} from '$lib/data/siteConfig';
import { getDefaultDescription } from '$lib/utils/siteHelpers';

// ============================================================================
// JSON-LD SCHEMA TYPES
// ============================================================================

/**
 * BreadcrumbItem for JSON-LD BreadcrumbList schema
 */
export interface BreadcrumbItem {
	name: string;
	url: string;
}

/**
 * WebSite schema for JSON-LD - helps Google understand site structure
 * and enables potential sitelinks in search results
 */
export interface WebSiteSchema {
	'@context': 'https://schema.org';
	'@type': 'WebSite';
	'@id': string;
	name: string;
	alternateName?: string;
	url: string;
	description?: string;
	publisher?: {
		'@id': string;
	};
	potentialAction?: {
		'@type': 'SearchAction';
		target: {
			'@type': 'EntryPoint';
			urlTemplate: string;
		};
		'query-input': string;
	};
	inLanguage?: string;
}

/**
 * Organization/Person schema for JSON-LD - establishes entity identity
 */
export interface PersonSchema {
	'@context': 'https://schema.org';
	'@type': 'Person';
	'@id': string;
	name: string;
	url: string;
	image?: string;
	jobTitle?: string;
	worksFor?: {
		'@type': 'Organization';
		name: string;
		url?: string;
	};
	sameAs?: string[];
}

/**
 * BreadcrumbList schema for JSON-LD - critical for SEO hierarchy
 */
export interface BreadcrumbListSchema {
	'@context': 'https://schema.org';
	'@type': 'BreadcrumbList';
	itemListElement: Array<{
		'@type': 'ListItem';
		position: number;
		name: string;
		item: string;
	}>;
}

/**
 * WebPage schema for JSON-LD - describes individual pages
 */
export interface WebPageSchema {
	'@context': 'https://schema.org';
	'@type': 'WebPage' | 'CollectionPage' | 'AboutPage' | 'ProfilePage';
	'@id': string;
	name: string;
	description?: string;
	url: string;
	isPartOf?: {
		'@id': string;
	};
	breadcrumb?: {
		'@id': string;
	};
	inLanguage?: string;
	datePublished?: string;
	dateModified?: string;
	/** Required for ProfilePage - references the Person entity being profiled */
	mainEntity?: {
		'@id': string;
	};
}

// ============================================================================
// JSON-LD SCHEMA GENERATORS
// ============================================================================

const SITE_URL = website.url;
const SITE_NAME = author.name;
const SITE_DESCRIPTION = getDefaultDescription();

/**
 * Creates a WebSite schema - add to root layout for sitelinks eligibility
 * This schema helps Google understand your site structure and potentially
 * display sitelinks (sub-pages) in search results
 */
export function createWebSiteSchema(): WebSiteSchema {
	return {
		'@context': 'https://schema.org',
		'@type': 'WebSite',
		'@id': `${SITE_URL}/#website`,
		name: SITE_NAME,
		alternateName: 'Dr. Frédérick Madore',
		url: SITE_URL,
		description: SITE_DESCRIPTION,
		publisher: {
			'@id': `${SITE_URL}/#person`
		},
		inLanguage: 'en-US'
	};
}

/**
 * Creates a Person schema for the site owner
 * Links the website to the person entity for better knowledge graph integration
 */
export function createPersonSchema(): PersonSchema {
	return {
		'@context': 'https://schema.org',
		'@type': 'Person',
		'@id': `${SITE_URL}/#person`,
		name: author.name,
		url: SITE_URL,
		image: `${SITE_URL}/images/Profile-picture.webp`,
		jobTitle: author.positionShort,
		worksFor: {
			'@type': 'Organization',
			name: `${address.institution} (${address.institutionAbbreviation})`,
			url: address.institutionUrl
		},
		sameAs: [
			socialLinks.linkedIn.url,
			socialLinks.github.url,
			socialLinks.orcid.url,
			socialLinks.bluesky.url,
			socialLinks.googleScholar.url,
			socialLinks.researchGate.url,
			'https://hcommons.org/members/fmadore/',
			'https://zmo.academia.edu/FrederickMadore',
			'https://www.wikidata.org/wiki/Q55725595'
		]
	};
}

/**
 * Creates a BreadcrumbList schema from an array of breadcrumb items
 * Critical for SEO - helps Google understand page hierarchy and display
 * breadcrumb trails in search results
 *
 * @param items - Array of breadcrumb items with name and url
 * @returns BreadcrumbList JSON-LD schema
 *
 * @example
 * createBreadcrumbSchema([
 *   { name: 'Home', url: 'https://www.frederickmadore.com' },
 *   { name: 'Research', url: 'https://www.frederickmadore.com/research' }
 * ])
 */
export function createBreadcrumbSchema(items: BreadcrumbItem[]): BreadcrumbListSchema {
	return {
		'@context': 'https://schema.org',
		'@type': 'BreadcrumbList',
		itemListElement: items.map((item, index) => ({
			'@type': 'ListItem',
			position: index + 1,
			name: item.name,
			item: item.url
		}))
	};
}

/**
 * Creates a WebPage schema for individual pages
 * Links to the website and breadcrumb for complete semantic structure
 * For ProfilePage types, automatically includes mainEntity reference to Person
 */
export function createWebPageSchema(options: {
	name: string;
	description?: string;
	path: string;
	type?: 'WebPage' | 'CollectionPage' | 'AboutPage' | 'ProfilePage';
	datePublished?: string;
	dateModified?: string;
}): WebPageSchema {
	const { name, description, path, type = 'WebPage', datePublished, dateModified } = options;
	const url = `${SITE_URL}${path}`;

	const schema: WebPageSchema = {
		'@context': 'https://schema.org',
		'@type': type,
		'@id': `${url}#webpage`,
		name,
		description,
		url,
		isPartOf: {
			'@id': `${SITE_URL}/#website`
		},
		inLanguage: 'en-US',
		...(datePublished && { datePublished }),
		...(dateModified && { dateModified })
	};

	// ProfilePage requires mainEntity to reference the Person being profiled
	if (type === 'ProfilePage') {
		schema.mainEntity = {
			'@id': `${SITE_URL}/#person`
		};
	}

	return schema;
}

/**
 * Combines multiple JSON-LD schemas into a single @graph structure
 * This is the recommended approach for multiple schemas on one page
 */
export function combineSchemas(schemas: object[]): string {
	return JSON.stringify({
		'@context': 'https://schema.org',
		'@graph': schemas.map((schema) => {
			// Remove @context from individual schemas when combining
			const { '@context': _, ...rest } = schema as { '@context'?: string };
			return rest;
		})
	});
}

/**
 * Helper to create breadcrumbs for main sections
 * Provides consistent breadcrumb structure across the site
 */
export function createSectionBreadcrumbs(
	sectionName: string,
	sectionPath: string,
	subPage?: { name: string; path: string }
): BreadcrumbItem[] {
	const breadcrumbs: BreadcrumbItem[] = [
		{ name: 'Home', url: SITE_URL },
		{ name: sectionName, url: `${SITE_URL}${sectionPath}` }
	];

	if (subPage) {
		breadcrumbs.push({
			name: subPage.name,
			url: `${SITE_URL}${subPage.path}`
		});
	}

	return breadcrumbs;
}

// ============================================================================
// SEO DESCRIPTION GENERATORS
// ============================================================================

/**
 * Creates an optimized SEO description for communication pages
 *
 * Best practices applied:
 * - 150-160 characters optimal length for Google SERPs
 * - Front-loads important keywords (type, topic, location)
 * - Uses smart truncation to avoid cutting mid-sentence
 * - Includes call-to-action when space allows
 * - Fallback logic for missing fields
 */
export function createCommunicationSEODescription(communication: Communication): string {
	const { type, title, conference, location, country, year, abstract, authors } = communication;

	// Helper to get readable type labels
	const getTypeLabel = (type: string): string => {
		const typeLabels: Record<string, string> = {
			conference: 'Conference paper',
			workshop: 'Workshop presentation',
			seminar: 'Seminar',
			lecture: 'Lecture',
			panel: 'Panel discussion',
			event: 'Academic presentation'
		};
		return typeLabels[type] || 'Academic presentation';
	};

	// Helper to truncate text while preserving sentence boundaries
	const smartTruncate = (text: string, maxLength: number): string => {
		if (text.length <= maxLength) return text;

		// Find the last complete sentence within the limit
		const truncated = text.substring(0, maxLength);
		const lastSentenceEnd = Math.max(
			truncated.lastIndexOf('. '),
			truncated.lastIndexOf('? '),
			truncated.lastIndexOf('! ')
		);

		if (lastSentenceEnd > maxLength * 0.6) {
			// If we have a good sentence break, use it
			return text.substring(0, lastSentenceEnd + 1).trim();
		}

		// Otherwise, truncate at word boundary and add ellipsis
		const lastSpace = truncated.lastIndexOf(' ');
		return lastSpace > maxLength * 0.6
			? text.substring(0, lastSpace) + '...'
			: text.substring(0, maxLength - 3) + '...';
	};

	// Start building the description with the most important information first
	let description = '';

	// Begin with type and title (most important for academic content)
	if (type && title) {
		const typeLabel = getTypeLabel(type);
		description = `${typeLabel}: ${title}`;
	} else if (title) {
		description = title;
	}

	// Add location and year context (highly valuable for academic presentations)
	const locationInfo = [];
	if (conference) locationInfo.push(conference);
	if (location && location !== conference) locationInfo.push(location);
	if (country && !location?.includes(country)) locationInfo.push(country);
	if (year) locationInfo.push(year.toString());

	if (locationInfo.length > 0) {
		const locationText = ` Presented at ${locationInfo.join(', ')}.`;
		if ((description + locationText).length <= 160) {
			description += locationText;
		} else if (description.length < 100) {
			// For shorter descriptions, try a more compact format
			const shortLocationText = ` at ${conference || location || country || year}`;
			if ((description + shortLocationText).length <= 160) {
				description += shortLocationText;
			}
		}
	}

	// If we have space and an abstract, add a summary
	if (abstract && description.length < 120) {
		const remainingSpace = 160 - description.length - 1; // -1 for space
		const abstractPreview = smartTruncate(abstract, remainingSpace);
		if (abstractPreview.length > 20) {
			// Only add if meaningful content
			description += ` ${abstractPreview}`;
		}
	}

	// Ensure we don't exceed 160 characters
	if (description.length > 160) {
		description = smartTruncate(description, 160);
	}

	// Fallback if somehow we still don't have a good description
	if (!description.trim()) {
		const authorText = authors?.length ? ` by ${authors[0]}` : '';
		const eventText = conference ? ` at ${conference}` : '';
		const yearText = year ? ` (${year})` : '';
		description = `Academic presentation${eventText}${authorText}${yearText}`;
	}

	return description;
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

	// Helper to get readable type labels
	const getTypeLabel = (type: string): string => {
		const typeLabels: Record<string, string> = {
			article: 'Journal article',
			book: 'Book',
			chapter: 'Book chapter',
			'special-issue': 'Special issue',
			report: 'Research report',
			encyclopedia: 'Encyclopedia entry',
			blogpost: 'Blog post',
			'masters-thesis': "Master's thesis",
			'phd-dissertation': 'PhD dissertation'
		};
		return typeLabels[type] || 'Academic publication';
	};

	// Helper to truncate text while preserving sentence boundaries (reuse existing function)
	const smartTruncate = (text: string, maxLength: number): string => {
		if (text.length <= maxLength) return text;

		// Find the last complete sentence within the limit
		const truncated = text.substring(0, maxLength);
		const lastSentenceEnd = Math.max(
			truncated.lastIndexOf('. '),
			truncated.lastIndexOf('? '),
			truncated.lastIndexOf('! ')
		);

		if (lastSentenceEnd > maxLength * 0.6) {
			// If we have a good sentence break, use it
			return text.substring(0, lastSentenceEnd + 1).trim();
		}

		// Otherwise, truncate at word boundary and add ellipsis
		const lastSpace = truncated.lastIndexOf(' ');
		return lastSpace > maxLength * 0.6
			? text.substring(0, lastSpace) + '...'
			: text.substring(0, maxLength - 3) + '...';
	};

	// Start building the description with the most important information first
	let description = '';

	// Begin with type and title (most important for academic content)
	if (type && title) {
		const typeLabel = getTypeLabel(type);
		description = `${typeLabel}: ${title}`;
	} else if (title) {
		description = title;
	}

	// Add publication venue context (highly valuable for academic publications)
	const venueInfo = [];

	// Different venue information based on publication type
	if (type === 'article' || type === 'special-issue') {
		if (journal) venueInfo.push(journal);
	} else if (type === 'chapter') {
		if (book) venueInfo.push(`in ${book}`);
	} else if (type === 'book' || type === 'report') {
		if (publisher) venueInfo.push(publisher);
		if (placeOfPublication) venueInfo.push(placeOfPublication);
	} else if (type === 'encyclopedia') {
		if ((publication as any).encyclopediaTitle)
			venueInfo.push((publication as any).encyclopediaTitle);
	} else if (type === 'masters-thesis' || type === 'phd-dissertation') {
		if ((publication as any).university) venueInfo.push((publication as any).university);
	}

	if (year) venueInfo.push(year.toString());

	if (venueInfo.length > 0) {
		const venueText = ` Published in ${venueInfo.join(', ')}.`;
		if ((description + venueText).length <= 160) {
			description += venueText;
		} else if (description.length < 100) {
			// For shorter descriptions, try a more compact format
			const shortVenueText = ` (${venueInfo[0] || year})`;
			if ((description + shortVenueText).length <= 160) {
				description += shortVenueText;
			}
		}
	} else if (year && description.length < 140) {
		// If no venue info but we have a year, add it
		description += ` (${year})`;
	}

	// If we have space and an abstract, add a summary
	if (abstract && description.length < 120) {
		const remainingSpace = 160 - description.length - 1; // -1 for space
		const abstractPreview = smartTruncate(abstract, remainingSpace);
		if (abstractPreview.length > 20) {
			// Only add if meaningful content
			description += ` ${abstractPreview}`;
		}
	}

	// Ensure we don't exceed 160 characters
	if (description.length > 160) {
		description = smartTruncate(description, 160);
	}

	// Fallback if somehow we still don't have a good description
	if (!description.trim()) {
		const authorText = authors?.length ? ` by ${authors[0]}` : '';
		const yearText = year ? ` (${year})` : '';
		const typeLabel = getTypeLabel(type);
		description = `${typeLabel}${authorText}${yearText}`;
	}

	return description;
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

	// Helper to get blog-friendly type labels with engaging language
	const getBlogTypeLabel = (type?: string): string => {
		const typeLabels: Record<string, string> = {
			conference: 'Conference insights',
			workshop: 'Workshop highlights',
			seminar: 'Seminar takeaways',
			lecture: 'Lecture summary',
			panel: 'Panel discussion',
			grant: 'Research funding',
			publication: 'Publication update',
			event: 'Academic event',
			visit: 'Academic visit',
			news: 'Latest news'
		};
		return typeLabels[type || ''] || 'Academic update';
	};

	// Helper to truncate text while preserving word boundaries
	const smartTruncate = (text: string, maxLength: number): string => {
		if (text.length <= maxLength) return text;

		// Find the last complete sentence within the limit
		const truncated = text.substring(0, maxLength);
		const lastSentenceEnd = Math.max(
			truncated.lastIndexOf('. '),
			truncated.lastIndexOf('? '),
			truncated.lastIndexOf('! ')
		);

		if (lastSentenceEnd > maxLength * 0.6) {
			// If we have a good sentence break, use it
			return text.substring(0, lastSentenceEnd + 1).trim();
		}

		// Otherwise, truncate at word boundary and add ellipsis
		const lastSpace = truncated.lastIndexOf(' ');
		return lastSpace > maxLength * 0.6
			? text.substring(0, lastSpace) + '...'
			: text.substring(0, maxLength - 3) + '...';
	};

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
