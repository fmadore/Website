import { McpServer } from '@modelcontextprotocol/server';
import * as z from 'zod/v4';
import { findItem, loadApiDocument, loadCv, loadDataset } from './datasets.js';
import { search } from './search.js';
import { detail, summariseAll, summariseStructured } from './format.js';
import { citationFor } from './citations.js';

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

const READ_ONLY = {
	readOnlyHint: true,
	destructiveHint: false,
	idempotentHint: true,
	openWorldHint: true
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
	next_offset: z.number().int().nonnegative().optional()
});

const recordSchema = z.record(z.string(), z.unknown());
const recordListSchema = z.array(recordSchema);

interface ToolSuccess<T> {
	data: T;
	text?: string;
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
				content: [{ type: 'text' as const, text: result.text ?? detail(result.data) }],
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

const limit = z.number().int().min(1).max(100).default(25).describe('Maximum results to return.');
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
			version: '0.2.0',
			description:
				"Read-only access to Frédérick Madore's publications, talks, research projects, digital humanities work, activities, and CV."
		},
		{
			instructions:
				"Use this server for questions about Frédérick Madore's own scholarship and career. Use the separate IWAC server for documents in the Islam West Africa Collection. Search before calling a get tool when you do not already have an id.",
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
				"Search Frédérick Madore's own publications — books, journal articles, chapters, edited volumes, reports, encyclopedia entries, theses, working papers. Searches titles, abstracts, authors, tags and venues. All arguments are optional; omit everything to list the most recent.",
			inputSchema: z
				.object({
					query: z
						.string()
						.max(500)
						.optional()
						.describe('Free text; every word must appear somewhere.'),
					type: z
						.string()
						.optional()
						.describe("e.g. 'book', 'article', 'chapter', 'special-issue', 'report'."),
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
		tool(async (args) => {
			const items = await loadDataset('publications');
			const { hits, total } = search(items, {
				query: args.query,
				fields: ['title', 'abstract', 'authors', 'tags', 'journal', 'book', 'publisher', 'editors'],
				weighted: ['title'],
				filters: {
					type: args.type,
					tags: args.tag,
					country: args.country,
					project: args.project,
					language: args.language
				},
				yearFrom: args.year_from,
				yearTo: args.year_to,
				limit: args.limit,
				offset: args.offset
			});
			return success(
				summariseStructured(hits, total, args.offset),
				summariseAll(hits, total, args.offset)
			);
		})
	);

	server.registerTool(
		'get_publication',
		{
			title: 'Get a publication',
			description:
				'Full record for one publication, including abstract, identifiers (DOI/ISBN/ISSN), table of contents, works that cite it, and published reviews of it.',
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
				'Search conference papers, invited lectures, seminars, workshops, panels and podcast appearances. Searches titles, abstracts, conference names and locations.',
			inputSchema: z
				.object({
					query: z.string().max(500).optional(),
					type: z
						.string()
						.optional()
						.describe(
							"'conference', 'workshop', 'seminar', 'lecture', 'panel', 'event', 'podcast'."
						),
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
		tool(async (args) => {
			const items = await loadDataset('communications');
			const { hits, total } = search(items, {
				query: args.query,
				fields: ['title', 'abstract', 'authors', 'conference', 'panelTitle', 'location', 'tags'],
				weighted: ['title'],
				filters: {
					type: args.type,
					country: args.country,
					project: args.project,
					tags: args.tag
				},
				yearFrom: args.year_from,
				yearTo: args.year_to,
				limit: args.limit,
				offset: args.offset
			});
			return success(
				summariseStructured(hits, total, args.offset),
				summariseAll(hits, total, args.offset)
			);
		})
	);

	server.registerTool(
		'get_communication',
		{
			title: 'Get a talk or event',
			description:
				'Full record for one talk or event, including the abstract, venue, coordinates, and — for panels — the papers presented and their participants.',
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
		tool(async (args) => {
			const items = await loadDataset('activities');
			const { hits, total } = search(items, {
				query: args.query,
				fields: ['title', 'description', 'content', 'tags'],
				weighted: ['title'],
				filters: { type: args.type, tags: args.tag },
				yearFrom: args.year_from,
				yearTo: args.year_to,
				limit: args.limit,
				offset: args.offset
			});
			return success(
				summariseStructured(hits, total, args.offset),
				summariseAll(hits, total, args.offset)
			);
		})
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
			outputSchema: recordListSchema,
			annotations: READ_ONLY
		},
		tool(async () => {
			const projects = await loadDataset('research');
			// Five projects with their full narratives is ~14 KB of prose that a
			// caller orienting itself has not asked for. The summaries answer "which
			// project?"; get_research_project answers "what is it about?".
			return success(
				projects.map(({ body, ...summary }) => ({
					...summary,
					bodyChars: String(body ?? '').length
				}))
			);
		})
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
			title: 'List digital humanities projects',
			description:
				'Digital archives, datasets and tools built by Madore — including the Islam West Africa Collection (IWAC) — with skills, awards and published reviews.',
			inputSchema: z.object({}).strict(),
			outputSchema: recordListSchema,
			annotations: READ_ONLY
		},
		tool(async () => success(await loadDataset('digital-humanities')))
	);

	server.registerTool(
		'get_dh_project',
		{
			title: 'Get a digital humanities project',
			description: 'Full record for one digital humanities project.',
			inputSchema: z.object({ id: z.string().min(1).max(300) }).strict(),
			outputSchema: recordSchema,
			annotations: READ_ONLY
		},
		tool(async ({ id }) => success(await findItem('digital-humanities', id)))
	);

	// -------------------------------------------------------------------------- cv

	const CV_SECTIONS = [
		'appointments',
		'education',
		'researchRoles',
		'grants',
		'awards',
		'teaching',
		'editorialMemberships',
		'peerReviews',
		'affiliations',
		'fieldworks',
		'mediaAppearances',
		'languages'
	] as const;

	server.registerTool(
		'get_cv',
		{
			title: 'Get the CV',
			description: `Career record. Omit \`section\` for everything (person details plus all sections), or name one of: ${CV_SECTIONS.join(', ')}. Grants live under 'grants', with funder, amount, currency, status and co-applicants.`,
			inputSchema: z
				.object({
					section: z.enum(CV_SECTIONS).optional().describe('Restrict output to one section.')
				})
				.strict(),
			outputSchema: recordSchema,
			annotations: READ_ONLY
		},
		tool(async ({ section }) => {
			const cv = await loadCv();
			const result: Record<string, unknown> = section
				? { section, entries: cv.sections[section] ?? [] }
				: cv;
			return success(result);
		})
	);

	// -------------------------------------------------------------------- citation

	server.registerTool(
		'get_citation',
		{
			title: 'Cite a publication',
			description:
				"Format a publication for citation. 'bibtex' returns the same entry the site's download button produces; 'reference' returns a plain-text reference. (The site has no APA/MLA/Chicago generator yet, so those are not offered rather than being improvised here.)",
			inputSchema: z
				.object({
					id: z.string().min(1).max(300).describe('Publication id.'),
					style: z.enum(['bibtex', 'reference']).default('bibtex')
				})
				.strict(),
			outputSchema: z.string(),
			annotations: READ_ONLY
		},
		tool(async ({ id, style }) => {
			const citation = citationFor(await findItem('publications', id), style);
			return success(citation, citation);
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
			'Digital humanities projects',
			'Archives, datasets, tools, embeds, awards, and reviews.'
		],
		['cv', 'Curriculum vitae', 'Career record grouped by section.']
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

	return server;
}
