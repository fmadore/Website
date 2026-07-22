/**
 * JSON-LD schema types and generic factories (schema.org structured data).
 *
 * Split out of seoUtils.ts: this module owns generic site/page schema
 * construction (WebSite, Person, breadcrumbs, WebPage, grants, @graph
 * combination); seoUtils.ts owns SEO description/keyword generation and
 * re-exports everything here for backward-compatible imports. Per-entity
 * detail-page builders live in `$lib/utils/entityJsonLd.ts`.
 */
import type { Grant } from '$lib/types/grant';
import { author, address, website, socialLinks } from '$lib/data/siteConfig';
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

/**
 * MonetaryGrant schema for JSON-LD - Schema.org structured data for research grants
 * @see https://schema.org/MonetaryGrant
 */
export interface MonetaryGrantSchema {
	'@context'?: 'https://schema.org';
	'@type': 'MonetaryGrant';
	'@id'?: string;
	name: string;
	description?: string;
	funder: {
		'@type': 'Organization';
		name: string;
	};
	startDate?: string;
	endDate?: string;
	amount?: {
		'@type': 'MonetaryAmount';
		value: number;
		currency: string;
	};
	identifier?: string;
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
		alternateName: `Dr. ${author.name}`,
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
 * Creates a MonetaryGrant schema from a Grant data object
 * Only includes awarded grants — turned-down grants are excluded from structured data
 *
 * @param grant - Grant data object
 * @param pageUrl - URL of the page containing the grant (used for @id)
 * @returns MonetaryGrant JSON-LD schema, or null if grant is not awarded
 */
export function createMonetaryGrantSchema(
	grant: Grant,
	pageUrl: string
): MonetaryGrantSchema | null {
	if (grant.status && grant.status !== 'Awarded') return null;

	const schema: MonetaryGrantSchema = {
		'@type': 'MonetaryGrant',
		'@id': `${pageUrl}#grant-${grant.id}`,
		name: grant.title,
		funder: {
			'@type': 'Organization',
			name: grant.funder
		}
	};

	if (grant.projectTitle) {
		schema.description = grant.projectTitle;
	}

	if (grant.dateISOStart) {
		schema.startDate = grant.dateISOStart;
	}

	if (grant.dateISOEnd) {
		schema.endDate = grant.dateISOEnd;
	}

	if (grant.amount && grant.currency) {
		schema.amount = {
			'@type': 'MonetaryAmount',
			value: grant.amount,
			currency: grant.currency
		};
	}

	if (grant.id) {
		schema.identifier = grant.id;
	}

	return schema;
}

/**
 * Creates MonetaryGrant schemas for all awarded grants associated with a project
 *
 * @param grants - Array of Grant data objects
 * @param pageUrl - URL of the page containing the grants
 * @returns Array of MonetaryGrant JSON-LD schemas (only awarded grants)
 */
export function createMonetaryGrantSchemas(
	grants: Grant[],
	pageUrl: string
): MonetaryGrantSchema[] {
	return grants
		.map((grant) => createMonetaryGrantSchema(grant, pageUrl))
		.filter((schema): schema is MonetaryGrantSchema => schema !== null);
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
