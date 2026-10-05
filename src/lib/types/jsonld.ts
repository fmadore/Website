/**
 * Shared JSON-LD structured data interfaces.
 * Used across route load functions (publications, activities, communications, etc.)
 * to generate schema.org compliant structured data.
 */
import type { Contributor } from '$lib/types/contributor';
import { getContributorName, isPersonContributor } from '$lib/utils/contributor';

// --- Primitive Schema Types ---

export interface JsonLdPlace {
	'@type': 'Place';
	name: string;
	address?: string;
}

export interface JsonLdOrganization {
	'@type': 'Organization' | 'EducationalOrganization';
	'@id'?: string;
	name: string;
	url?: string;
}

export interface JsonLdPerson {
	'@type': 'Person';
	'@id'?: string;
	name: string;
	url?: string;
	jobTitle?: string;
	affiliation?: JsonLdOrganization;
}

/** A credited contributor: a person, or an organisation credited as one (e.g. a research centre). */
export type JsonLdAgent = JsonLdPerson | JsonLdOrganization;

export interface JsonLdCountry {
	'@type': 'Country';
	'@id'?: string;
	name: string;
}

export interface JsonLdOccupation {
	'@type': 'Occupation';
	'@id'?: string;
	name: string;
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
	/** schema.org's open-access flag. Emitted only when the work is free to read. */
	isAccessibleForFree?: boolean;
}

// --- Publication-Specific Types ---

export interface JsonLdPublicationContainer {
	'@type': 'PublicationIssue' | 'PublicationVolume' | 'Periodical' | 'Book';
	name?: string;
	issn?: string;
	volumeNumber?: string;
	issueNumber?: string;
	isbn?: string;
	author?: JsonLdAgent[];
	editor?: JsonLdAgent[];
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
	author?: JsonLdAgent[];
	editor?: JsonLdAgent[];
	datePublished?: string;
	isbn?: string;
	numberOfPages?: number;
	publisher?: JsonLdOrganization;
	citation?: JsonLdScholarlyArticleCitation[];
}

export interface ArticleJsonLd extends BaseJsonLd {
	'@type': 'ScholarlyArticle' | 'Article';
	author?: JsonLdAgent[];
	editor?: JsonLdAgent[];
	datePublished?: string;
	isPartOf?: JsonLdPublicationContainer;
	pagination?: string;
	publisher?: JsonLdOrganization;
}

export interface ReportJsonLd extends BaseJsonLd {
	'@type': 'Report';
	author?: JsonLdAgent[];
	datePublished?: string;
	reportNumber?: string;
	publisher?: JsonLdOrganization;
}

export interface BlogPostingJsonLd extends BaseJsonLd {
	'@type': 'BlogPosting';
	author?: JsonLdAgent | JsonLdAgent[];
	datePublished?: string;
	publisher?: JsonLdOrganization;
}

export interface ThesisJsonLd extends BaseJsonLd {
	'@type': 'Thesis';
	author?: JsonLdAgent[];
	datePublished?: string;
	publisher?: JsonLdOrganization;
}

/** Union of all publication-related JSON-LD types */
export type PublicationJsonLd =
	BookJsonLd | ArticleJsonLd | ReportJsonLd | BlogPostingJsonLd | ThesisJsonLd;

// --- Communication-Specific Types ---

export interface EventJsonLd extends BaseJsonLd {
	'@type': 'Event';
	startDate?: string;
	endDate?: string;
	location?: JsonLdPlace | { '@type': 'VirtualLocation'; url?: string };
	organizer?: JsonLdOrganization;
	performer?: JsonLdAgent[];
	eventAttendanceMode?: string;
}

export interface PresentationDigitalDocumentJsonLd extends BaseJsonLd {
	'@type': 'PresentationDigitalDocument';
	author?: JsonLdAgent[];
	datePublished?: string;
	publisher?: JsonLdOrganization;
}

// --- DH Project Types ---

export interface SoftwareApplicationJsonLd extends BaseJsonLd {
	'@type': 'SoftwareApplication' | 'WebApplication';
	author?: JsonLdAgent[];
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
	author?: JsonLdAgent[];
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
	description?: string;
	url?: string;
	image?: string;
	email?: string;
	jobTitle?: string;
	hasOccupation?: JsonLdOccupation[];
	worksFor?: JsonLdOrganization;
	workLocation?: JsonLdPlace;
	nationality?: JsonLdCountry;
	alumniOf?: JsonLdOrganization[];
	memberOf?: JsonLdOrganization[];
	hasCredential?: JsonLdEducationalCredential[];
	knowsLanguage?: string[];
	sameAs?: string[];
	knowsAbout?: string[];
}

// --- Utility Functions ---

export function formatAuthor(contributor: Contributor): JsonLdPerson {
	const authorName = getContributorName(contributor);
	return { '@type': 'Person', name: authorName.trim() };
}

/** Corporate credits (`kind: 'organisation'`) become Organization nodes, never Persons. */
export function formatAuthors(authors: readonly Contributor[]): JsonLdAgent[] {
	return authors.map((contributor) =>
		isPersonContributor(contributor)
			? formatAuthor(contributor)
			: { '@type': 'Organization', name: getContributorName(contributor).trim() }
	);
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
