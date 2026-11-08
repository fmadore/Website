import {
	CV_SECTIONS,
	type ApiItem,
	type CvPayload,
	type CvSection,
	type DhProjectGroup
} from '#lib/apiContract.ts';
import { PUBLICATION_TYPE_BADGE_LABELS } from '#lib/utils/publicationTypeLabels.ts';
import { COMMUNICATION_TYPE_BADGE_LABELS } from '#lib/utils/typeUtils.ts';

/**
 * The shapes the two agent surfaces cut from the static API documents: the MCP
 * server in `mcp/` and the WebMCP tools in `webmcp.ts`. The documents are
 * published whole; a tool answering "which project?" or "what is in the CV?"
 * returns the slice below, and the matching `get_*` tool (or the resource)
 * returns the rest. One module, so the same question asked through either
 * surface gets the same answer, and the same bytes.
 */

/** Closed vocabularies of the search tools' `type` filters. */
export const PUBLICATION_TYPES = Object.keys(PUBLICATION_TYPE_BADGE_LABELS) as [
	string,
	...string[]
];
export const COMMUNICATION_TYPES = Object.keys(COMMUNICATION_TYPE_BADGE_LABELS) as [
	string,
	...string[]
];

/** A list tool's result: one object, so `count` travels with the rows. */
export interface ListResult<T> {
	count: number;
	items: T[];
}

const list = <T>(items: T[]): ListResult<T> => ({ count: items.length, items });

/**
 * Research projects without their narratives. Five narratives are ~14 KB of
 * prose a caller orienting itself has not asked for; `bodyChars` says how much
 * `get_research_project` holds.
 */
export function researchProjectList(projects: ApiItem[]): ListResult<ApiItem> {
	return list(
		projects.map(({ body, ...summary }) => ({
			...summary,
			bodyChars: String(body ?? '').length
		}))
	);
}

/**
 * Digital humanities projects and applications without their HTML
 * descriptions, embeds and search-engine copy: those are ~90% of the
 * document's bytes (the whole list once ran to 100,000 characters, past what
 * an MCP client shows a model inline). `descriptionChars` says how much
 * `get_dh_project` holds.
 */
export function dhProjectList(records: ApiItem[], group?: DhProjectGroup): ListResult<ApiItem> {
	return list(
		records
			.filter((record) => !group || record.group === group)
			.map(
				({
					description,
					embeddableContent: _embeds,
					seoTitle: _seoTitle,
					seoDescription: _seoDescription,
					seoKeywords: _seoKeywords,
					...summary
				}) => ({ ...summary, descriptionChars: String(description ?? '').length })
			)
	);
}

/** Entries in a CV section: a list, or (teaching) an object of lists. */
export function cvEntryCount(section: unknown): number {
	if (Array.isArray(section)) return section.length;
	if (section && typeof section === 'object')
		return Object.values(section).reduce<number>((sum, value) => sum + cvEntryCount(value), 0);
	return 0;
}

/**
 * The CV without a section named: the person and the size of each section.
 * The whole document is ~40,000 characters; a caller reads the sections it
 * needs (or the `cv` resource, for everything at once).
 */
export function cvOverview(cv: CvPayload) {
	return {
		person: cv.person,
		sections: Object.fromEntries(
			CV_SECTIONS.map((name) => [name, cvEntryCount(cv.sections[name])])
		) as Record<CvSection, number>
	};
}

/** One CV section's entries. */
export function cvSection(cv: CvPayload, section: CvSection) {
	return { section, entries: cv.sections[section] ?? [] };
}
