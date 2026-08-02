import type { RequestHandler } from '@sveltejs/kit';
import { allResearchProjects } from '$lib/data/research';
import { publicationsByDate } from '$lib/data/publications/index';
import { communicationsByDate } from '$lib/data/communications/index';
import { grantsByDate } from '$lib/data/grants';
import { fieldworksByDate } from '$lib/data/fieldworks';
import type { ResearchProject } from '$lib/types/research';
import {
	absoluteUrl,
	buildLinks,
	compact,
	datasetPayload,
	jsonResponse
} from '$lib/utils/apiPayload';

// Prerendered to build/api/research.json alongside the rest of the site.
export const prerender = true;

/** Inclusive span parsed from a `years` string ('2021-2024', '2025-'). */
function parseYears(years: string): { startYear?: number; endYear?: number } {
	const [rawStart = '', rawEnd] = years.split('-');
	const startYear = Number.parseInt(rawStart, 10);
	const endYear = rawEnd ? Number.parseInt(rawEnd, 10) : NaN;
	return {
		startYear: Number.isNaN(startYear) ? undefined : startYear,
		endYear: Number.isNaN(endYear) ? undefined : endYear
	};
}

/**
 * Research projects are the spine the rest of the corpus hangs off: publications,
 * talks, grants and fieldwork all carry a `project` field naming one. Resolving
 * those here saves a consumer from having to join on a free-text label — the
 * exact join an MCP tool would otherwise get subtly wrong.
 */
const serialise = (project: ResearchProject) => {
	const { projectName } = project;

	return compact({
		id: project.id,
		url: absoluteUrl(`/research/${project.id}`),
		title: project.title,
		shortTitle: project.shortTitle,
		subtitle: project.subtitle,
		years: project.years,
		...parseYears(project.years),
		current: project.current ?? false,
		shortDescription: project.shortDescription,
		/** Longer editorial summary; the full narrative is on the project page. */
		description: project.seoDescription,
		keywords: project.seoKeywords?.split(',').map((keyword) => keyword.trim()),
		regions: project.regions,
		sourceLanguages: project.sourceLanguages,
		coDirectors: project.coDirectors,
		funder: project.funder,
		programme: project.programme,

		// Cross-references, by id, into the other datasets.
		publications: publicationsByDate.filter((p) => p.project === projectName).map((p) => p.id),
		communications: communicationsByDate.filter((c) => c.project === projectName).map((c) => c.id),
		grants: grantsByDate.filter((g) => g.project === projectName).map((g) => g.id),
		fieldwork: fieldworksByDate.filter((f) => f.project === projectName).map((f) => f.id),

		image: absoluteUrl(`/images/research/${project.imageSrc}`),
		audio: project.audioSrc ? absoluteUrl(project.audioSrc) : undefined,
		links: buildLinks((project.ctas ?? []).map((cta) => ({ label: cta.label, url: cta.href })))
	});
};

export const GET: RequestHandler = async () =>
	jsonResponse(datasetPayload('research', allResearchProjects.map(serialise)));
