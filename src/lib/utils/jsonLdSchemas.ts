/**
 * JSON-LD schema types and generators (schema.org structured data).
 *
 * Split out of seoUtils.ts: this module owns structured-data schema
 * construction; seoUtils.ts owns SEO description/keyword generation and
 * re-exports everything here for backward-compatible imports.
 */
import type { Grant } from '$lib/types/grant';
import type { Publication } from '$lib/types/publication';
import type { Communication } from '$lib/types/communication';
import type { DigitalHumanitiesProject } from '$lib/types/digitalHumanities';
import type { ReviewWork } from '$lib/types';
import type {
	PublicationJsonLd,
	JsonLdPerson,
	BookJsonLd,
	ArticleJsonLd,
	ReportJsonLd,
	BlogPostingJsonLd,
	ThesisJsonLd,
	JsonLdScholarlyArticleCitation,
	EventJsonLd,
	CreativeWorkJsonLd
} from '$lib/types/jsonld';
import { formatAuthor, formatAuthors, formatPlaces, formatJsonLdDate } from '$lib/types/jsonld';
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

// ============================================================================
// DETAIL-PAGE ENTITY SCHEMAS
// ============================================================================

/** Publication as enriched by the data loader (adds the source directory). */
type PublicationWithSource = Publication & { sourceDirType: string };

/** Map a publication's source directory / type to its schema.org @type. */
function resolvePublicationJsonLdType(
	publication: PublicationWithSource
): PublicationJsonLd['@type'] {
	switch (publication.sourceDirType) {
		case 'books':
			return 'Book';
		case 'articles':
			return publication.type === 'bulletin-article' ? 'Article' : 'ScholarlyArticle';
		case 'chapters':
			return 'Article';
		case 'specialIssues':
			return 'ScholarlyArticle';
		case 'reports':
			return 'Report';
		case 'encyclopedia':
			return 'Article';
		case 'blogposts':
			return 'BlogPosting';
		case 'dissertations':
			return 'Thesis';
		default:
			return 'Book'; // Fallback
	}
}

/**
 * Build the schema.org JSON-LD object for a publication detail page.
 *
 * Extracted verbatim from `publications/[id]/+page.ts` so the loader stays a
 * thin lookup and the (pure) schema-construction logic can be unit-tested.
 * `base` is the SvelteKit base path, passed in to keep this util free of
 * framework runtime imports.
 */
export function buildPublicationJsonLd(
	publication: PublicationWithSource,
	base = ''
): PublicationJsonLd {
	const resolvedType = resolvePublicationJsonLdType(publication);

	const jsonLdObject: Partial<PublicationJsonLd> = {
		'@context': 'https://schema.org',
		'@type': resolvedType,
		name: publication.title,
		headline: publication.title,
		description: publication.abstract,
		url: `${base}/publications/${publication.id}`,
		copyrightYear: publication.year,
		inLanguage: publication.language
	};

	if (publication.country && publication.country.length > 0) {
		jsonLdObject.spatialCoverage = formatPlaces(publication.country);
	}

	// Format common fields; attach the canonical site URL to the primary author.
	const authors = publication.authors ? formatAuthors(publication.authors) : undefined;
	const defaultAuthorWithUrl: JsonLdPerson | undefined = authors?.find(
		(a) => a.name === 'Frédérick Madore'
	)
		? { ...formatAuthor('Frédérick Madore'), url: website.url }
		: undefined;
	const finalAuthors = authors?.map((a) =>
		a.name === 'Frédérick Madore' && defaultAuthorWithUrl ? defaultAuthorWithUrl : a
	);

	const formattedDatePublished = publication.dateISO
		? `${publication.dateISO}T00:00:00+01:00`
		: undefined;
	const publisherOrg = publication.publisher
		? { '@type': 'Organization' as const, name: publication.publisher }
		: undefined;

	switch (resolvedType) {
		case 'Book': {
			const bookData = jsonLdObject as Partial<BookJsonLd>;
			if (publication.isEditedVolume) {
				bookData.editor = finalAuthors;
			} else {
				bookData.author = finalAuthors;
			}
			bookData.datePublished = formattedDatePublished;
			bookData.isbn = publication.isbn;
			bookData.numberOfPages = publication.pageCount;
			bookData.publisher = publisherOrg;

			// Academic book reviews are modelled as citations (ScholarlyArticle)
			// rather than Review schema (no numerical ratings; better represents
			// the scholarly nature and avoids Google's aggregateRating expectation).
			if (publication.reviewedBy && publication.reviewedBy.length > 0) {
				bookData.citation = publication.reviewedBy.map((reviewData: ReviewWork) => {
					const citationJson: JsonLdScholarlyArticleCitation = {
						'@type': 'ScholarlyArticle',
						name: reviewData.title,
						author: formatAuthor(reviewData.author),
						datePublished: String(reviewData.year),
						url: reviewData.url
					};
					if (reviewData.journal) {
						citationJson.isPartOf = {
							'@type': 'Periodical',
							name: reviewData.journal
						};
					}
					return citationJson;
				});
			}
			break;
		}
		case 'ScholarlyArticle':
		case 'Article': {
			// Articles, chapters, encyclopedia entries
			const articleData = jsonLdObject as Partial<ArticleJsonLd>;
			articleData.author = finalAuthors;
			articleData.datePublished = formattedDatePublished;
			articleData.pagination = publication.pages;
			articleData.publisher = publisherOrg;

			if (
				publication.sourceDirType === 'articles' ||
				publication.sourceDirType === 'specialIssues'
			) {
				if (publication.journal) {
					articleData.isPartOf = {
						'@type': publication.issue ? 'PublicationIssue' : 'Periodical',
						name: publication.journal,
						volumeNumber: publication.volume,
						issueNumber: publication.issue
					};
				}
			} else if (publication.sourceDirType === 'chapters' && publication.book) {
				articleData.isPartOf = {
					'@type': 'Book',
					name: publication.book,
					author: publication.editors
						? formatAuthors(
								Array.isArray(publication.editors) ? publication.editors : [publication.editors]
							)
						: undefined
				};
				articleData.publisher = publisherOrg;
			} else if (publication.sourceDirType === 'encyclopedia' && publication.encyclopediaTitle) {
				articleData.isPartOf = {
					'@type': 'Book',
					name: publication.encyclopediaTitle
				};
				articleData.publisher = publisherOrg;
			}
			break;
		}
		case 'Report': {
			const reportData = jsonLdObject as Partial<ReportJsonLd>;
			reportData.author = finalAuthors;
			reportData.datePublished = formattedDatePublished;
			reportData.publisher = publisherOrg;
			break;
		}
		case 'BlogPosting': {
			const blogData = jsonLdObject as Partial<BlogPostingJsonLd>;
			blogData.author = finalAuthors;
			blogData.datePublished = formattedDatePublished;
			blogData.publisher = publisherOrg;
			break;
		}
		case 'Thesis': {
			const thesisData = jsonLdObject as Partial<ThesisJsonLd>;
			thesisData.author = finalAuthors;
			thesisData.datePublished = formattedDatePublished;
			thesisData.publisher = publication.university
				? { '@type': 'Organization', name: publication.university }
				: undefined;
			break;
		}
	}

	if (publication.image) {
		jsonLdObject.image = `${base}/${publication.image}`;
	}
	if (publication.tags) {
		jsonLdObject.keywords = publication.tags.join(', ');
	}
	if (publication.doi) {
		jsonLdObject.identifier = {
			'@type': 'PropertyValue',
			propertyID: 'DOI',
			value: publication.doi
		};
	}

	return jsonLdObject as PublicationJsonLd;
}

