import type { RequestHandler } from '@sveltejs/kit';
import { author, address, contact, website } from '$lib/data/siteConfig';
import { allPublications, publicationsByDate } from '$lib/data/publications/index';
import { allCommunications, communicationsByDate } from '$lib/data/communications/index';
import { allActivities, activitiesByDate } from '$lib/data/activities';
import { allDhProjects } from '$lib/data/digital-humanities';
import { allResearchProjects } from '$lib/data/research';
import { API_VERSION, compact, jsonResponse } from '$lib/utils/apiPayload';

// Prerendered to build/api/index.json alongside the rest of the site.
export const prerender = true;

const SITE = website.url;

/** Inclusive year span of a dated collection, or undefined when it is empty. */
function yearRange(items: Array<{ year: number }>): { from: number; to: number } | undefined {
	if (items.length === 0) return undefined;
	const years = items.map((item) => item.year);
	return { from: Math.min(...years), to: Math.max(...years) };
}

/**
 * Discovery manifest for the static JSON API.
 *
 * A consumer fetches this one document to learn what datasets exist, how large
 * they are, and where they live — the same role `/llms.txt` plays for prose.
 */
export const GET: RequestHandler = async () => {
	const payload = {
		version: API_VERSION,
		url: `${SITE}/api/index.json`,
		site: {
			name: `${author.name} — academic website`,
			url: SITE,
			license: 'MIT',
			source: 'https://github.com/fmadore/website'
		},
		person: {
			name: author.name,
			position: author.position,
			email: contact.email,
			affiliation: `${address.department}, ${address.institution}`
		},
		datasets: [
			compact({
				name: 'research',
				url: `${SITE}/api/research.json`,
				description:
					'Research projects — the spine of the corpus. Each carries its span, regions, source languages, funding, and the ids of the publications, talks, grants and fieldwork that belong to it.',
				count: allResearchProjects.length
			}),
			compact({
				name: 'publications',
				url: `${SITE}/api/publications.json`,
				description:
					'Books, journal articles, chapters, edited volumes, reports, encyclopedia entries, theses and working papers, with identifiers, abstracts, citing works and reviews.',
				count: allPublications.length,
				years: yearRange(publicationsByDate)
			}),
			compact({
				name: 'communications',
				url: `${SITE}/api/communications.json`,
				description:
					'Conference papers, invited lectures, seminars, workshops, panels, posters and podcasts, with venue, coordinates and programme details.',
				count: allCommunications.length,
				years: yearRange(communicationsByDate)
			}),
			compact({
				name: 'activities',
				url: `${SITE}/api/activities.json`,
				description: 'News and scholarly activity entries, including the full HTML body of each.',
				count: allActivities.length,
				years: yearRange(activitiesByDate)
			}),
			compact({
				name: 'digital-humanities',
				url: `${SITE}/api/digital-humanities.json`,
				description:
					'Digital archives, datasets and tools, including the Islam West Africa Collection (IWAC), with skills, awards and reviews.',
				count: allDhProjects.length
			}),
			compact({
				name: 'cv',
				url: `${SITE}/api/cv.json`,
				description:
					'Career record keyed by section: appointments, education, research roles, grants, awards, teaching, editorial memberships, peer reviews, affiliations, fieldwork, media appearances and languages.'
			})
		],
		/** Other machine-readable views of the same content. */
		related: [
			{ name: 'llms.txt', url: `${SITE}/llms.txt`, description: 'Curated site map for AI agents.' },
			{ name: 'rss', url: `${SITE}/rss.xml`, description: 'Latest activities and updates.' },
			{
				name: 'publications-rss',
				url: `${SITE}/publications/rss.xml`,
				description: 'Latest publications.'
			},
			{ name: 'sitemap', url: `${SITE}/sitemap.xml`, description: 'Full list of indexable pages.' }
		],
		notes: [
			'Every dataset document carries { version, dataset, url, count, items }; /api/cv.json carries { version, dataset, url, person, sections } instead.',
			'Keys with no value are omitted rather than serialised as null, so absent fields simply do not appear.',
			'Item `url` is the canonical page on this site; external addresses are collected in `links`.',
			'/api/research.json cross-references the other datasets by id — join on those rather than on the free-text `project` label.',
			'These files are rebuilt with the site and served statically, so they are read-only: there is no query interface, fetch a whole dataset and filter locally.'
		]
	};

	return jsonResponse(payload);
};
