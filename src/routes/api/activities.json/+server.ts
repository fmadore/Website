import type { RequestHandler } from '@sveltejs/kit';
import { activitiesByDate } from '$lib/data/activities';
import type { Activity } from '$lib/types/activity';
import {
	absoluteUrl,
	buildLinks,
	compact,
	datasetPayload,
	jsonResponse
} from '$lib/utils/apiPayload';

// Prerendered to build/api/activities.json alongside the rest of the site.
export const prerender = true;

const serialise = (activity: Activity) =>
	compact({
		id: activity.id,
		url: absoluteUrl(`/activities/${activity.id}`),
		type: activity.type ?? activity.panelType,
		title: activity.title,
		date: activity.date,
		dateISO: activity.dateISO,
		year: activity.year,
		description: activity.description,
		/** Full entry body. HTML, as authored for the detail page. */
		content: activity.content,
		tags: activity.tags,

		image: activity.image ? absoluteUrl(activity.image) : undefined,
		heroImage: activity.heroImage
			? compact({
					src: absoluteUrl(activity.heroImage.src),
					alt: activity.heroImage.alt,
					caption: activity.heroImage.caption
				})
			: undefined,
		links: buildLinks(
			[
				{ label: activity.urlLabel ?? 'Source', url: activity.url },
				{ label: activity.pdfTitle ?? 'PDF', url: activity.pdfPath }
			],
			activity.additionalUrls
		)
	});

export const GET: RequestHandler = async () =>
	jsonResponse(datasetPayload('activities', activitiesByDate.map(serialise)));
