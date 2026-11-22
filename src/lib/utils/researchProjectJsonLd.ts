/**
 * The structured data of a research project page: one `@graph` holding the
 * project's ResearchProject node and the MonetaryGrant nodes of its awarded
 * grants, the first naming the others in its `funding`. Pure: the caller
 * renders the result through `<RecordLayout>`'s `<JsonLd>` so it lands in the
 * prerendered HTML.
 *
 * @see https://schema.org/ResearchProject
 * @see https://schema.org/MonetaryGrant
 */

import { allGrants } from '#lib/data/grants/index.ts';
import type { Communication } from '#lib/types/communication.ts';
import type { Publication } from '#lib/types/publication.ts';
import type { ResearchProject } from '#lib/types/research.ts';
import { buildResearchProjectJsonLd } from '#lib/utils/entityJsonLd.ts';
import { combineSchemas, createMonetaryGrantSchemas } from '#lib/utils/jsonLdSchemas.ts';
import { siteUrl } from '#lib/utils/siteHelpers.ts';

export const RESEARCH_PROJECT_SCRIPT_ID = 'research-project-json-ld';

type ProjectRecord = Parameters<typeof buildResearchProjectJsonLd>[0] &
	Pick<ResearchProject, 'projectName'>;

/** A dated record, as both summaries carry it. */
type Output = { id: string; title: string; project?: string; dateISO?: string };

const newestFirst = (a: Output, b: Output) => (b.dateISO ?? '').localeCompare(a.dateISO ?? '');

/**
 * The project's graph. Grants, publications and talks are gathered by
 * `projectName`, the same key the rail and the related-work panels use, so
 * the structured data names exactly the work the page lists.
 */
export function buildResearchProjectGraph(
	project: ProjectRecord,
	sources: {
		publications: readonly Pick<Publication, 'id' | 'title' | 'project' | 'dateISO'>[];
		communications: readonly Pick<Communication, 'id' | 'title' | 'project' | 'dateISO'>[];
		directors: string[];
	}
): string {
	const pageUrl = siteUrl(`/research/${project.id}`);
	const grants = createMonetaryGrantSchemas(
		allGrants.filter((grant) => project.projectName && grant.project === project.projectName),
		pageUrl
	);
	const ofProject = (record: Output) =>
		Boolean(project.projectName) && record.project === project.projectName;

	const node = buildResearchProjectJsonLd(project, {
		grantIds: grants.flatMap((grant) => (grant['@id'] ? [grant['@id']] : [])),
		publications: sources.publications.filter(ofProject).sort(newestFirst),
		communications: sources.communications.filter(ofProject).sort(newestFirst),
		directors: sources.directors
	});
	return combineSchemas([node, ...grants]);
}
