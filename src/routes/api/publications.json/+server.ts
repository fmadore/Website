import type { RequestHandler } from '@sveltejs/kit';
import { publicationsByDate } from '$lib/data/publications/index';
import type { Publication, TableOfContentsEntry } from '$lib/types/publication';
import {
	absoluteUrl,
	buildLinks,
	compact,
	datasetPayload,
	jsonResponse
} from '$lib/utils/apiPayload';

// Prerendered to build/api/publications.json alongside the rest of the site.
export const prerender = true;

/** Normalise the legacy `string` form of a table-of-contents entry. */
const tocEntry = (entry: string | TableOfContentsEntry) =>
	typeof entry === 'string' ? { title: entry } : compact({ ...entry });

const serialise = (pub: Publication) =>
	compact({
		id: pub.id,
		url: absoluteUrl(`/publications/${pub.id}`),
		type: pub.type,
		title: pub.title,
		authors: pub.authors,
		date: pub.date,
		dateISO: pub.dateISO,
		year: pub.year,
		language: pub.language,
		abstract: pub.abstract,

		// Identifiers
		doi: pub.doi,
		isbn: pub.isbn,
		issn: pub.issn,

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
		citedBy: pub.citedBy,
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

export const GET: RequestHandler = async () =>
	jsonResponse(datasetPayload('publications', publicationsByDate.map(serialise)));