/**
 * Build the schema.org JSON-LD object for a communication detail page.
 *
 * Academic presentations/talks are modelled as Events with the presenter(s)
 * as performers. Extracted verbatim from `communications/[id]/+page.ts`.
 */
export function buildCommunicationJsonLd(communication: Communication, base = ''): EventJsonLd {
	const jsonLdObject: Partial<EventJsonLd> = {
		'@context': 'https://schema.org',
		'@type': 'Event',
		name: communication.title,
		description: communication.abstract,
		url: `${base}/communications/${communication.id}`
	};

	if (communication.dateISO) {
		jsonLdObject.startDate = formatJsonLdDate(communication.dateISO);
	}

	if (communication.location || communication.country) {
		const locationParts = [communication.location, communication.country]
			.filter(Boolean)
			.join(', ');
		jsonLdObject.location = {
			'@type': 'Place',
			name: locationParts
		};
	}

	if (communication.conference) {
		jsonLdObject.organizer = {
			'@type': 'Organization',
			name: communication.conference
		};
	}

	if (communication.authors && communication.authors.length > 0) {
		const authors = formatAuthors(communication.authors);
		jsonLdObject.performer = authors.map((a) =>
			a.name === 'Frédérick Madore' ? { ...a, url: website.url } : a
		);
	}

	if (communication.heroImage?.src) {
		jsonLdObject.image = `${base}/${communication.heroImage.src}`;
	} else if (communication.image) {
		jsonLdObject.image = `${base}/${communication.image}`;
	}

	if (communication.tags) {
		jsonLdObject.keywords = communication.tags.join(', ');
	}

	if (communication.language) {
		jsonLdObject.inLanguage = Array.isArray(communication.language)
			? communication.language[0]
			: communication.language;
	}

	return jsonLdObject as EventJsonLd;
}

/**
 * Build the schema.org JSON-LD object for a digital-humanities project page.
 *
 * Projects with an external link are modelled as WebSite, otherwise as
 * CreativeWork. Extracted verbatim from `digital-humanities/[id]/+page.ts`.
 */
export function buildDhProjectJsonLd(
	project: DigitalHumanitiesProject,
	base = ''
): CreativeWorkJsonLd {
	const jsonLdObject: Partial<CreativeWorkJsonLd> = {
		'@context': 'https://schema.org',
		'@type': project.linkUrl ? 'WebSite' : 'CreativeWork',
		name: project.title,
		description: project.seoDescription || project.shortDescription,
		url: project.linkUrl || `${base}/digital-humanities/${project.id}`
	};

	jsonLdObject.author = [{ ...formatAuthor('Frédérick Madore'), url: website.url }];

	if (project.heroImageUrl || project.imageUrl) {
		jsonLdObject.image = `${base}/${project.heroImageUrl || project.imageUrl}`;
	}

	if (project.seoKeywords && project.seoKeywords.length > 0) {
		jsonLdObject.keywords = project.seoKeywords.join(', ');
	} else if (project.skills && project.skills.length > 0) {
		jsonLdObject.keywords = project.skills.join(', ');
	}

	return jsonLdObject as CreativeWorkJsonLd;
}
