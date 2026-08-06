// src/lib/data/research/index.ts
import type { ResearchProject } from '$lib/types/research';
import { loadData } from '$lib/utils/dataLoader';

type ModuleType = Record<string, unknown>;

const projectModules = import.meta.glob<ModuleType>(['./*.ts', '!./index.ts'], { eager: true });

/**
 * Research projects, ordered as the landing page prints them: explicit `order`
 * first, then reverse chronology. The narrative for each lives in its route
 * page (`src/routes/research/<id>/+page.svelte`); these records hold the
 * metadata that the landing page, `/llms.txt`, and `/api/research.json` share.
 */
export const allResearchProjects: ResearchProject[] = loadData<ResearchProject>(
	projectModules,
	[],
	'research-project'
).sort((a, b) => {
	const orderA = a.order ?? Infinity;
	const orderB = b.order ?? Infinity;
	if (orderA !== orderB) return orderA - orderB;
	return b.years.localeCompare(a.years);
});

const byId = new Map(allResearchProjects.map((project) => [project.id, project]));

/**
 * `projectName` → route slug, for detail pages that link an item back to the
 * project it belongs to. Derived from the dataset rather than hand-listed, so a
 * new project is linked the moment its record exists — the earlier hardcoded
 * map on the publication page had already fallen a project behind.
 */
const idByProjectName = new Map(
	allResearchProjects.map((project) => [project.projectName, project.id])
);

/**
 * The research page a publication or communication belongs to, as a path
 * relative to the site root (no `base` prefix — callers add it). Returns
 * undefined for items whose `project` names no research project.
 */
export function researchProjectPath(projectName: string | undefined): string | undefined {
	const id = projectName ? idByProjectName.get(projectName) : undefined;
	return id ? `/research/${id}` : undefined;
}

/**
 * Look up a project so its route page can spread the record into the layout.
 * Throws rather than returning undefined: a page under /research/<id> with no
 * record behind it is a build-time bug, and failing the build beats shipping a
 * project page with an empty header.
 */
export function researchProject(id: string): ResearchProject {
	const project = byId.get(id);
	if (!project) throw new Error(`No research project record for id "${id}"`);
	return project;
}

/** Ongoing work — the landing page's lead section. */
export const currentResearchProjects = allResearchProjects.filter((project) => project.current);

/** Concluded work — the landing page's "Earlier projects" section. */
export const pastResearchProjects = allResearchProjects.filter((project) => !project.current);
