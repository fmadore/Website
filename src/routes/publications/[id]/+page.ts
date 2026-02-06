import { error } from '@sveltejs/kit';
import { base } from '$app/paths';
import { allPublications } from '$lib/data/publications/index';
import type { ReviewWork } from '$lib/types';
import type { PageLoad } from './$types';
import type {
	PublicationJsonLd,
	JsonLdPerson,
	BookJsonLd,
	ArticleJsonLd,
	ReportJsonLd,
	BlogPostingJsonLd,
	ThesisJsonLd,
	JsonLdScholarlyArticleCitation
} from '$lib/types/jsonld';
import { formatAuthor, formatAuthors, formatPlaces } from '$lib/types/jsonld';

// --- Load Function ---
export const load: PageLoad = ({ params }) => {
	const publicationId = params.id;
	const publication = allPublications.find((p) => p.id === publicationId);

	if (!publication) {
		throw error(404, 'Publication not found');
	}

	let resolvedType: PublicationJsonLd['@type'];
	switch (publication.sourceDirType) {
		case 'books':
			resolvedType = 'Book';
			break;
		case 'articles':
			// Check if it's a bulletin-article type
			if (publication.type === 'bulletin-article') {
				resolvedType = 'Article';
			} else {
				resolvedType = 'ScholarlyArticle';
			}
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

	// Add spatialCoverage if countries exist
	if (publication.country && publication.country.length > 0) {
		jsonLdObject.spatialCoverage = formatPlaces(publication.country);
	}

	// Format common fields
	const authors = publication.authors ? formatAuthors(publication.authors) : undefined;
	// Add author URL directly here
	const defaultAuthorWithUrl: JsonLdPerson | undefined = authors?.find(
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

			// Add academic book reviews as citations (ScholarlyArticle)
			// This is more appropriate than Review schema because:
			// 1. Academic reviews don't have numerical ratings
			// 2. Google's Review schema expects aggregateRating for rich results
			// 3. Citations better represent the scholarly nature of these reviews
			if (publication.reviewedBy && publication.reviewedBy.length > 0) {
				bookData.citation = publication.reviewedBy.map((reviewData: ReviewWork) => {
					const citationJson: JsonLdScholarlyArticleCitation = {
						'@type': 'ScholarlyArticle',
						name: reviewData.title,
						author: formatAuthor(reviewData.author),
						datePublished: String(reviewData.year),
						url: reviewData.url
					};
					// Add journal as the periodical this article is part of
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
			// Handle Articles, Chapters, Encyclopedia Entries
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
