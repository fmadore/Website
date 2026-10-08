/**
 * WebMCP integration.
 *
 * Registers the site's tools with the browser's WebMCP runtime
 * (`document.modelContext`), so an AI agent browsing the site can search and
 * read the academic record, and cite it, instead of scraping the DOM. The tools
 * are the MCP server's (`mcp/src/server.ts`): the same names, the same arguments,
 * and the same records, because both read the same static API documents
 * (`/api/*.json`, fetched here same-origin) through the same search, lookup and
 * citation code in `$lib/utils/api*`. One tool more drives the visible page:
 * `show_publications` opens the publications index on a filtered view.
 *
 * Progressive enhancement: the root layout imports this module only when the
 * runtime exists, and the datasets are fetched only when an agent calls a tool,
 * so neither reaches a reader's critical path. Chrome exposes the runtime to
 * pages carrying the WebMCP origin-trial token (`src/app.html`), or behind
 * `--enable-experimental-web-platform-features`.
 *
 * Two runtime rules shape the code below (spec, Draft CG Report, October 2026):
 *  - `execute` resolves to any JSON-serialisable value and the browser
 *    serialises it, so results are plain objects, never pre-stringified text.
 *  - A rejected `execute` reaches the agent only as a bare "UnknownError", so a
 *    failure is *returned* as `{ error }`, phrased to say how to recover.
 *
 * Spec: https://webmachinelearning.github.io/webmcp/
 */

import { CV_SECTIONS, type ApiItem, type CvPayload, type DatasetName } from '$lib/apiContract';
import { author, website } from '$lib/data/siteConfig';
import { CITATION_STYLES, citationFor } from '$lib/utils/apiCitation';
import { createDocumentLoader } from '$lib/utils/apiDocumentLoader';
import {
	SEARCH_FIELDS,
	WEIGHTED_FIELDS,
	findRecord,
	normalise,
	search,
	summariseStructured
} from '$lib/utils/apiSearch';
import { serializeFiltersToQuery, type UrlSyncableFilters } from '$lib/utils/filterSerialization';
import { PUBLICATION_TYPE_BADGE_LABELS } from '$lib/utils/publicationTypeLabels';
import { COMMUNICATION_TYPE_BADGE_LABELS } from '$lib/utils/typeUtils';
import type { WebMcpToolName } from '$lib/utils/webmcpToolNames';

// ---------------------------------------------------------------------------
// Typings for the parts of the (still experimental) WebMCP API used here.
// ---------------------------------------------------------------------------

/** `ToolAnnotations`; every member defaults to false. */
interface ToolAnnotations {
	readOnlyHint?: boolean;
	untrustedContentHint?: boolean;
	consequentialHint?: boolean;
}

type JsonSchema = Record<string, unknown>;

interface InputSchema {
	type: 'object';
	properties: Record<string, JsonSchema>;
	required?: string[];
	additionalProperties: false;
}

/** `ModelContextTool`. */
export interface WebMcpTool {
	name: WebMcpToolName;
	title: string;
	description: string;
	inputSchema: InputSchema;
	annotations: ToolAnnotations;
	execute: (input: unknown) => Promise<unknown>;
}

interface ModelContext {
	registerTool?: (tool: WebMcpTool, options: { signal: AbortSignal }) => Promise<void> | void;
}

export interface WebMcpOptions {
	/** Client-side navigation (the layout passes Kit's `goto`); enables `show_publications`. */
	navigate?: (path: string) => Promise<unknown>;
	/** Defaults to the global `fetch`, resolved at call time. */
	fetch?: typeof globalThis.fetch;
}

// ---------------------------------------------------------------------------
// Input handling. The schema tells the agent what to send; the code checks it
// again, because a schema is advice to the caller, not a guarantee.
// ---------------------------------------------------------------------------

type Args = Record<string, unknown>;

/** A caller mistake, reported back to the agent with the way to fix it. */
class InputError extends Error {}

