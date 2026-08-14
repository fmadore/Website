import type { RequestHandler } from '@sveltejs/kit';
import { communicationsByDate } from '$lib/data/communications/index';
import type { Communication } from '$lib/types/communication';
import {
	absoluteUrl,
	buildLinks,
	compact,
	datasetPayload,
	jsonResponse
} from '$lib/utils/apiPayload';

// Prerendered to build/api/communications.json alongside the rest of the site.
export const prerender = true;

const serialise = (comm: Communication) =>
	compact({
		id: comm.id,
		url: absoluteUrl(`/communications/${comm.id}`),
		type: comm.type,
		title: comm.title,
		authors: comm.authors,
		date: comm.date,
		dateISO: comm.dateISO,
		year: comm.year,
		language: comm.language,
		abstract: comm.abstract,

		// Venue
		conference: comm.conference,
		panelTitle: comm.panelTitle,
		location: comm.location,
		country: comm.country,
		coordinates: comm.coordinates,

		// Panels carry their own programme; podcasts carry an episode number.
		papers: comm.papers,
		participants: comm.participants,
		episode: comm.episode,

		doi: comm.doi,
		tags: comm.tags,
		project: comm.project,

		image: comm.image ? absoluteUrl(comm.image) : undefined,
		heroImage: comm.heroImage
			? compact({
					src: absoluteUrl(comm.heroImage.src),
					alt: comm.heroImage.alt,
					caption: comm.heroImage.caption
				})
			: undefined,
		links: buildLinks(
			[
				{ label: comm.urlLabel ?? 'Presentation', url: comm.url },
				{ label: 'Slides', url: comm.slidesUrl },
				{ label: 'DOI', url: comm.doi ? `https://doi.org/${comm.doi}` : undefined }
			],
			comm.additionalUrls
		)
	});

export const GET: RequestHandler = async () =>
	jsonResponse(datasetPayload('communications', communicationsByDate.map(serialise)));
