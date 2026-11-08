import { McpServer, ResourceTemplate } from '@modelcontextprotocol/server';
import * as z from 'zod/v4';
import { findItem, loadApiDocument, loadCv, loadDataset, type Item } from './datasets.js';
import {
	SEARCH_DEFAULT_LIMIT,
	SEARCH_FIELDS,
	SEARCH_MAX_LIMIT,
	WEIGHTED_FIELDS,
	search,
	summariseStructured,
	type SearchOptions
} from '#lib/utils/apiSearch.ts';
import { CITATION_STYLES, citationFor } from '#lib/utils/apiCitation.ts';
import { CV_SECTIONS, DH_PROJECT_GROUPS, type DatasetName } from '#lib/apiContract.ts';
import {
	COMMUNICATION_TYPES,
	PUBLICATION_TYPES,
	cvOverview,
	cvSection,
	dhProjectList,
	researchProjectList
} from '#lib/utils/apiViews.ts';
import { detail, summariseAll } from './format.js';

/**
 * MCP server over the academic record published at frederickmadore.com.
 *
 * Scope note for anyone wiring this up alongside the IWAC server: this one
 * answers questions about *Madore's own scholarship* — what he wrote, presented,
 * was funded for. IWAC answers questions about the West African source archive
 * he studies. Different corpora; the tool descriptions say so explicitly, so an
 * agent holding both connections picks the right one.
 */
const CACHE_TTL_MS = 3_600_000;

/**
 * Every tool reads one closed, curated corpus, so `openWorldHint` is false:
 * the hint marks tools whose reach is open-ended (web search, arbitrary URLs),
 * and these only ever read the site's own published documents.
 */
const READ_ONLY = {
	readOnlyHint: true,
	destructiveHint: false,
	idempotentHint: true,
	openWorldHint: false
} as const;

const summarySchema = z.object({
	id: z.string(),
	title: z.string(),
	type: z.string().optional(),
	year: z.number().optional(),
	venue: z.string().optional(),
	url: z.string().optional()
});

const searchOutputSchema = z.object({
	total: z.number().int().nonnegative(),
	count: z.number().int().nonnegative(),
	offset: z.number().int().nonnegative(),
	items: z.array(summarySchema),
	has_more: z.boolean(),
	next_offset: z.number().int().nonnegative().optional(),
	hint: z.string().optional()
});

const recordSchema = z.record(z.string(), z.unknown());
const listSchema = z.object({
	count: z.number().int().nonnegative(),
	items: z.array(recordSchema)
});

/** A `resource_link` content block: a pointer the client can read with `resources/read`. */
interface ResourceLink {
	type: 'resource_link';
	uri: string;
	name: string;
	title?: string;
	mimeType: 'application/json';
}

interface ToolSuccess<T> {
	data: T;
	text?: string;
	links?: ResourceLink[];
}

/**
 * Wrap a handler so a failure is reported as tool output rather than throwing.
 * A dead site or an unknown id should tell the caller what went wrong, not
 * surface as a transport-level fault it cannot act on.
 */
function tool<A, T>(handler: (args: A) => Promise<ToolSuccess<T>>) {
	return async (args: A) => {
		try {
			const result = await handler(args);
			return {
				content: [
					{ type: 'text' as const, text: result.text ?? detail(result.data) },
					...(result.links ?? [])
				],
				structuredContent: result.data
			};
		} catch (error) {
			return {
				content: [{ type: 'text' as const, text: `Error: ${(error as Error).message}` }],
				isError: true
			};
		}
	};
}

const success = <T>(data: T, text?: string): ToolSuccess<T> => ({ data, text });

/** The per-record resource of a dataset: `website://publications/{id}`. */
const recordUri = (dataset: DatasetName, id: string) =>
	`website://${dataset}/${encodeURIComponent(id)}`;

/**
 * Run a search and shape the page: the structured rows, a readable summary
 * carrying every field of those rows (so a client that ignores
 * `structuredContent` loses nothing), and a `resource_link` per hit that
 * resolves to the full record.
 */
async function searchPage(
	dataset: keyof typeof SEARCH_FIELDS,
	options: Omit<SearchOptions, 'fields' | 'weighted'> & { offset: number }
): Promise<ToolSuccess<ReturnType<typeof summariseStructured>>> {
	const { hits, total } = search(await loadDataset(dataset), {
		...options,
		fields: SEARCH_FIELDS[dataset],
		weighted: WEIGHTED_FIELDS
	});
	return {
		data: summariseStructured(hits, total, options.offset),
		text: summariseAll(hits, total, options.offset),
		links: hits.map((item: Item) => ({
			type: 'resource_link',
			uri: recordUri(dataset, item.id),
			name: item.id,
			...(item.title ? { title: item.title } : {}),
			mimeType: 'application/json'
		}))
	};
}

