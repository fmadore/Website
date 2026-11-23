/**
 * Per-entity JSON-LD builders for detail pages (schema.org structured data).
 *
 * Split out of jsonLdSchemas.ts: this module owns the entity-specific
 * builders (publications, communications, DH projects, activities);
 * jsonLdSchemas.ts owns the generic site/page schema factories.
 */
import type { Activity } from '#lib/types/activity.ts';
import type { Publication } from '#lib/types/publication.ts';
import type { Contributor } from '#lib/types/contributor.ts';
import type { Communication } from '#lib/types/communication.ts';
import {
	DEFAULT_APPLICATION_CATEGORY,
	type DigitalHumanitiesProject
} from '#lib/types/digitalHumanities.ts';
import type { ReviewWork } from '#lib/types/index.ts';
import type {
	PublicationJsonLd,
	JsonLdAgent,
	JsonLdPerson,
	BookJsonLd,
	ArticleJsonLd,
	ReportJsonLd,
	BlogPostingJsonLd,
	ThesisJsonLd,
	JsonLdScholarlyArticleCitation,
	EventJsonLd,
	CreativeWorkJsonLd,
	JsonLdProjectPart,
	ResearchProjectJsonLd,
	JsonLdNodeReference
} from '#lib/types/jsonld.ts';
import type { ResearchProject } from '#lib/types/research.ts';
import { formatAuthor, formatAuthors, formatPlaces, formatJsonLdDate } from '#lib/types/jsonld.ts';
import { author, address, website } from '#lib/data/siteConfig.ts';
import { siteUrl } from '#lib/utils/siteHelpers.ts';
import {
	recordEntityId,
	webPageId,
	wikidataEntityUrl,
	wikidataPageUrl
} from '#lib/utils/jsonLdSchemas.ts';
import { jsonLdLanguage } from '#lib/utils/languageUtils.ts';
import { stripHtml } from '#lib/utils/textUtils.ts';
import { splitNames } from '#lib/utils/nameUtils.ts';
import { projectLinkText, projectLinksOfType } from '#lib/utils/projectLinks.ts';
import { parseProjectPeriod } from '#lib/utils/projectPeriod.ts';

/**
 * The identity every record node carries: its own `@id`, its page as `url`,
 * and that page's WebPage node as `mainEntityOfPage` — the other half of the
 * `mainEntity` link the page's own schema makes back to the record. All
 * absolute on the production origin: structured data is read out of context,
 * and Kit's `base` (`.` or `..` under `paths.relative`) means nothing there.
 */
function recordIdentity(path: string) {
	return {
		'@id': recordEntityId(path),
		url: siteUrl(path),
		mainEntityOfPage: { '@id': webPageId(path) }
	};
}

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
function withSiteAuthorIdentity<T extends JsonLdAgent>(agents: T[]): (T | JsonLdPerson)[] {
	return agents.map((agent) =>
		agent['@type'] === 'Person' && agent.name === author.name ? siteAuthorIdentity() : agent
	);
}

/** Format a complete contributor list without collapsing co-authors or co-editors. */
function formatPeopleWithSiteIdentity(names: readonly Contributor[]): JsonLdAgent[] {
	return withSiteAuthorIdentity(formatAuthors(names));
}

/**
 * Publication data stores container editors as a display string. Convert the
 * documented comma/"and" separators to individual Person nodes before adding
 * identity data, so a co-edited book never becomes one composite person.
 */
function formatEditorString(editors: string): JsonLdAgent[] {
	return formatPeopleWithSiteIdentity(splitNames(editors));
}

/**
 * The source directories a publication can come from, as the data loader names
 * them (`PUBLICATION_DIRECTORY_TYPES` in `dataMetadata.ts`, which is typed
 * `Record<string, string>`; `entityJsonLd.test.ts` holds the two in step).
 * The resolver below switches over this union exhaustively, so a new
 * directory fails the type-check here instead of being published as a Book.
 */
export type PublicationDirectoryType =
	| 'books'
	| 'articles'
	| 'bulletins'
	| 'chapters'
	| 'specialIssues'
	| 'reports'
	| 'encyclopedia'
	| 'blogposts'
	| 'dissertations'
	| 'proceedings'
	| 'workingPapers';

