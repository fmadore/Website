import type { RequestHandler } from '@sveltejs/kit';
import { allDhProjects } from '$lib/data/digital-humanities';
import type { DigitalHumanitiesProject } from '$lib/types/digitalHumanities';
import {
	absoluteUrl,
	buildLinks,
	compact,
	datasetPayload,
	jsonResponse
} from '$lib/utils/apiPayload';

// Prerendered to build/api/digital-humanities.json alongside the rest of the site.
export const prerender = true;

const serialise = (project: DigitalHumanitiesProject) =>
	compact({
		id: project.id,
		url: absoluteUrl(`/digital-humanities/${project.id}`),
		title: project.title,
		years: project.years,
		shortDescription: project.shortDescription,
		/** Full project description. HTML, as authored for the detail page. */
		description: project.description,
		skills: project.skills,
		award: project.award,
		featured: project.featured,
		seoTitle: project.seoTitle,
		seoDescription: project.seoDescription,
		seoKeywords: project.seoKeywords,

		// Scholarly apparatus: the article describing the project, and its reviews.
		publication: project.publication,
		reviews: project.reviews,

		image: project.imageUrl ? absoluteUrl(project.imageUrl) : undefined,
		heroImage: project.heroImageUrl ? absoluteUrl(project.heroImageUrl) : undefined,
		embeddableContent: project.embeddableContent?.map((embed) =>
			compact({
				...embed,
				src: absoluteUrl(embed.src),
				linkUrl: embed.type === 'image' && embed.linkUrl ? absoluteUrl(embed.linkUrl) : undefined
			})
		),
		links: buildLinks([
			{ label: 'Project', url: project.linkUrl },
			// `links` carries a `type` ('site' | 'code' | 'data'); the label defaults
			// to the bare URL on the CV, so fall back to the type for a stable key.
			...(project.links ?? []).map((link) => ({
				label: link.label ?? link.type ?? 'site',
				url: link.url
			}))
		])
	});

export const GET: RequestHandler = async () =>
	jsonResponse(datasetPayload('digital-humanities', allDhProjects.map(serialise)));