function readInput(input: unknown): Args {
	// Chrome passed the arguments as a JSON string before 155.
	if (typeof input === 'string') {
		try {
			input = input.trim() ? JSON.parse(input) : {};
		} catch {
			throw new InputError('Send the arguments as a JSON object.');
		}
	}
	if (input === undefined || input === null) return {};
	if (typeof input !== 'object' || Array.isArray(input))
		throw new InputError('Send the arguments as a JSON object.');
	return input as Args;
}

function text(args: Args, key: string): string | undefined {
	const value = args[key];
	if (value === undefined || value === null) return undefined;
	if (typeof value !== 'string') throw new InputError(`"${key}" takes a string.`);
	return value.trim() || undefined;
}

function requiredId(args: Args, source: string): string {
	const id = text(args, 'id');
	if (!id) throw new InputError(`"id" is required: pass an id returned by ${source}.`);
	return id;
}

function choice<T extends string>(args: Args, key: string, values: readonly T[]): T | undefined {
	const value = text(args, key);
	if (value === undefined) return undefined;
	if (!values.includes(value as T))
		throw new InputError(`"${key}" takes one of: ${values.join(', ')}.`);
	return value as T;
}

function integer(args: Args, key: string, min: number, max: number): number | undefined {
	const raw = args[key];
	if (raw === undefined || raw === null || raw === '') return undefined;
	const value = typeof raw === 'string' ? Number(raw) : raw;
	if (typeof value !== 'number' || !Number.isInteger(value) || value < min || value > max)
		throw new InputError(`"${key}" takes a whole number from ${min} to ${max}.`);
	return value;
}

const YEAR_MIN = 1900;
const YEAR_MAX = 2200;

function yearRange(args: Args): { yearFrom?: number; yearTo?: number } {
	const yearFrom = integer(args, 'year_from', YEAR_MIN, YEAR_MAX);
	const yearTo = integer(args, 'year_to', YEAR_MIN, YEAR_MAX);
	if (yearFrom !== undefined && yearTo !== undefined && yearFrom > yearTo)
		throw new InputError('"year_from" must be on or before "year_to".');
	return { yearFrom, yearTo };
}

const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 50;

/** Page size is forgiving: an out-of-range limit is clamped rather than refused. */
function page(args: Args): { limit: number; offset: number } {
	const limit = Math.min(Math.max(Math.trunc(Number(args.limit)) || DEFAULT_LIMIT, 1), MAX_LIMIT);
	const offset = Math.max(Math.trunc(Number(args.offset)) || 0, 0);
	return { limit, offset };
}

// ---------------------------------------------------------------------------
// Shared schema fragments. Parameter descriptions stay under Chrome's
// 150-character guidance; tool descriptions under 500.
// ---------------------------------------------------------------------------

const PUBLICATION_TYPES = Object.keys(PUBLICATION_TYPE_BADGE_LABELS);
const COMMUNICATION_TYPES = Object.keys(COMMUNICATION_TYPE_BADGE_LABELS);

const QUERY = {
	type: 'string',
	maxLength: 500,
	description: 'Free text. Every word must appear; accents and case are ignored.'
};
const YEAR_FROM = {
	type: 'integer',
	minimum: YEAR_MIN,
	maximum: YEAR_MAX,
	description: 'Earliest year, inclusive.'
};
const YEAR_TO = {
	type: 'integer',
	minimum: YEAR_MIN,
	maximum: YEAR_MAX,
	description: 'Latest year, inclusive.'
};
const LIMIT = {
	type: 'integer',
	minimum: 1,
	maximum: MAX_LIMIT,
	default: DEFAULT_LIMIT,
	description: `Rows per page (default ${DEFAULT_LIMIT}, at most ${MAX_LIMIT}).`
};
const OFFSET = {
	type: 'integer',
	minimum: 0,
	default: 0,
	description: 'Matches to skip. Pass the next_offset of the previous page to continue.'
};

const idParam = (source: string) => ({
	type: 'string',
	minLength: 1,
	maxLength: 300,
	description: `Record id, as returned by ${source}.`
});

function schema(properties: Record<string, JsonSchema> = {}, required?: string[]): InputSchema {
	return {
		type: 'object',
		properties,
		...(required?.length ? { required } : {}),
		additionalProperties: false
	};
}