/** Publication as enriched by the data loader (adds the source directory). */
type PublicationWithSource = Publication & { sourceDirType: string };

/**
 * Map a publication's source directory to its schema.org @type. Also the
 * record page's FAIR Signposting `type` link, so the two never disagree.
 *
 * There is no default: `bulletins` and `proceedings` once fell to a `Book`
 * fallback, which published five bulletin notes and four conference papers as
 * books with no container and no pages. An unknown directory throws, which
 * fails the prerender of that record rather than shipping it mistyped.
 */
export function resolvePublicationJsonLdType(
	publication: PublicationWithSource
): PublicationJsonLd['@type'] {
	const dir = publication.sourceDirType as PublicationDirectoryType;
	switch (dir) {
		case 'books':
			return 'Book';
		case 'articles':
		case 'specialIssues':
		case 'proceedings':
			return 'ScholarlyArticle';
		case 'bulletins':
		case 'chapters':
		case 'encyclopedia':
			return 'Article';
		case 'reports':
		case 'workingPapers':
			return 'Report';
		case 'blogposts':
			return 'BlogPosting';
		case 'dissertations':
			return 'Thesis';
		default: {
			const unhandled: never = dir;
			throw new Error(
				`No schema.org type for publication directory "${String(unhandled)}" (${publication.id})`
			);
		}
	}
}

/**
 * The work's identity elsewhere, for schema.org `sameAs`: its DOI, Wikidata
 * item and OpenAlex record, each where the record carries one.
 */
function publicationSameAs(publication: Publication): string[] | undefined {
	const links = [
		publication.doi ? `https://doi.org/${publication.doi}` : undefined,
		publication.wikidataId ? wikidataEntityUrl(publication.wikidataId) : undefined,
		publication.openAlexId ? `https://openalex.org/${publication.openAlexId}` : undefined
	].filter((link): link is string => Boolean(link));
	return links.length > 0 ? links : undefined;
}

/**
 * Build the schema.org JSON-LD object for a publication detail page.
 *
 * Extracted verbatim from `publications/[id]/+page.ts` so the loader stays a
 * thin lookup and the (pure) schema-construction logic can be unit-tested.
 */
