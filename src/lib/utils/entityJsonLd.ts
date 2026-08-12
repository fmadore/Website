/**
 * Per-entity JSON-LD builders for detail pages (schema.org structured data).
 *
 * Split out of jsonLdSchemas.ts: this module owns the entity-specific
 * builders (publications, communications, DH projects, activities);
 * jsonLdSchemas.ts owns the generic site/page schema factories.
 */
import type { Activity } from '$lib/types/activity';
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
import { author, address, website } from '$lib/data/siteConfig';
import { stripHtml } from '$lib/utils/textUtils';

/**
 * Abstracts may carry inline markup (`<i>` around transliterated terms).
 * schema.org `description` is a plain-text field, so strip it here.
 */
function plainAbstract(abstract: string | undefined): string | undefined {
	return abstract ? stripHtml(abstract) : abstract;
}

/**
 * The site owner as the canonical Person node shared by the whole site.
 * Identity is checked against `author.name` from siteConfig — never a
 * hardcoded name string (see CLAUDE.md "Author/Affiliation Data").
 */
function siteAuthorIdentity(): JsonLdPerson {
	return {
		...formatAuthor(author.name),
		'@id': `${website.url}/#person`,
		url: website.url
	};
}

/** Link only the site owner; preserve every other person and the original order. */
function withSiteAuthorIdentity(persons: JsonLdPerson[]): JsonLdPerson[] {
	return persons.map((person) => (person.name === author.name ? siteAuthorIdentity() : person));
}

/** Format a complete contributor list without collapsing co-authors or co-editors. */
function formatPeopleWithSiteIdentity(names: string[]): JsonLdPerson[] {
	return withSiteAuthorIdentity(formatAuthors(names));
}

/**
 * Publication data stores container editors as a display string. Convert the
 * documented comma/"and" separators to individual Person nodes before adding
 * identity data, so a co-edited book never becomes one composite person.
 */
function formatEditorString(editors: string): JsonLdPerson[] {
	return formatPeopleWithSiteIdentity(
		editors
			.split(/\s*(?:,|\band\b)\s*/u)
			.map((name) => name.trim())
			.filter(Boolean)
	);
}

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
		case 'workingPapers':
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
		description: plainAbstract(publication.abstract),
		url: `${base}/publications/${publication.id}`,
		copyrightYear: publication.year,
		inLanguage: publication.language
	};

	if (publication.country && publication.country.length > 0) {
		jsonLdObject.spatialCoverage = formatPlaces(publication.country);
	}

	// Format every contributor; only the site owner receives the canonical @id.
	const finalAuthors = publication.authors
		? formatPeopleWithSiteIdentity(publication.authors)
		: undefined;

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
						author: withSiteAuthorIdentity([formatAuthor(reviewData.author)])[0]!,
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
			if (publication.isEditedWork) {
				articleData.editor = finalAuthors;
			} else {
				articleData.author = finalAuthors;
			}
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
					editor: publication.editors ? formatEditorString(publication.editors) : undefined
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
		description: plainAbstract(communication.abstract),
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
		jsonLdObject.performer = formatPeopleWithSiteIdentity(communication.authors);
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

	jsonLdObject.author = [siteAuthorIdentity()];

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

/**
 * Build the schema.org BlogPosting JSON-LD object for an activity page.
 * Extracted verbatim from `activities/[id]/+page.ts`.
 */
export function buildActivityJsonLd(activity: Activity, base = ''): BlogPostingJsonLd {
	// Format date with time and timezone (Berlin CET = UTC+1)
	// Note: This assumes CET. If activity dates span DST changes, logic might need adjustment.
	const formattedDatePublished = `${activity.dateISO}T00:00:00+01:00`;

	const jsonLdObject: Partial<BlogPostingJsonLd> = {
		'@context': 'https://schema.org',
		'@type': 'BlogPosting',
		name: activity.title,
		headline: activity.title,
		description: activity.description,
		datePublished: formattedDatePublished
	};

	// Site owner as author, with position + affiliation for the blog register
	jsonLdObject.author = {
		...siteAuthorIdentity(),
		jobTitle: author.jobTitle,
		affiliation: {
			'@type': 'Organization',
			name: address.institution
		}
	};

	if (activity.heroImage?.src) {
		jsonLdObject.image = `${base}/${activity.heroImage.src}`;
	}
	if (activity.tags) {
		jsonLdObject.keywords = activity.tags.join(', ');
	}

	return jsonLdObject as BlogPostingJsonLd;
}
