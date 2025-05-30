import { error } from '@sveltejs/kit';
import { base } from '$app/paths';
import { allPublications } from '$lib/data/publications/index';
import type { Publication, ReviewWork } from '$lib/types';
import type { PageLoad } from './$types';

// --- JSON-LD Helper Interfaces ---
interface Place {
	'@type': 'Place';
	name: string;
}

interface BaseJsonLd {
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
	spatialCoverage?: Place[];
}

interface Person {
	'@type': 'Person';
	name: string;
	url?: string;
}

interface Organization {
	'@type': 'Organization';
	name: string;
}

// Combined type for things an article can be part of
interface PublicationContainer {
	'@type': 'PublicationIssue' | 'PublicationVolume' | 'Periodical' | 'Book';
	name?: string;
	issn?: string;
	volumeNumber?: string;
	issueNumber?: string;
	isbn?: string; // Added for when container is Book
	author?: Person[]; // Added for when container is Book (editors)
}

// Define Review interface
interface ReviewJsonLd {
	'@type': 'Review';
	author?: Person;
	datePublished?: string; // Format YYYY or YYYY-MM-DD
	reviewBody?: string; // Use excerpt
	itemReviewed?: {
		'@type': 'Book'; // Or potentially other types if reviewing articles etc.
		name: string;
	};
	publisher?: Organization; // Publisher of the review journal
	url?: string; // URL of the review itself
	identifier?: string | { '@type': 'PropertyValue'; propertyID: string; value: string }; // DOI of the review
}

// --- Main JSON-LD Interfaces ---
interface BookJsonLd extends BaseJsonLd {
	'@type': 'Book';
	author?: Person[];
	editor?: Person[];
	datePublished?: string;
	isbn?: string;
	numberOfPages?: number;
	publisher?: Organization;
	review?: ReviewJsonLd[]; // Added review array
}

interface ArticleJsonLd extends BaseJsonLd {
	// Used for Articles, Chapters, Encyclopedia Entries
	'@type': 'ScholarlyArticle' | 'Article';
	author?: Person[];
	datePublished?: string;
	isPartOf?: PublicationContainer; // Use the combined container type
	pagination?: string;
	publisher?: Organization; // Can be Journal publisher or Book publisher
}

interface ReportJsonLd extends BaseJsonLd {
	'@type': 'Report';
	author?: Person[];
	datePublished?: string;
	reportNumber?: string;
	publisher?: Organization;
}

interface BlogPostingJsonLd extends BaseJsonLd {
	'@type': 'BlogPosting';
	author?: Person[];
	datePublished?: string;
	publisher?: Organization; // Added missing publisher
}

interface ThesisJsonLd extends BaseJsonLd {
	'@type': 'Thesis';
	author?: Person[];
	datePublished?: string;
	publisher?: Organization; // University
}

// Union type for flexibility
type JsonLd = BookJsonLd | ArticleJsonLd | ReportJsonLd | BlogPostingJsonLd | ThesisJsonLd;

// --- Utility Functions ---
function formatAuthor(authorName: string): Person {
	return { '@type': 'Person', name: authorName.trim() };
}

function formatAuthors(authors: string[]): Person[] {
	return authors.map(formatAuthor);
}

// Helper function to format countries into Place objects
function formatPlaces(countries: string[]): Place[] {
	return countries.map((country) => ({ '@type': 'Place', name: country.trim() }));
}