export function buildPublicationJsonLd(publication: PublicationWithSource): PublicationJsonLd {
	const resolvedType = resolvePublicationJsonLdType(publication);

	const jsonLdObject: Partial<PublicationJsonLd> = {
		'@context': 'https://schema.org',
		'@type': resolvedType,
		...recordIdentity(`/publications/${publication.id}`),
		name: publication.title,
		headline: publication.title,
		description: plainAbstract(publication.abstract),
		copyrightYear: publication.year,
		inLanguage: jsonLdLanguage(publication.language),
		sameAs: publicationSameAs(publication),
		// Only asserted, never denied: a record without the flag is one whose
		// access we have not recorded, not one we know to be paywalled.
		isAccessibleForFree: publication.openAccess === true ? true : undefined
	};

	if (publication.country && publication.country.length > 0) {
		jsonLdObject.spatialCoverage = formatPlaces(publication.country);
	}

	// Format every contributor; only the site owner receives the canonical @id.
	const finalAuthors = publication.authors
		? formatPeopleWithSiteIdentity(publication.authors)
		: undefined;

	const formattedDatePublished = formatJsonLdDate(publication.dateISO);
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
						url: reviewData.url,
						...(reviewData.wikidataId ? { sameAs: [wikidataPageUrl(reviewData.wikidataId)] } : {})
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
			// Articles, bulletin notes, special issues, proceedings papers,
			// chapters, encyclopedia entries
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
				publication.sourceDirType === 'bulletins' ||
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
			} else if (publication.sourceDirType === 'proceedings') {
				// The proceedings volume is the container; the conference name
				// stands in when the volume's own title is not recorded.
				const container = publication.proceedingsTitle ?? publication.conferenceName;
				if (container) {
					articleData.isPartOf = { '@type': 'Book', name: container };
				}
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
		jsonLdObject.image = siteUrl(publication.image);
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
export function buildCommunicationJsonLd(communication: Communication): EventJsonLd {
	const jsonLdObject: Partial<EventJsonLd> = {
		'@context': 'https://schema.org',
		'@type': 'Event',
		...recordIdentity(`/communications/${communication.id}`),
		name: communication.title,
		description: plainAbstract(communication.abstract),
		startDate: formatJsonLdDate(communication.dateISO)
	};

	if (communication.location || communication.country) {
		const locationParts = [communication.location, communication.country]
			.filter(Boolean)
			.join(', ');
		const { coordinates } = communication;
		jsonLdObject.location = {
			'@type': 'Place',
			name: locationParts,
			...(communication.country
				? { address: { '@type': 'PostalAddress', addressCountry: communication.country } }
				: {}),
			...(coordinates
				? {
						geo: {
							'@type': 'GeoCoordinates',
							latitude: coordinates.latitude,
							longitude: coordinates.longitude
						}
					}
				: {})
		};
	}

	if (communication.authors && communication.authors.length > 0) {
		jsonLdObject.performer = formatPeopleWithSiteIdentity(communication.authors);
	}

	const image = communication.heroImage?.src || communication.image;
	if (image) {
		jsonLdObject.image = siteUrl(image);
	}

	if (communication.tags) {
		jsonLdObject.keywords = communication.tags.join(', ');
	}

	jsonLdObject.inLanguage = jsonLdLanguage(communication.language);

	if (communication.poster) {
		jsonLdObject.workFeatured = {
			'@type': 'DigitalDocument',
			name: communication.title,
			genre: 'Poster',
			encodingFormat: 'application/pdf',
			url: siteUrl(communication.poster.pdf),
			thumbnailUrl: siteUrl(communication.poster.image)
		};
	}

	return jsonLdObject as EventJsonLd;
}

/**
 * Build the schema.org JSON-LD object for a digital-humanities project page.
 *
 * Applications are modelled as SoftwareApplication, projects with a `site`
 * link as WebSite, and the rest as CreativeWork; code and data links become
 * SoftwareSourceCode and Dataset parts.
 */
export function buildDhProjectJsonLd(project: DigitalHumanitiesProject): CreativeWorkJsonLd {
	const identity = recordIdentity(`/digital-humanities/${project.id}`);
	const sites = projectLinksOfType(project, 'site');
	const app = project.application;

	// An application is software; a project whose main output is its own site is
	// that site; anything else (a pipeline, a collection of exhibits) is a work.
	const jsonLdObject: Partial<CreativeWorkJsonLd> = {
		'@context': 'https://schema.org',
		'@type': app ? 'SoftwareApplication' : sites.length > 0 ? 'WebSite' : 'CreativeWork',
		...identity,
		name: project.title,
		description: project.seoDescription || project.shortDescription
	};

	// A site is the project itself: the first is its `url` (the page here stays
	// `mainEntityOfPage`), any further one the same thing elsewhere. An
	// application keeps this page as its `url` and its site as `sameAs`.
	if (sites.length > 0) {
		const [first, ...rest] = sites.map((link) => link.url);
		if (app) jsonLdObject.sameAs = [first!, ...rest];
		else {
			jsonLdObject.url = first;
			if (rest.length > 0) jsonLdObject.sameAs = rest;
		}
	}

	jsonLdObject.author = [siteAuthorIdentity()];

	if (app) {
		jsonLdObject.operatingSystem = app.operatingSystem;
		jsonLdObject.applicationCategory = app.category ?? DEFAULT_APPLICATION_CATEGORY;
		const install = projectLinksOfType(project, 'install')[0];
		if (install) jsonLdObject.installUrl = install.url;
		if (app.licence) jsonLdObject.license = `https://spdx.org/licenses/${app.licence}.html`;
	}

	// The project's repositories and datasets, as parts of it. schema.org puts
	// `codeRepository` on SoftwareSourceCode, not on the application or the
	// work, so each repository is a node of its own.
	const parts: JsonLdProjectPart[] = [
		...projectLinksOfType(project, 'code').map((link): JsonLdProjectPart => ({
			'@type': 'SoftwareSourceCode',
			name: projectLinkText(link),
			codeRepository: link.url,
			...(app ? { targetProduct: { '@id': identity['@id'] } } : {})
		})),
		...projectLinksOfType(project, 'data').map((link): JsonLdProjectPart => ({
			'@type': 'Dataset',
			name: projectLinkText(link),
			// All a record can say of every data link: some are the project's
			// output, some its source corpus, and the link does not record which.
			description: `A dataset linked from the ${project.title} project.`,
			url: link.url
		}))
	];
	if (parts.length > 0) jsonLdObject.hasPart = parts;

	const image = project.heroImageUrl || project.imageUrl;
	if (image) {
		jsonLdObject.image = siteUrl(image);
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
export function buildActivityJsonLd(activity: Activity): BlogPostingJsonLd {
	const jsonLdObject: Partial<BlogPostingJsonLd> = {
		'@context': 'https://schema.org',
		'@type': 'BlogPosting',
		...recordIdentity(`/activities/${activity.id}`),
		name: activity.title,
		headline: activity.title,
		description: activity.description,
		datePublished: formatJsonLdDate(activity.dateISO)
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
		jsonLdObject.image = siteUrl(activity.heroImage.src);
	}
	if (activity.tags) {
		jsonLdObject.keywords = activity.tags.join(', ');
	}

	return jsonLdObject as BlogPostingJsonLd;
}

/** What a research project's node points at: records in the same graph or on other pages. */
export interface ResearchProjectLinks {
	/** The `@id`s of the project's MonetaryGrant nodes (see `createMonetaryGrantSchemas`). */
	grantIds: string[];
	/** The project's publications, newest first. */
	publications: Pick<Publication, 'id' | 'title'>[];
	/** The project's talks, newest first. */
	communications: Pick<Communication, 'id' | 'title'>[];
	/** Co-directors, as the rail prints them. */
	directors: string[];
}

/**
 * Build the schema.org ResearchProject node for a research project page: the
 * record the page is about, tied to the grants that fund it and to the
 * publications and talks it produced. Those are named by the `@id` their own
 * record pages give them (`recordEntityId`), so a consumer that follows the
 * link lands on the full record rather than on a second, thinner copy here.
 */
export function buildResearchProjectJsonLd(
	project: Pick<
		ResearchProject,
		| 'id'
		| 'title'
		| 'shortTitle'
		| 'years'
		| 'current'
		| 'shortDescription'
		| 'seoDescription'
		| 'seoKeywords'
		| 'imageSrc'
		| 'regions'
	>,
	links: ResearchProjectLinks
): ResearchProjectJsonLd {
	const path = `/research/${project.id}`;
	const node: ResearchProjectJsonLd = {
		'@context': 'https://schema.org',
		'@type': 'ResearchProject',
		'@id': recordEntityId(path),
		url: siteUrl(path),
		mainEntityOfPage: { '@id': webPageId(path) },
		name: project.title,
		description: project.seoDescription || project.shortDescription,
		image: siteUrl(`/images/research/${project.imageSrc}`),
		member: [
			siteAuthorIdentity(),
			...links.directors.filter((name) => name !== author.name).map((name) => formatAuthor(name))
		]
	};
	if (project.shortTitle && project.shortTitle !== project.title) {
		node.alternateName = project.shortTitle;
	}

	// The period: a start year always; an end year only once the work is over,
	// so a current project's planned end is not stated as a fact.
	const period = parseProjectPeriod(project.years, 0);
	if (period) {
		node.foundingDate = String(period.startYear);
		if (!period.ongoing && !project.current) node.dissolutionDate = String(period.endYear);
	}

	if (project.regions?.length) {
		node.areaServed = project.regions.map((name) => ({ '@type': 'Place', name }));
	}
	if (project.seoKeywords) node.keywords = project.seoKeywords;
	if (links.grantIds.length > 0) node.funding = links.grantIds.map((id) => ({ '@id': id }));

	const outputs: JsonLdNodeReference[] = [
		...links.publications.map((publication) => ({
			'@type': 'CreativeWork',
			'@id': recordEntityId(`/publications/${publication.id}`),
			name: publication.title
		})),
		...links.communications.map((communication) => ({
			'@type': 'Event',
			'@id': recordEntityId(`/communications/${communication.id}`),
			name: communication.title
		}))
	];
	if (outputs.length > 0) node.subjectOf = outputs;

	return node;
}