const limit = z
	.number()
	.int()
	.min(1)
	.max(SEARCH_MAX_LIMIT)
	.default(SEARCH_DEFAULT_LIMIT)
	.describe(`Rows per page (default ${SEARCH_DEFAULT_LIMIT}, at most ${SEARCH_MAX_LIMIT}).`);
const offset = z
	.number()
	.int()
	.nonnegative()
	.default(0)
	.describe('Number of matching records to skip for pagination.');

const yearFrom = z
	.number()
	.int()
	.min(1900)
	.max(2200)
	.optional()
	.describe('Earliest year, inclusive.');
const yearTo = z.number().int().min(1900).max(2200).optional().describe('Latest year, inclusive.');

export function createWebsiteServer(): McpServer {
	const server = new McpServer(
		{
			name: 'frederickmadore-website',
			version: '0.4.0',
			description:
				"Read-only access to Frédérick Madore's publications, talks, research projects, digital humanities work, activities, and CV."
		},
		{
			instructions:
				"Use this server for questions about Frédérick Madore's own scholarship and career. Use the separate IWAC server for documents in the Islam West Africa Collection. Search before calling a get tool when you do not already have an id. Search results link each hit as a resource (website://<dataset>/<id>) that reads the full record.",
			cacheHints: {
				'server/discover': { ttlMs: CACHE_TTL_MS, cacheScope: 'public' },
				'tools/list': { ttlMs: CACHE_TTL_MS, cacheScope: 'public' },
				'resources/list': { ttlMs: CACHE_TTL_MS, cacheScope: 'public' },
				'resources/read': { ttlMs: CACHE_TTL_MS, cacheScope: 'public' }
			}
		}
	);

	// ---------------------------------------------------------------- publications

	server.registerTool(
		'search_publications',
		{
			title: 'Search publications',
			description:
				"Search Frédérick Madore's own publications — books, journal articles, chapters, edited volumes, special issues, reports, encyclopedia entries, theses, working papers. Searches titles, abstracts, authors, tags and venues. All arguments are optional; omit everything to list the most recent. Returns one compact row per match (id, title, type, year, venue, url); pass an id to get_publication for the full record, or to get_citation to cite it.",
			inputSchema: z
				.object({
					query: z
						.string()
						.max(500)
						.optional()
						.describe('Free text; every word must appear somewhere.'),
					type: z.enum(PUBLICATION_TYPES).optional().describe('Publication type.'),
					tag: z.string().optional(),
					country: z.string().optional().describe("Country covered, e.g. 'Benin'."),
					project: z.string().optional().describe('Research project name.'),
					language: z.string().optional().describe("e.g. 'English', 'French'."),
					year_from: yearFrom,
					year_to: yearTo,
					limit,
					offset
				})
				.strict(),
			outputSchema: searchOutputSchema,
			annotations: READ_ONLY
		},
		tool((args) =>
			searchPage('publications', {
				query: args.query,
				filters: { tags: args.tag, project: args.project, language: args.language },
				exact: { type: args.type, country: args.country },
				yearFrom: args.year_from,
				yearTo: args.year_to,
				limit: args.limit,
				offset: args.offset
			})
		)
	);

	server.registerTool(
		'get_publication',
		{
			title: 'Get a publication',
			description:
				'Full record for one publication: abstract, authors and editors, venue and imprint, identifiers (DOI, ISBN, ISSN, Wikidata, OpenAlex), whether it is open access, table of contents, published reviews, and the works that cite it — each with, where the citing work was read, the passages that quote it.',
			inputSchema: z
				.object({
					id: z
						.string()
						.min(1)
						.max(300)
						.describe('Publication id, as returned by search_publications.')
				})
				.strict(),
			outputSchema: recordSchema,
			annotations: READ_ONLY
		},
		tool(async ({ id }) => success(await findItem('publications', id)))
	);

	// -------------------------------------------------------------- communications

	server.registerTool(
		'search_communications',
		{
			title: 'Search talks and events',
			description:
				'Search conference papers, invited lectures, seminars, workshops, panels, posters and podcast appearances. Searches titles, abstracts, authors, conference names, panels and locations. Returns one compact row per match; pass an id to get_communication for the full record.',
			inputSchema: z
				.object({
					query: z.string().max(500).optional(),
					type: z.enum(COMMUNICATION_TYPES).optional().describe('Kind of talk or event.'),
					country: z.string().optional().describe('Country the event took place in.'),
					project: z.string().optional(),
					tag: z.string().optional(),
					year_from: yearFrom,
					year_to: yearTo,
					limit,
					offset
				})
				.strict(),
			outputSchema: searchOutputSchema,
			annotations: READ_ONLY
		},
		tool((args) =>
			searchPage('communications', {
				query: args.query,
				filters: { project: args.project, tags: args.tag },
				exact: { type: args.type, country: args.country },
				yearFrom: args.year_from,
				yearTo: args.year_to,
				limit: args.limit,
				offset: args.offset
			})
		)
	);

	server.registerTool(
		'get_communication',
		{
			title: 'Get a talk or event',
			description:
				'Full record for one talk or event: abstract, date, venue, location and coordinates, language, project, slides and poster links; for a panel, the papers presented and their participants; for a talk given as teaching, the host institution, course and level.',
			inputSchema: z.object({ id: z.string().min(1).max(300) }).strict(),
			outputSchema: recordSchema,
			annotations: READ_ONLY
		},
		tool(async ({ id }) => success(await findItem('communications', id)))
	);

	// ------------------------------------------------------------------ activities

	server.registerTool(
		'search_activities',
		{
			title: 'Search activities and news',
			description:
				'Search news and scholarly activity entries. Unlike the other datasets these carry their full body text, so this is the tool for "what has he been doing lately".',
			inputSchema: z
				.object({
					query: z.string().max(500).optional(),
					type: z.string().optional().describe("Activity type, e.g. 'workshop' or 'publication'."),
					tag: z.string().optional(),
					year_from: yearFrom,
					year_to: yearTo,
					limit,
					offset
				})
				.strict(),
			outputSchema: searchOutputSchema,
			annotations: READ_ONLY
		},
		tool((args) =>
			searchPage('activities', {
				query: args.query,
				filters: { tags: args.tag },
				exact: { type: args.type },
				yearFrom: args.year_from,
				yearTo: args.year_to,
				limit: args.limit,
				offset: args.offset
			})
		)
	);

	server.registerTool(
		'get_activity',
		{
			title: 'Get an activity or news entry',
			description:
				'Full record for one activity, including its complete body text. Search only returns headlines, so this is how the writing itself is read.',
			inputSchema: z
				.object({
					id: z.string().min(1).max(300).describe('Activity id, as returned by search_activities.')
				})
				.strict(),
			outputSchema: recordSchema,
			annotations: READ_ONLY
		},
		tool(async ({ id }) => success(await findItem('activities', id)))
	);

	// -------------------------------------------------------------------- research

	server.registerTool(
		'list_research_projects',
		{
			title: 'List research projects',
			description:
				'All research projects, current and concluded, with their summaries and the ids of the publications, talks, grants and fieldwork belonging to each — the fastest way to see the shape of a body of work before drilling in. Full narratives are omitted here; use get_research_project for those.',
			inputSchema: z.object({}).strict(),
			outputSchema: listSchema,
			annotations: READ_ONLY
		},
		tool(async () => success(researchProjectList(await loadDataset('research'))))
	);

	server.registerTool(
		'get_research_project',
		{
			title: 'Get a research project',
			description:
				"One research project in full: its complete narrative, span, regions, source languages, funding, and the cross-referenced ids of everything that belongs to it. This is where a project's substantive description lives.",
			inputSchema: z.object({ id: z.string().min(1).max(300) }).strict(),
			outputSchema: recordSchema,
			annotations: READ_ONLY
		},
		tool(async ({ id }) => success(await findItem('research', id)))
	);

	// ---------------------------------------------------------- digital humanities

	server.registerTool(
		'list_dh_projects',
		{
			title: 'List digital humanities projects and software',
			description:
				"Digital archives, datasets, tools and standalone applications built by Madore, including the Islam West Africa Collection (IWAC) and open-source desktop applications for researchers, with skills, awards, the article describing each and its published reviews. Each record's `group` is 'project' (a digital humanities project) or 'software' (an application, which also carries `application`: status, operating system, architectures, licence); pass `group` to list one of them. Descriptions and embeds are omitted here; use get_dh_project for those.",
			inputSchema: z
				.object({
					group: z
						.enum(DH_PROJECT_GROUPS)
						.optional()
						.describe("'project' or 'software'. Omit it for both.")
				})
				.strict(),
			outputSchema: listSchema,
			annotations: READ_ONLY
		},
		tool(async ({ group }) =>
			success(dhProjectList(await loadDataset('digital-humanities'), group))
		)
	);

	server.registerTool(
		'get_dh_project',
		{
			title: 'Get a digital humanities project or application',
			description:
				'Full record for one digital humanities project or software application, including its description, links and, for an application, its status and platform.',
			inputSchema: z.object({ id: z.string().min(1).max(300) }).strict(),
			outputSchema: recordSchema,
			annotations: READ_ONLY
		},
		tool(async ({ id }) => success(await findItem('digital-humanities', id)))
	);

	// -------------------------------------------------------------------------- cv

	server.registerTool(
		'get_cv',
		{
			title: 'Get the CV',
			description: `Career record. Without a section: the person (name, position, affiliation, contact email, research topics, scholarly profiles) and the number of entries in each section. Name a section to read its entries: ${CV_SECTIONS.join(', ')}. 'teaching' holds the courses taught and the guest lectures; 'grants' carry funder, amount, currency, status and co-applicants; 'consulting' is expert testimony and country-of-origin reports. Projects and software are in list_dh_projects; the whole CV at once is the website://api/cv resource.`,
			inputSchema: z
				.object({
					section: z
						.enum(CV_SECTIONS)
						.optional()
						.describe('The section to read. Omit it for the person and the section sizes.')
				})
				.strict(),
			outputSchema: recordSchema,
			annotations: READ_ONLY
		},
		tool(async ({ section }) => {
			const cv = await loadCv();
			const result: Record<string, unknown> = section ? cvSection(cv, section) : cvOverview(cv);
			return success(result);
		})
	);

	// -------------------------------------------------------------------- citation

	server.registerTool(
		'get_citation',
		{
			title: 'Cite a publication',
			description:
				"Cite one publication. 'bibtex' returns the BibTeX entry the site's download button produces; 'reference' returns the plain-text reference its Copy reference button copies. (The site has no APA/MLA/Chicago generator yet, so those are not offered rather than being improvised here.)",
			inputSchema: z
				.object({
					id: z.string().min(1).max(300).describe('Publication id.'),
					style: z.enum(CITATION_STYLES).default('bibtex')
				})
				.strict(),
			outputSchema: z.object({
				id: z.string(),
				style: z.enum(CITATION_STYLES),
				citation: z.string()
			}),
			annotations: READ_ONLY
		},
		tool(async ({ id, style }) => {
			const record = await findItem('publications', id);
			const citation = citationFor(record, style);
			return success({ id: record.id, style, citation }, citation);
		})
	);

	// -----------------------------------------------------------------------------

	const resources = [
		[
			'index',
			'API discovery manifest',
			'Datasets, counts, date spans, and related machine-readable views.'
		],
		['research', 'Research projects', 'Research project narratives and cross-references.'],
		['publications', 'Publications', 'Complete publication records and scholarly apparatus.'],
		['communications', 'Communications', 'Talks, events, panels, and podcasts.'],
		['activities', 'Activities', 'News and scholarly activity entries with full bodies.'],
		[
			'digital-humanities',
			'Digital humanities projects and software',
			'Archives, datasets, tools and applications, with embeds, awards and reviews; each record names its group.'
		],
		['cv', 'Curriculum vitae', 'Career record grouped by section, computer skills included.']
	] as const;

	for (const [name, title, description] of resources) {
		const uri = `website://api/${name}`;
		server.registerResource(
			`website-${name}`,
			uri,
			{
				title,
				description,
				mimeType: 'application/json',
				cacheHint: { ttlMs: CACHE_TTL_MS, cacheScope: 'public' }
			},
			async (resourceUri) => ({
				contents: [
					{
						uri: resourceUri.href,
						mimeType: 'application/json',
						text: detail(await loadApiDocument(name))
					}
				]
			})
		);
	}

	// One record at a time, at the address a search result links to. No `list`
	// callback: ~300 records would swamp resources/list, and the search tools
	// (or the whole-dataset resources above) are how a caller finds ids. The ids
	// complete, so a client offering resource pickers can still browse them.
	const recordTemplates = [
		['publications', 'Publication', 'One publication record, as get_publication returns it.'],
		['communications', 'Talk or event', 'One talk or event, as get_communication returns it.'],
		['activities', 'Activity', 'One activity or news entry, with its full body.'],
		['research', 'Research project', 'One research project, with its full narrative.'],
		[
			'digital-humanities',
			'Digital humanities project or application',
			'One digital humanities project or application, with its description and embeds.'
		]
	] as const satisfies ReadonlyArray<readonly [DatasetName, string, string]>;

	for (const [dataset, title, description] of recordTemplates) {
		server.registerResource(
			`website-${dataset}-record`,
			new ResourceTemplate(`website://${dataset}/{id}`, {
				list: undefined,
				complete: {
					id: async (value) =>
						(await loadDataset(dataset))
							.map((item) => item.id)
							.filter((id) => id.startsWith(value))
							.slice(0, 100)
				}
			}),
			{
				title,
				description,
				mimeType: 'application/json',
				cacheHint: { ttlMs: CACHE_TTL_MS, cacheScope: 'public' }
			},
			async (resourceUri, variables) => {
				const raw = Array.isArray(variables.id) ? variables.id[0] : variables.id;
				const record = await findItem(dataset, decodeURIComponent(String(raw ?? '')));
				return {
					contents: [{ uri: resourceUri.href, mimeType: 'application/json', text: detail(record) }]
				};
			}
		);
	}

	return server;
}