const PUBLICATION_FILTERS = {
	query: QUERY,
	type: { type: 'string', enum: PUBLICATION_TYPES, description: 'Publication type.' },
	tag: { type: 'string', description: 'A subject tag the publication carries.' },
	country: { type: 'string', description: 'A country the work covers, e.g. "Benin" or "Togo".' },
	project: { type: 'string', description: 'The research project the work belongs to.' },
	language: { type: 'string', description: 'Language of publication, e.g. "English" or "French".' },
	year_from: YEAR_FROM,
	year_to: YEAR_TO
};

// ---------------------------------------------------------------------------
// Tool definitions.
// ---------------------------------------------------------------------------

const READ_ONLY: ToolAnnotations = { readOnlyHint: true };

interface Definition {
	name: WebMcpToolName;
	title: string;
	description: string;
	inputSchema: InputSchema;
	annotations?: ToolAnnotations;
	run: (args: Args) => Promise<unknown>;
}

/** Wrap a handler so every failure resolves to an `{ error }` the agent can act on. */
function tool({ run, annotations = READ_ONLY, ...definition }: Definition): WebMcpTool {
	return {
		...definition,
		annotations,
		async execute(input) {
			try {
				return await run(readInput(input));
			} catch (error) {
				return { error: error instanceof Error ? error.message : 'The tool failed; try again.' };
			}
		}
	};
}

type SearchableDataset = keyof typeof SEARCH_FIELDS;