// --- Load Function ---
export const load: PageLoad = ({ params }) => {
	const publicationId = params.id;
	const publication = allPublications.find((p) => p.id === publicationId);

	if (!publication) {
		throw error(404, 'Publication not found');
	}

	let resolvedType: JsonLd['@type']; // Use union of specific types
	switch (publication.sourceDirType) {
		case 'books':
			resolvedType = 'Book';
			break;
		case 'articles':
			resolvedType = 'ScholarlyArticle';
			break;
		case 'chapters':
			resolvedType = 'Article';
			break;
		case 'specialIssues':
			resolvedType = 'ScholarlyArticle';
			break;
		case 'reports':
			resolvedType = 'Report';
			break;
		case 'encyclopedia':
			resolvedType = 'Article';
			break;
		case 'blogposts':
			resolvedType = 'BlogPosting';
			break;
		case 'dissertations':
			resolvedType = 'Thesis';
			break;
		default:
			resolvedType = 'Book'; // Fallback to Book or maybe CreativeWork?
	}

	// Base JSON-LD object - Use Partial<JsonLd> for flexibility
	const jsonLdObject: Partial<JsonLd> = {
		'@context': 'https://schema.org',
		'@type': resolvedType,
		name: publication.title,
		headline: publication.title,
		description: publication.abstract,
		url: `${base}/publications/${publication.id}`,
		copyrightYear: publication.year,
		inLanguage: publication.language
	};

	// Add spatialCoverage if countries exist
	if (publication.country && publication.country.length > 0) {
		jsonLdObject.spatialCoverage = formatPlaces(publication.country);
	}

	// Format common fields
	const authors = publication.authors ? formatAuthors(publication.authors) : undefined;
	// Add author URL directly here
	const defaultAuthorWithUrl: Person | undefined = authors?.find(
		(a) => a.name === 'Frédérick Madore'
	)
		? { ...formatAuthor('Frédérick Madore'), url: 'https://www.frederickmadore.com' }
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

	// Add type-specific fields using type guards or assertions
	switch (resolvedType) {
		case 'Book':
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

			// Add reviews if they exist
			if (publication.reviewedBy && publication.reviewedBy.length > 0) {
				bookData.review = publication.reviewedBy.map((reviewData: ReviewWork) => {
					const reviewJson: ReviewJsonLd = {
						'@type': 'Review',
						author: formatAuthor(reviewData.author),
						// Use only year for datePublished if full date isn't available
						datePublished: String(reviewData.year),
						reviewBody: reviewData.excerpt,
						itemReviewed: {
							'@type': 'Book', // Assuming reviews are always for the book itself
							name: publication.title // Name of the item being reviewed
						},
						publisher: {
							// Publisher of the review journal
							'@type': 'Organization',
							name: reviewData.journal
						},
						url: reviewData.url // URL of the review
					};
					// Add DOI as identifier if available
					if (reviewData.doi) {
						reviewJson.identifier = reviewData.doi;
					}
					return reviewJson;
				});
			}
			break;
		case 'ScholarlyArticle':
		case 'Article': // Handle Articles, Chapters, Encyclopedia Entries
			const articleData = jsonLdObject as Partial<ArticleJsonLd>;
			articleData.author = finalAuthors;
			articleData.datePublished = formattedDatePublished;
			articleData.pagination = publication.pages;
			articleData.publisher = publisherOrg; // Default to main publisher

			// Construct isPartOf based on original source type
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
				// Publisher for chapter is typically the book publisher
				articleData.publisher = publisherOrg;
			} else if (publication.sourceDirType === 'encyclopedia' && publication.encyclopediaTitle) {
				// Represent encyclopedia as a Book
				articleData.isPartOf = {
					'@type': 'Book',
					name: publication.encyclopediaTitle
				};
				// Publisher for entry is typically the encyclopedia publisher
				articleData.publisher = publisherOrg;
			}
			break;
		case 'Report':
			const reportData = jsonLdObject as Partial<ReportJsonLd>;
			reportData.author = finalAuthors;
			reportData.datePublished = formattedDatePublished;
			reportData.publisher = publisherOrg;
			break;
		case 'BlogPosting':
			const blogData = jsonLdObject as Partial<BlogPostingJsonLd>;
			blogData.author = finalAuthors;
			blogData.datePublished = formattedDatePublished;
			blogData.publisher = publisherOrg;
			break;
		case 'Thesis':
			const thesisData = jsonLdObject as Partial<ThesisJsonLd>;
			thesisData.author = finalAuthors;
			thesisData.datePublished = formattedDatePublished;
			thesisData.publisher = publication.university
				? { '@type': 'Organization', name: publication.university }
				: undefined;
			break;
	}

	// Common optional fields
	if (publication.image) {
		jsonLdObject.image = `${base}/${publication.image}`;
	}
	if (publication.tags) {
		jsonLdObject.keywords = publication.tags.join(', ');
	}

	// Add DOI as identifier using PropertyValue if it exists
	if (publication.doi) {
		// Use the structured PropertyValue approach
		jsonLdObject.identifier = {
			'@type': 'PropertyValue',
			propertyID: 'DOI', // Explicitly state it's a DOI
			value: publication.doi
		};
		// // Simple approach (removed):
		// jsonLdObject.identifier = publication.doi;
	}

	// Stringify the final object
	const jsonLdString = JSON.stringify(jsonLdObject);

	return {
		publication,
		jsonLdString
	};
};
