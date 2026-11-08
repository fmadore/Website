import type { RequestHandler } from '@sveltejs/kit';
import { getContributorNames } from '#lib/utils/contributor.ts';
import { publicationsByDate } from '#lib/data/publications/index.ts';
import { citationContextSets } from '#lib/data/citation-contexts/index.ts';
import type { CitationContextSet } from '#lib/types/citationContext.ts';
import type { CitingWork, Publication, TableOfContentsEntry } from '#lib/types/publication.ts';
import { citingKey } from '#lib/utils/citationContexts.ts';
import {
	absoluteUrl,
	buildLinks,
	compact,
	datasetPayload,
	jsonResponse
} from '#lib/utils/apiPayload.ts';

// Prerendered to build/api/publications.json alongside the rest of the site.
export const prerender = true;

/** Normalise the legacy `string` form of a table-of-contents entry. */
const tocEntry = (entry: string | TableOfContentsEntry) =>
	typeof entry === 'string' ? { title: entry } : compact({ ...entry });

const contextSets = new Map(citationContextSets.map((set) => [set.id, set]));

/**
 * The `citedBy` list, each entry carrying — where the citing work has been
 * read — how it cites the publication: the passages quoted from its text, or
 * that it lists the work in its bibliography only. The same join
 * `/publications/citations` prints (`citingKey`: the entry's QID, else its URL).
 */
function citedByWithContexts(pub: Publication, set: CitationContextSet | undefined) {
	if (!pub.citedBy) return undefined;
	const contexts = new Map(set?.contexts.map((context) => [context.citing, context]));
	return pub.citedBy.map((work: CitingWork) => {
		const key = citingKey(work);
		const context = key ? contexts.get(key) : undefined;
		if (!context) return work;
		return {
			...work,
			context: compact({
				status: context.status,
				language: context.language,
				passages: context.passages?.map((passage) => compact({ ...passage }))
			})
		};
	});
}

const serialise = (pub: Publication) => {
	const contextSet = contextSets.get(pub.id);
	return compact({
		id: pub.id,
		url: absoluteUrl(`/publications/${pub.id}`),
		type: pub.type,
		title: pub.title,
		authors: getContributorNames(pub.authors),
		date: pub.date,
		dateISO: pub.dateISO,
		year: pub.year,
		language: pub.language,
		abstract: pub.abstract,

		// Identifiers
		doi: pub.doi,
		isbn: pub.isbn,
		issn: pub.issn,
		wikidataId: pub.wikidataId,
		openAlexId: pub.openAlexId,
		/** True only when the full text is freely readable; authored per record, never derived. */
		openAccess: pub.openAccess,

		// Container: journal article, chapter, encyclopedia entry, proceedings
		journal: pub.journal,
		volume: pub.volume,
		issue: pub.issue,
		pages: pub.pages,
		book: pub.book,
		editors: pub.editors,
		encyclopediaTitle: pub.encyclopediaTitle,
		proceedingsTitle: pub.proceedingsTitle,
		conferenceName: pub.conferenceName,
		conferenceLocation: pub.conferenceLocation,

		// Imprint
		publisher: pub.publisher,
		placeOfPublication: pub.placeOfPublication,
		publisherLocation: pub.publisherLocation,
		series: pub.series,
		pageCount: pub.pageCount,

		// Theses and reports
		university: pub.university,
		department: pub.department,
		advisors: pub.advisors,
		institution: pub.institution,
		reportNumber: pub.reportNumber,

		// Edited works
		isEditedVolume: pub.isEditedVolume,
		isEditedWork: pub.isEditedWork,
		prefacedBy: pub.prefacedBy,
		tableOfContents: pub.tableOfContents?.map(tocEntry),

		// Classification
		tags: pub.tags,
		country: pub.country,
		project: pub.project,
		featured: pub.featured,

		// Scholarly apparatus
		citedBy: citedByWithContexts(pub, contextSet),
		/** Who located the quoted citation passages, and when; present when any entry has a `context`. */
		citationContexts: contextSet
			? { model: contextSet.model, extracted: contextSet.extracted }
			: undefined,
		reviewedBy: pub.reviewedBy,

		image: pub.image ? absoluteUrl(pub.image) : undefined,
		heroImage: pub.heroImage
			? compact({
					src: absoluteUrl(pub.heroImage.src),
					alt: pub.heroImage.alt,
					caption: pub.heroImage.caption
				})
			: undefined,
		links: buildLinks(
			[
				{ label: 'Source', url: pub.url },
				{ label: 'PDF', url: pub.pdfUrl },
				{ label: 'DOI', url: pub.doi ? `https://doi.org/${pub.doi}` : undefined }
			],
			pub.additionalUrls
		)
	});
};

export const GET: RequestHandler = async () =>
	jsonResponse(datasetPayload('publications', publicationsByDate.map(serialise)));