function buildTools({ navigate, fetch }: WebMcpOptions): WebMcpTool[] {
	const fetchDocument = createDocumentLoader({
		// Same-origin and relative, so a preview or a local build answers for itself.
		base: '',
		timeoutMs: 10_000,
		ttlMs: 300_000,
		fetch: (input, init) => (fetch ?? globalThis.fetch)(input, init)
	});
	const loadDataset = async (name: DatasetName) =>
		(await fetchDocument<{ items: ApiItem[] }>(name)).items;
	const getRecord = async (name: DatasetName, args: Args, source: string) =>
		findRecord(await loadDataset(name), name, requiredId(args, source));

	async function searchDataset(
		dataset: SearchableDataset,
		args: Args,
		filters: Record<string, string | undefined>,
		exact: Record<string, string | undefined>
	) {
		const { limit, offset } = page(args);
		const { yearFrom, yearTo } = yearRange(args);
		const query = text(args, 'query');
		const { hits, total } = search(await loadDataset(dataset), {
			query,
			fields: SEARCH_FIELDS[dataset],
			weighted: WEIGHTED_FIELDS,
			filters,
			exact,
			yearFrom,
			yearTo,
			limit,
			offset
		});
		const result = summariseStructured(hits, total, offset);
		if (total > 0) return result;
		return { ...result, hint: 'No matches. Try fewer words, drop a filter, or widen the years.' };
	}

	const tools = [
		// ------------------------------------------------------------ publications
		tool({
			name: 'search_publications',
			title: 'Search publications',
			description: `Search ${author.name}'s own publications: books, journal articles, chapters, edited volumes, special issues, reports, encyclopedia entries, theses and working papers. Free text matches titles, abstracts, authors, tags and venues. Returns one compact row per match (id, title, type, year, venue, url); pass an id to get_publication for the full record, or to get_citation to cite it.`,
			inputSchema: schema({ ...PUBLICATION_FILTERS, limit: LIMIT, offset: OFFSET }),
			run: (args) =>
				searchDataset(
					'publications',
					args,
					{
						tags: text(args, 'tag'),
						project: text(args, 'project'),
						language: text(args, 'language')
					},
					{ type: choice(args, 'type', PUBLICATION_TYPES), country: text(args, 'country') }
				)
		}),
		tool({
			name: 'get_publication',
			title: 'Get a publication',
			description:
				'Full record for one publication: abstract, authors and editors, venue and imprint, identifiers (DOI, ISBN, ISSN), table of contents, the works that cite it and published reviews of it, with its page and source links. Takes an id from search_publications.',
			inputSchema: schema({ id: idParam('search_publications') }, ['id']),
			run: (args) => getRecord('publications', args, 'search_publications')
		}),

		// ---------------------------------------------------------- communications
		tool({
			name: 'search_communications',
			title: 'Search talks and events',
			description: `Search ${author.name}'s talks and events: conference papers, invited lectures, seminars, workshops, panels, posters and podcast appearances. Free text matches titles, abstracts, authors, conference names, panels and locations. Returns one compact row per match (id, title, type, year, venue, url); pass an id to get_communication for the full record.`,
			inputSchema: schema({
				query: QUERY,
				type: { type: 'string', enum: COMMUNICATION_TYPES, description: 'Kind of talk or event.' },
				country: { type: 'string', description: 'Country the event took place in.' },
				project: { type: 'string', description: 'The research project the talk belongs to.' },
				tag: { type: 'string', description: 'A subject tag the talk carries.' },
				year_from: YEAR_FROM,
				year_to: YEAR_TO,
				limit: LIMIT,
				offset: OFFSET
			}),
			run: (args) =>
				searchDataset(
					'communications',
					args,
					{ project: text(args, 'project'), tags: text(args, 'tag') },
					{ type: choice(args, 'type', COMMUNICATION_TYPES), country: text(args, 'country') }
				)
		}),
		tool({
			name: 'get_communication',
			title: 'Get a talk or event',
			description:
				'Full record for one talk or event: abstract, date, venue, location and coordinates, language, project, slides and poster links, and, for a panel, the papers presented and their participants. Takes an id from search_communications.',
			inputSchema: schema({ id: idParam('search_communications') }, ['id']),
			run: (args) => getRecord('communications', args, 'search_communications')
		}),

		// -------------------------------------------------------------- activities
		tool({
			name: 'search_activities',
			title: 'Search activities and news',
			description: `Search ${author.name}'s news and activity log: new publications, grants, workshops, visits and other milestones. Free text matches titles, summaries, the full body text and tags, so this is the tool for what he has been doing lately. Returns one compact row per match, newest first unless a query ranks them; pass an id to get_activity to read the entry.`,
			inputSchema: schema({
				query: QUERY,
				type: {
					type: 'string',
					description: 'Activity type, e.g. "publication", "workshop" or "grant".'
				},
				tag: { type: 'string', description: 'A subject tag the entry carries.' },
				year_from: YEAR_FROM,
				year_to: YEAR_TO,
				limit: LIMIT,
				offset: OFFSET
			}),
			run: (args) =>
				searchDataset('activities', args, { tags: text(args, 'tag') }, { type: text(args, 'type') })
		}),
		tool({
			name: 'get_activity',
			title: 'Get an activity or news entry',
			description:
				'One activity or news entry in full: its complete body text (HTML), date, tags, images and links. Search returns headlines only, so this is how the writing itself is read. Takes an id from search_activities.',
			inputSchema: schema({ id: idParam('search_activities') }, ['id']),
			run: (args) => getRecord('activities', args, 'search_activities')
		}),

		// ---------------------------------------------------------------- research
		tool({
			name: 'list_research_projects',
			title: 'List research projects',
			description: `All of ${author.name}'s research projects, current and concluded: title, span, regions, funding, summary, and the ids of the publications, talks, grants and fieldwork belonging to each. Use get_research_project for a project's full narrative.`,
			inputSchema: schema(),
			async run() {
				// The narratives are most of the bytes, and get_research_project
				// returns them; the list answers "which project?".
				const items = (await loadDataset('research')).map(({ body, ...summary }) => ({
					...summary,
					bodyChars: String(body ?? '').length
				}));
				return { count: items.length, items };
			}
		}),
		tool({
			name: 'get_research_project',
			title: 'Get a research project',
			description:
				'One research project in full: its complete narrative, span, regions, source languages, funding, and the ids of everything that belongs to it. Takes an id from list_research_projects.',
			inputSchema: schema({ id: idParam('list_research_projects') }, ['id']),
			run: (args) => getRecord('research', args, 'list_research_projects')
		}),

		// ------------------------------------------------------ digital humanities
		tool({
			name: 'list_dh_projects',
			title: 'List digital humanities projects',
			description: `Digital archives, datasets and tools built by ${author.name}, including the Islam West Africa Collection (IWAC): title, years, summary, skills, awards, the article describing each and its published reviews. Use get_dh_project for a project's full description and embedded views.`,
			inputSchema: schema(),
			async run() {
				// The HTML description and the embeds are most of the bytes;
				// get_dh_project returns them.
				const items = (await loadDataset('digital-humanities')).map(
					({
						description,
						embeddableContent: _embeds,
						seoTitle: _seoTitle,
						seoDescription: _seoDescription,
						seoKeywords: _seoKeywords,
						...summary
					}) => ({ ...summary, descriptionChars: String(description ?? '').length })
				);
				return { count: items.length, items };
			}
		}),
		tool({
			name: 'get_dh_project',
			title: 'Get a digital humanities project',
			description:
				'One digital humanities project in full: its description (HTML), skills, award, the article describing it, published reviews, embedded views and links. Takes an id from list_dh_projects.',
			inputSchema: schema({ id: idParam('list_dh_projects') }, ['id']),
			run: (args) => getRecord('digital-humanities', args, 'list_dh_projects')
		}),

		// ---------------------------------------------------------------------- cv
		tool({
			name: 'get_cv',
			title: 'Get the CV',
			description: `${author.name}'s career record. Without a section: the person (name, position, affiliation, contact email, research topics, scholarly profiles) and the number of entries in each section. Name a section to read its entries: ${CV_SECTIONS.join(', ')}. Grants carry funder, amount, currency, status and co-applicants.`,
			inputSchema: schema({
				section: {
					type: 'string',
					enum: [...CV_SECTIONS],
					description: 'The section to read. Omit it for the person and the section sizes.'
				}
			}),
			async run(args) {
				const section = choice(args, 'section', CV_SECTIONS);
				const cv = await fetchDocument<CvPayload>('cv');
				if (section) return { section, entries: cv.sections[section] ?? [] };
				const sizes = Object.fromEntries(
					CV_SECTIONS.map((name) => [name, entryCount(cv.sections[name])])
				);
				return { person: cv.person, sections: sizes };
			}
		}),

		// ---------------------------------------------------------------- citation
		tool({
			name: 'get_citation',
			title: 'Cite a publication',
			description:
				"Cite one publication. 'bibtex' returns the BibTeX entry the site's download button produces; 'reference' returns the plain-text reference its Copy reference button copies. Takes an id from search_publications.",
			inputSchema: schema(
				{
					id: idParam('search_publications'),
					style: {
						type: 'string',
						enum: [...CITATION_STYLES],
						default: 'bibtex',
						description: "'bibtex' (the default) or 'reference', a plain-text reference."
					}
				},
				['id']
			),
			async run(args) {
				const style = choice(args, 'style', CITATION_STYLES) ?? 'bibtex';
				const record = await getRecord('publications', args, 'search_publications');
				return { id: record.id, style, citation: citationFor(record, style) };
			}
		})
	];

	// --------------------------------------------------------------- visible UI
	if (navigate) {
		tools.push(
			tool({
				name: 'show_publications',
				title: 'Show publications on screen',
				description:
					'Open the publications index in this tab on a filtered view, so the reader sees and can share the list the site draws. Takes the filters of search_publications; tag, country, project and language are matched to the index facets, ignoring case and accents. Use search_publications to read results yourself.',
				inputSchema: schema(PUBLICATION_FILTERS),
				annotations: { readOnlyHint: false, consequentialHint: false },
				async run(args) {
					const filters = publicationsView(args, await loadDataset('publications'));
					const query = text(args, 'query') ?? '';
					const qs = serializeFiltersToQuery(filters, query);
					const path = `/publications${qs ? `?${qs}` : ''}`;
					await navigate(path);
					return {
						shown: `${website.url}${path}`,
						filters: { ...(query ? { query } : {}), ...filters }
					};
				}
			})
		);
	}

	return tools;
}

