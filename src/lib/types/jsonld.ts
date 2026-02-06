/**
 * Shared JSON-LD structured data interfaces.
 * Used across route load functions (publications, activities, communications, etc.)
 * to generate schema.org compliant structured data.
 */

// --- Primitive Schema Types ---

export interface JsonLdPlace {
	'@type': 'Place';
	name: string;
	address?: string;
}

export interface JsonLdOrganization {
	'@type': 'Organization' | 'EducationalOrganization';
	name: string;
	url?: string;
}

export interface JsonLdPerson {
	'@type': 'Person';
	name: string;
	url?: string;
	jobTitle?: string;
	affiliation?: JsonLdOrganization;
}

export interface JsonLdEducationalCredential {
	'@type': 'EducationalOccupationalCredential';
	credentialCategory?: string;
	educationalLevel?: string;
	name?: string;
}

// --- Base JSON-LD ---

export interface BaseJsonLd {
	'@context': 'https://schema.org';
	'@type': string;
	name: string;
	headline?: string;
	description?: string;
	image?: string;
	keywords?: string;
	url?: string;
	identifier?:
		| string
		| { '@type': 'PropertyValue'; propertyID: string; value: string }
		| (string | { '@type': 'PropertyValue'; propertyID: string; value: string })[];
	copyrightYear?: number;
	inLanguage?: string;
	spatialCoverage?: JsonLdPlace[];
}

// --- Publication-Specific Types ---

export interface JsonLdPublicationContainer {
	'@type': 'PublicationIssue' | 'PublicationVolume' | 'Periodical' | 'Book';
	name?: string;
	issn?: string;
	volumeNumber?: string;
	issueNumber?: string;
	isbn?: string;
	author?: JsonLdPerson[];
}

export interface JsonLdScholarlyArticleCitation {
	'@type': 'ScholarlyArticle';
	name: string;
	author?: JsonLdPerson;
	datePublished?: string;
	isPartOf?: {
		'@type': 'Periodical';
		name: string;
	};
	url?: string;
}

export interface BookJsonLd extends BaseJsonLd {
	'@type': 'Book';
	author?: JsonLdPerson[];
	editor?: JsonLdPerson[];
	datePublished?: string;
	isbn?: string;
	numberOfPages?: number;
	publisher?: JsonLdOrganization;
	citation?: JsonLdScholarlyArticleCitation[];
}

export interface ArticleJsonLd extends BaseJsonLd {
	'@type': 'ScholarlyArticle' | 'Article';
	author?: JsonLdPerson[];
	datePublished?: string;
	isPartOf?: JsonLdPublicationContainer;
	pagination?: string;
	publisher?: JsonLdOrganization;
}

export interface ReportJsonLd extends BaseJsonLd {
	'@type': 'Report';
	author?: JsonLdPerson[];
	datePublished?: string;
	reportNumber?: string;
	publisher?: JsonLdOrganization;
}

export interface BlogPostingJsonLd extends BaseJsonLd {
	'@type': 'BlogPosting';
	author?: JsonLdPerson | JsonLdPerson[];
	datePublished?: string;
	publisher?: JsonLdOrganization;
}

export interface ThesisJsonLd extends BaseJsonLd {
	'@type': 'Thesis';
	author?: JsonLdPerson[];
	datePublished?: string;
	publisher?: JsonLdOrganization;
}

/** Union of all publication-related JSON-LD types */
export type PublicationJsonLd =
	| BookJsonLd
	| ArticleJsonLd
	| ReportJsonLd
	| BlogPostingJsonLd
	| ThesisJsonLd;

// --- Communication-Specific Types ---

export interface EventJsonLd extends BaseJsonLd {
	'@type': 'Event';
	startDate?: string;
	endDate?: string;
	location?: JsonLdPlace | { '@type': 'VirtualLocation'; url?: string };
	organizer?: JsonLdOrganization;
	performer?: JsonLdPerson[];
	eventAttendanceMode?: string;
}

export interface PresentationDigitalDocumentJsonLd extends BaseJsonLd {
	'@type': 'PresentationDigitalDocument';
	author?: JsonLdPerson[];
	datePublished?: string;
	publisher?: JsonLdOrganization;
}

// --- DH Project Types ---

export interface SoftwareApplicationJsonLd extends BaseJsonLd {
	'@type': 'SoftwareApplication' | 'WebApplication';
	author?: JsonLdPerson[];
	datePublished?: string;
	applicationCategory?: string;
	operatingSystem?: string;
	offers?: {
		'@type': 'Offer';
		price: string;
		priceCurrency: string;
	};
}

export interface CreativeWorkJsonLd extends BaseJsonLd {
	'@type': 'CreativeWork' | 'WebSite' | 'Dataset';
	author?: JsonLdPerson[];
	datePublished?: string;
	dateModified?: string;
	publisher?: JsonLdOrganization;
	license?: string;
}

// --- Person Page Types ---

export interface PersonPageJsonLd {
	'@context': 'https://schema.org';
	'@type': 'Person';
	'@id': string;
	name: string;
	honorificPrefix?: string;
	url?: string;
	image?: string;
	email?: string;
	jobTitle?: string;
	worksFor?: JsonLdOrganization;
	workLocation?: JsonLdPlace;
	nationality?: string;
	alumniOf?: JsonLdOrganization[];
	memberOf?: JsonLdOrganization[];
	hasCredential?: JsonLdEducationalCredential[];
	knowsLanguage?: string[];
	sameAs?: string[];
	knowsAbout?: string[];
}

// --- Utility Functions ---

export function formatAuthor(authorName: string): JsonLdPerson {
	return { '@type': 'Person', name: authorName.trim() };
}

export function formatAuthors(authors: string[]): JsonLdPerson[] {
	return authors.map(formatAuthor);
}

export function formatPlaces(countries: string[]): JsonLdPlace[] {
	return countries.map((country) => ({ '@type': 'Place', name: country.trim() }));
}

/**
 * Format an ISO date string with CET timezone for JSON-LD.
 * Uses +01:00 (Berlin CET) as default timezone.
 */
export function formatJsonLdDate(dateISO: string): string {
	return `${dateISO}T00:00:00+01:00`;
}

/**
 * Create an Organization JSON-LD object from a name string.
 */
export function formatOrganization(name: string): JsonLdOrganization {
	return { '@type': 'Organization', name };
}
