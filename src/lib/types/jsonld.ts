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
	identifier?: JsonLdPropertyValue;
	sameAs?: string[];
}

/** A typed identifier — a DOI, a ROR id — named by the scheme that issued it. */
export interface JsonLdPropertyValue {
	'@type': 'PropertyValue';
	propertyID: string;
	value: string;
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
	/** The record's node id: its page URL plus `#record` (see `recordEntityId`). */
	'@id'?: string;
	name: string;
	headline?: string;
	description?: string;
	image?: string;
	keywords?: string;
	url?: string;
	/** The page this record is the main entity of — its `#webpage` node. */
	mainEntityOfPage?: { '@id': string };
	identifier?: string | JsonLdPropertyValue | (string | JsonLdPropertyValue)[];
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
	/** A work exhibited at the event: a poster session's poster. */
	workFeatured?: {
		'@type': 'DigitalDocument';
		name: string;
		genre: 'Poster';
		encodingFormat: 'application/pdf';
		url: string;
		thumbnailUrl?: string;
	};
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
 * A record date for JSON-LD, at the precision the data has: `2017`, `2017-05`
 * or `2017-05-12`, each a valid ISO 8601 date.
 *
 * Records dated only by year or month used to be padded with a time, which
 * shipped `2017T00:00:00+01:00` — not a date in any format — and invented a
 * midnight in Berlin for every record that has a day. Anything that is not one
 * of the three shapes is dropped rather than published malformed.
 */
export function formatJsonLdDate(dateISO: string | undefined): string | undefined {
	return dateISO && /^\d{4}(-\d{2}(-\d{2})?)?$/.test(dateISO) ? dateISO : undefined;
}