/** Entries in a CV section: a list, or (teaching) an object of lists. */
function entryCount(section: unknown): number {
	if (Array.isArray(section)) return section.length;
	if (section && typeof section === 'object')
		return Object.values(section).reduce<number>((sum, value) => sum + entryCount(value), 0);
	return 0;
}

// ---------------------------------------------------------------------------
// show_publications: agent arguments → the index page's own URL state.
// ---------------------------------------------------------------------------

const values = (value: unknown): string[] =>
	(Array.isArray(value) ? value : [value]).filter((v): v is string => typeof v === 'string');

/**
 * Resolve an agent's value to the facet value the index uses, or say which
 * values exist. The index filters by exact value, so "islam" has to become
 * "Islam" before it goes in the URL, or the page would show nothing.
 */
function facetValue(
	args: Args,
	key: string,
	label: string,
	vocabulary: string[]
): string[] | undefined {
	const wanted = text(args, key);
	if (wanted === undefined) return undefined;
	const target = normalise(wanted);
	const exact = vocabulary.find((value) => normalise(value) === target);
	if (exact) return [exact];
	const near = vocabulary.filter((value) => {
		const candidate = normalise(value);
		return candidate.includes(target) || target.includes(candidate);
	});
	const offer = (near.length > 0 ? near : vocabulary).slice(0, 12);
	throw new InputError(
		`No publication has the ${label} "${wanted}". ${near.length > 0 ? 'Close matches' : 'Values include'}: ${offer.join(', ')}.`
	);
}

