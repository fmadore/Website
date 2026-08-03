import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import { findItem, loadCv, loadDataset } from './datasets.js';
import { search } from './search.js';
import { detail, summariseAll } from './format.js';
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
const server = new McpServer({
	name: 'frederickmadore-website',
	version: '0.1.0'
});

/**
 * Wrap a handler so a failure is reported as tool output rather than throwing.
 * A dead site or an unknown id should tell the caller what went wrong, not
 * surface as a transport-level fault it cannot act on.
 */
function tool<A>(handler: (args: A) => Promise<string>) {
	return async (args: A) => {
		try {
			return { content: [{ type: 'text' as const, text: await handler(args) }] };
		} catch (error) {
			return {
				content: [{ type: 'text' as const, text: `Error: ${(error as Error).message}` }],
				isError: true
			};
		}
	};
}

const limit = z.number().int().min(1).max(100).default(25).describe('Maximum results to return.');

const yearFrom = z.number().int().optional().describe('Earliest year, inclusive.');
const yearTo = z.number().int().optional().describe('Latest year, inclusive.');

// ---------------------------------------------------------------- publications

server.registerTool(
	'search_publications',
	{
		title: 'Search publications',
		description:
			"Search Frédérick Madore's own publications — books, journal articles, chapters, edited volumes, reports, encyclopedia entries, theses, working papers. Searches titles, abstracts, authors, tags and venues. All arguments are optional; omit everything to list the most recent.",
		inputSchema: {
			query: z.string().optional().describe('Free text; every word must appear somewhere.'),
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
			limit
		}
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
			limit: args.limit
		});
		return summariseAll(hits, total);
	})
);

server.registerTool(
	'get_publication',
	{
		title: 'Get a publication',
		description:
			'Full record for one publication, including abstract, identifiers (DOI/ISBN/ISSN), table of contents, works that cite it, and published reviews of it.',
		inputSchema: { id: z.string().describe('Publication id, as returned by search_publications.') }
	},
	tool(async ({ id }) => detail(await findItem('publications', id)))
);

// -------------------------------------------------------------- communications

server.registerTool(
	'search_communications',
	{
		title: 'Search talks and events',
		description:
			'Search conference papers, invited lectures, seminars, workshops, panels and podcast appearances. Searches titles, abstracts, conference names and locations.',
		inputSchema: {
			query: z.string().optional(),
			type: z
				.string()
				.optional()
				.describe("'conference', 'workshop', 'seminar', 'lecture', 'panel', 'event', 'podcast'."),
			country: z.string().optional().describe('Country the event took place in.'),
			project: z.string().optional(),
			tag: z.string().optional(),
			year_from: yearFrom,
			year_to: yearTo,
			limit
		}
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
			limit: args.limit
		});
		return summariseAll(hits, total);
	})
);

server.registerTool(
	'get_communication',
	{
		title: 'Get a talk or event',
		description:
			'Full record for one talk or event, including the abstract, venue, coordinates, and — for panels — the papers presented and their participants.',
		inputSchema: { id: z.string() }
	},
	tool(async ({ id }) => detail(await findItem('communications', id)))
);

// ------------------------------------------------------------------ activities

server.registerTool(
	'search_activities',
	{
		title: 'Search activities and news',
		description:
			'Search news and scholarly activity entries. Unlike the other datasets these carry their full body text, so this is the tool for "what has he been doing lately".',
		inputSchema: {
			query: z.string().optional(),
			tag: z.string().optional(),
			year_from: yearFrom,
			year_to: yearTo,
			limit
		}
	},
	tool(async (args) => {
		const items = await loadDataset('activities');
		const { hits, total } = search(items, {
			query: args.query,
			fields: ['title', 'description', 'content', 'tags'],
			weighted: ['title'],
			filters: { tags: args.tag },
			yearFrom: args.year_from,
			yearTo: args.year_to,
			limit: args.limit
		});
		return summariseAll(hits, total);
	})
);

server.registerTool(
	'get_activity',
	{
		title: 'Get an activity or news entry',
		description:
			'Full record for one activity, including its complete body text. Search only returns headlines, so this is how the writing itself is read.',
		inputSchema: { id: z.string().describe('Activity id, as returned by search_activities.') }
	},
	tool(async ({ id }) => detail(await findItem('activities', id)))
);

// -------------------------------------------------------------------- research

server.registerTool(
	'list_research_projects',
	{
		title: 'List research projects',
		description:
			'All research projects, current and concluded, with their summaries and the ids of the publications, talks, grants and fieldwork belonging to each — the fastest way to see the shape of a body of work before drilling in. Full narratives are omitted here; use get_research_project for those.',
		inputSchema: {}
	},
	tool(async () => {
		const projects = await loadDataset('research');
		// Five projects with their full narratives is ~14 KB of prose that a
		// caller orienting itself has not asked for. The summaries answer "which
		// project?"; get_research_project answers "what is it about?".
		return detail(
			projects.map(({ body, ...summary }) => ({ ...summary, bodyChars: String(body ?? '').length }))
		);
	})
);

server.registerTool(
	'get_research_project',
	{
		title: 'Get a research project',
		description:
			"One research project in full: its complete narrative, span, regions, source languages, funding, and the cross-referenced ids of everything that belongs to it. This is where a project's substantive description lives.",
		inputSchema: { id: z.string() }
	},
	tool(async ({ id }) => detail(await findItem('research', id)))
);

// ---------------------------------------------------------- digital humanities

server.registerTool(
	'list_dh_projects',
	{
		title: 'List digital humanities projects',
		description:
			'Digital archives, datasets and tools built by Madore — including the Islam West Africa Collection (IWAC) — with skills, awards and published reviews.',
		inputSchema: {}
	},
	tool(async () => detail(await loadDataset('digital-humanities')))
);

server.registerTool(
	'get_dh_project',
	{
		title: 'Get a digital humanities project',
		description: 'Full record for one digital humanities project.',
		inputSchema: { id: z.string() }
	},
	tool(async ({ id }) => detail(await findItem('digital-humanities', id)))
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
		inputSchema: {
			section: z.enum(CV_SECTIONS).optional().describe('Restrict output to one section.')
		}
	},
	tool(async ({ section }) => {
		const cv = await loadCv();
		if (!section) return detail(cv);
		return detail({ section, entries: cv.sections[section] ?? [] });
	})
);

// -------------------------------------------------------------------- citation

server.registerTool(
	'get_citation',
	{
		title: 'Cite a publication',
		description:
			"Format a publication for citation. 'bibtex' returns the same entry the site's download button produces; 'reference' returns a plain-text reference. (The site has no APA/MLA/Chicago generator yet, so those are not offered rather than being improvised here.)",
		inputSchema: {
			id: z.string().describe('Publication id.'),
			style: z.enum(['bibtex', 'reference']).default('bibtex')
		}
	},
	tool(async ({ id, style }) => citationFor(await findItem('publications', id), style))
);

// -----------------------------------------------------------------------------

await server.connect(new StdioServerTransport());