function publicationsView(args: Args, items: ApiItem[]): UrlSyncableFilters {
	const vocabulary = (pick: (item: ApiItem) => string[]) =>
		[...new Set(items.flatMap(pick))].sort((a, b) => a.localeCompare(b));

	const type = choice(args, 'type', PUBLICATION_TYPES);
	const { yearFrom, yearTo } = yearRange(args);
	const years = items.map((item) => item.year).filter((year) => typeof year === 'number');

	return {
		...(type ? { types: [type] } : {}),
		tags: facetValue(
			args,
			'tag',
			'tag',
			vocabulary((item) => values(item.tags))
		),
		countries: facetValue(
			args,
			'country',
			'country',
			vocabulary((item) => values(item.country))
		),
		projects: facetValue(
			args,
			'project',
			'project',
			vocabulary((item) => values(item.project))
		),
		languages: facetValue(
			args,
			'language',
			'language',
			vocabulary((item) => values(item.language).flatMap((l) => l.split(',').map((s) => s.trim())))
		),
		// The index takes a closed range; an open end is the corpus's own bound.
		...(yearFrom !== undefined || yearTo !== undefined
			? {
					yearRange: {
						min: yearFrom ?? Math.min(...years),
						max: yearTo ?? Math.max(...years)
					}
				}
			: {})
	};
}

// ---------------------------------------------------------------------------
// Registration.
// ---------------------------------------------------------------------------

/**
 * Registers the WebMCP tools for the current document and returns a cleanup
 * callback, which unregisters them all by aborting their shared signal. The
 * root layout dynamically imports this module only after feature detection,
 * keeping the uncommon integration out of the main chunk.
 */
export function registerWebMcp(options: WebMcpOptions = {}): () => void {
	const modelContext =
		typeof document === 'undefined'
			? undefined
			: (document as Document & { modelContext?: ModelContext }).modelContext;
	if (typeof modelContext?.registerTool !== 'function') return () => {};
	const controller = new AbortController();
	for (const tool of buildTools(options)) {
		try {
			void Promise.resolve(modelContext.registerTool(tool, { signal: controller.signal })).catch(
				(error: unknown) => {
					if (!controller.signal.aborted && import.meta.env.DEV)
						console.error('[WebMCP] Failed to register tool:', tool.name, error);
				}
			);
		} catch (error) {
			if (import.meta.env.DEV) console.error('[WebMCP] Failed to register tool:', tool.name, error);
		}
	}
	return () => controller.abort();
}
