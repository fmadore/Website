import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { CV_SECTIONS, type ApiItem, type CvPayload } from '$lib/apiContract';
import { website } from '$lib/data/siteConfig';
import { citationFor } from '$lib/utils/apiCitation';
import { WEBMCP_TOOL_NAMES, WEBMCP_UI_TOOLS } from '$lib/utils/webmcpToolNames';
import { GET as activitiesApi } from '../../routes/api/activities.json/+server';
import { GET as communicationsApi } from '../../routes/api/communications.json/+server';
import { GET as cvApi } from '../../routes/api/cv.json/+server';
import { GET as dhApi } from '../../routes/api/digital-humanities.json/+server';
import { GET as publicationsApi } from '../../routes/api/publications.json/+server';
import { GET as researchApi } from '../../routes/api/research.json/+server';
import { registerWebMcp, type WebMcpOptions, type WebMcpTool } from './webmcp';

/**
 * The tools run against the real API documents: each `/api/*.json` request is
 * answered by that route's own handler, so a renamed field or a dropped record
 * breaks these tests exactly as it would break an agent.
 */
const ROUTES = {
	publications: publicationsApi,
	communications: communicationsApi,
	activities: activitiesApi,
	research: researchApi,
	'digital-humanities': dhApi,
	cv: cvApi
} as const;
type Document = keyof typeof ROUTES;

const respond = (name: Document) => ROUTES[name]({} as never) as Promise<Response>;

const apiFetch = vi.fn(async (input: RequestInfo | URL) => {
	const name = /^\/api\/([a-z-]+)\.json$/.exec(String(input))?.[1];
	if (!name || !(name in ROUTES)) return new Response('Not found', { status: 404 });
	return respond(name as Document);
}) as unknown as typeof globalThis.fetch;

const docs = {} as Record<Exclude<Document, 'cv'>, ApiItem[]> & { cv: CvPayload };
beforeAll(async () => {
	for (const name of Object.keys(ROUTES) as Document[]) {
		const payload = await (await respond(name)).json();
		(docs as Record<string, unknown>)[name] = name === 'cv' ? payload : payload.items;
	}
});

afterEach(() => {
	vi.unstubAllGlobals();
});

/** Stub a WebMCP runtime and register the site's tools against it. */
function register(
	registerTool: (
		tool: WebMcpTool,
		options: { signal: AbortSignal }
	) => Promise<void> = async () => {},
	options: WebMcpOptions = { fetch: apiFetch, navigate: async () => {} }
) {
	const tools = new Map<string, WebMcpTool>();
	const spy = vi.fn((tool: WebMcpTool, opts: { signal: AbortSignal }) => {
		tools.set(tool.name, tool);
		return registerTool(tool, opts);
	});
	vi.stubGlobal('document', { modelContext: { registerTool: spy } });
	const cleanup = registerWebMcp(options);
	return { tools, spy, cleanup };
}

/** Call a tool and return its result, which the browser would JSON-serialise. */
async function call<T = Record<string, unknown>>(
	tools: Map<string, WebMcpTool>,
	name: string,
	args: unknown = {}
): Promise<T> {
	const tool = tools.get(name);
	expect(tool, name).toBeDefined();
	const result = await tool!.execute(args);
	// What the runtime does with it: a JSON-serialisable value, nothing else.
	expect(JSON.parse(JSON.stringify(result))).toEqual(result);
	return result as T;
}

/** A call expected to succeed: no `error` key. */
async function ok<T = Record<string, unknown>>(
	tools: Map<string, WebMcpTool>,
	name: string,
	args: unknown = {}
): Promise<T> {
	const result = await call<T & { error?: string }>(tools, name, args);
	expect(result.error, `${name} ${JSON.stringify(args)}`).toBeUndefined();
	return result;
}

/** A call expected to fail: an `{ error }` result, never a rejection. */
async function fails(tools: Map<string, WebMcpTool>, name: string, args: unknown = {}) {
	const result = await call<{ error?: string }>(tools, name, args);
	expect(typeof result.error, `${name} ${JSON.stringify(args)}`).toBe('string');
	return result.error!;
}

interface SearchPage {
	total: number;
	count: number;
	offset: number;
	items: { id: string; type?: string; year?: number; url?: string }[];
	has_more: boolean;
	next_offset?: number;
	hint?: string;
}

describe('registerWebMcp', () => {
	it('is a no-op without a WebMCP runtime', () => {
		vi.stubGlobal('document', {});
		expect(() => registerWebMcp()()).not.toThrow();
		vi.stubGlobal('document', { modelContext: {} });
		expect(() => registerWebMcp()()).not.toThrow();
	});

	it('registers the published tool list, in order', () => {
		const { spy } = register();
		expect(spy.mock.calls.map(([tool]) => tool.name)).toEqual([...WEBMCP_TOOL_NAMES]);
	});

	it('registers the UI tool only when it can navigate', () => {
		const { tools } = register(undefined, { fetch: apiFetch });
		for (const name of WEBMCP_UI_TOOLS) expect(tools.has(name)).toBe(false);
		expect(tools.size).toBe(WEBMCP_TOOL_NAMES.length - WEBMCP_UI_TOOLS.length);
	});

	it('describes every tool within the WebMCP and Chrome limits', () => {
		const { tools } = register();
		for (const tool of tools.values()) {
			// Spec: 1–128 of [A-Za-z0-9_.-]. Chrome's guidance: at most 30.
			expect(tool.name).toMatch(/^[A-Za-z0-9_.-]{1,30}$/);
			expect(tool.title.length, tool.name).toBeGreaterThan(0);
			expect(tool.description.length, tool.name).toBeLessThanOrEqual(500);
			expect(tool.inputSchema).toMatchObject({ type: 'object', additionalProperties: false });
			for (const [key, property] of Object.entries(tool.inputSchema.properties)) {
				const description = String(property.description ?? '');
				expect(description.length, `${tool.name}.${key}`).toBeGreaterThan(0);
				expect(description.length, `${tool.name}.${key}`).toBeLessThanOrEqual(150);
			}
			for (const key of tool.inputSchema.required ?? []) {
				expect(tool.inputSchema.properties).toHaveProperty(key);
			}
		}
	});

	it('annotates every data tool read-only and the UI tool as not', () => {
		const { tools } = register();
		for (const tool of tools.values()) {
			const ui = WEBMCP_UI_TOOLS.includes(tool.name);
			expect(tool.annotations.readOnlyHint, tool.name).toBe(!ui);
			expect(tool.annotations.consequentialHint ?? false, tool.name).toBe(false);
		}
	});

	it('handles rejected promises and aborts all registrations on cleanup', async () => {
		const aborted = vi.fn();
		const { tools, cleanup } = register(async (tool, { signal }) => {
			signal.addEventListener('abort', () => aborted(), { once: true });
			if (tool.name === 'search_publications') throw new Error('refused');
		});
		await Promise.resolve();
		expect(tools.size).toBe(WEBMCP_TOOL_NAMES.length);
		expect(aborted).not.toHaveBeenCalled();
		cleanup();
		cleanup();
		expect(aborted).toHaveBeenCalledTimes(WEBMCP_TOOL_NAMES.length);
	});

	it('aborts pending registrations when disposed before they settle', async () => {
		let finish!: () => void;
		const pending = new Promise<void>((resolve) => {
			finish = resolve;
		});
		const { spy, cleanup } = register(() => pending);
		cleanup();
		finish();
		await pending;
		for (const [, options] of spy.mock.calls) expect(options.signal.aborted).toBe(true);
	});

	it('continues after a synchronous registration failure', () => {
		const { spy, cleanup } = register(() => {
			throw new Error('unavailable');
		});
		expect(spy).toHaveBeenCalledTimes(WEBMCP_TOOL_NAMES.length);
		expect(cleanup).not.toThrow();
	});
});

describe('input handling', () => {
	it('accepts arguments sent as a JSON string, as Chrome did before 155', async () => {
		const { tools } = register();
		const page = await ok<SearchPage>(tools, 'search_publications', '{"limit":2}');
		expect(page.count).toBe(2);
	});

	it('answers a malformed argument with what to send instead', async () => {
		const { tools } = register();
		expect(await fails(tools, 'search_publications', '{not json')).toContain('JSON object');
		expect(await fails(tools, 'search_publications', { type: 'novel' })).toContain('book');
		expect(await fails(tools, 'search_publications', { query: 42 })).toContain('string');
		expect(await fails(tools, 'search_publications', { year_from: 2.5 })).toContain('whole number');
		expect(await fails(tools, 'search_publications', { year_from: 2024, year_to: 2020 })).toContain(
			'on or before'
		);
	});

	it('reports an unreachable API as a result, not a rejection', async () => {
		const down = vi.fn(async () => new Response('down', { status: 503 }));
		const { tools } = register(undefined, { fetch: down as unknown as typeof fetch });
		expect(await fails(tools, 'search_publications')).toContain('HTTP 503');
	});
});

describe('publication tools', () => {
	it('filters by exact type and an inclusive year range, newest first', async () => {
		const { tools } = register();
		const article = docs.publications.find((pub) => pub.type === 'article')!;
		const page = await ok<SearchPage>(tools, 'search_publications', {
			type: 'article',
			year_from: article.year,
			year_to: article.year,
			limit: 50
		});
		const expected = docs.publications.filter(
			(pub) => pub.type === 'article' && pub.year === article.year
		);
		expect(page.items.map((row) => row.id)).toEqual(expected.map((pub) => pub.id));
		for (const row of page.items) {
			expect(row.type).toBe('article');
			expect(row.url).toBe(`${website.url}/publications/${row.id}`);
		}
	});

	it('matches a query against the title', async () => {
		const { tools } = register();
		const target = docs.publications[0]!;
		const page = await ok<SearchPage>(tools, 'search_publications', {
			query: `  ${target.title!.toUpperCase()} `
		});
		expect(page.items[0]?.id).toBe(target.id);
	});

	it('pages by limit and offset, clamping the limit to 1–50 and defaulting it to 10', async () => {
		const { tools } = register();
		const total = docs.publications.length;
		const first = await ok<SearchPage>(tools, 'search_publications');
		expect(first).toMatchObject({ total, count: Math.min(10, total), offset: 0 });
		expect(first.next_offset).toBe(10);
		const second = await ok<SearchPage>(tools, 'search_publications', { offset: 10, limit: 5 });
		expect(second.items.map((row) => row.id)).toEqual(
			docs.publications.slice(10, 15).map((pub) => pub.id)
		);
		expect((await ok<SearchPage>(tools, 'search_publications', { limit: -5 })).count).toBe(1);
		expect((await ok<SearchPage>(tools, 'search_publications', { limit: 500 })).count).toBe(
			Math.min(50, total)
		);
	});

	it('says how to widen a search that matches nothing', async () => {
		const { tools } = register();
		const page = await ok<SearchPage>(tools, 'search_publications', { query: 'zzqx-no-such' });
		expect(page.total).toBe(0);
		expect(page.hint).toMatch(/fewer words/);
	});

	it('returns the API record, and a recoverable error for a missing or unknown id', async () => {
		const { tools } = register();
		const pub = docs.publications.find((item) => item.abstract)!;
		expect(await ok(tools, 'get_publication', { id: pub.id })).toEqual(pub);
		expect(await fails(tools, 'get_publication')).toContain('search_publications');
		expect(await fails(tools, 'get_publication', { id: 'no-such-publication' })).toContain(
			'no-such-publication'
		);
		expect(await fails(tools, 'get_publication', { id: pub.id.slice(0, -2) })).toContain(pub.id);
	});

	it('cites in both of the site’s formats', async () => {
		const { tools } = register();
		for (const pub of docs.publications) {
			const bibtex = await ok<{ citation: string }>(tools, 'get_citation', { id: pub.id });
			expect(bibtex).toEqual({ id: pub.id, style: 'bibtex', citation: citationFor(pub, 'bibtex') });
			expect(bibtex.citation).toMatch(/^@\w+\{/);
		}
		const pub = docs.publications[0]!;
		const reference = await ok<{ citation: string }>(tools, 'get_citation', {
			id: pub.id,
			style: 'reference'
		});
		expect(reference.citation).toBe(citationFor(pub, 'reference'));
		expect(await fails(tools, 'get_citation', { id: pub.id, style: 'apa' })).toContain(
			'bibtex, reference'
		);
	});
});

describe('talk and activity tools', () => {
	it('searches talks by exact type, with site URLs', async () => {
		const { tools } = register();
		const page = await ok<SearchPage>(tools, 'search_communications', {
			type: 'conference',
			limit: 50
		});
		const expected = docs.communications.filter((comm) => comm.type === 'conference');
		expect(page.total).toBe(expected.length);
		expect(page.items.map((row) => row.id)).toEqual(expected.slice(0, 50).map((c) => c.id));
		for (const row of page.items) {
			expect(row.url).toBe(`${website.url}/communications/${row.id}`);
		}
	});

	it('matches a talk by its venue and returns its record', async () => {
		const { tools } = register();
		const talk = docs.communications.find((comm) => comm.conference)!;
		const page = await ok<SearchPage>(tools, 'search_communications', {
			query: String(talk.conference),
			limit: 50
		});
		expect(page.items.map((row) => row.id)).toContain(talk.id);
		expect(await ok(tools, 'get_communication', { id: talk.id })).toEqual(talk);
		expect(await fails(tools, 'get_communication', { id: 42 })).toContain('string');
	});

	it('searches activity bodies and returns the full entry', async () => {
		const { tools } = register();
		const entry = docs.activities.find((item) => typeof item.content === 'string')!;
		const word = String(entry.title)
			.split(/\s+/)
			.find((w) => w.length > 6)!;
		const page = await ok<SearchPage>(tools, 'search_activities', { query: word, limit: 50 });
		expect(page.items.map((row) => row.id)).toContain(entry.id);
		const record = await ok<ApiItem>(tools, 'get_activity', { id: entry.id });
		expect(record.content).toBe(entry.content);
	});
});

describe('project and CV tools', () => {
	it('lists research projects without their narratives, each at a real route', async () => {
		const { tools } = register();
		const list = await ok<{ count: number; items: ApiItem[] }>(tools, 'list_research_projects');
		expect(list.items.map((p) => p.id)).toEqual(docs.research.map((p) => p.id));
		for (const project of list.items) {
			expect(project).not.toHaveProperty('body');
			expect(project.url).toBe(`${website.url}/research/${project.id}`);
			const route = new URL(`../../routes/research/${project.id}/+page.svelte`, import.meta.url);
			expect(existsSync(fileURLToPath(route)), project.id).toBe(true);
		}
		const full = docs.research.find((p) => p.body)!;
		expect(list.items.find((p) => p.id === full.id)?.bodyChars).toBe(String(full.body).length);
		expect(await ok(tools, 'get_research_project', { id: full.id })).toEqual(full);
	});

	it('lists digital humanities projects compactly and returns each in full', async () => {
		const { tools } = register();
		const list = await ok<{ items: ApiItem[] }>(tools, 'list_dh_projects');
		expect(list.items.map((p) => p.id)).toEqual(docs['digital-humanities'].map((p) => p.id));
		for (const project of list.items) {
			expect(project).not.toHaveProperty('description');
			expect(project).not.toHaveProperty('embeddableContent');
		}
		const project = docs['digital-humanities'][0]!;
		expect(await ok(tools, 'get_dh_project', { id: project.id })).toEqual(project);
	});

	it('gives the person and section sizes by default, and one section on request', async () => {
		const { tools } = register();
		const overview = await ok<{ person: unknown; sections: Record<string, number> }>(
			tools,
			'get_cv'
		);
		expect(overview.person).toEqual(docs.cv.person);
		expect(Object.keys(overview.sections)).toEqual([...CV_SECTIONS]);
		expect(Object.keys(docs.cv.sections)).toEqual([...CV_SECTIONS]);
		const grants = await ok<{ entries: unknown[] }>(tools, 'get_cv', { section: 'grants' });
		expect(grants.entries).toEqual(docs.cv.sections.grants);
		expect(overview.sections.grants).toBe(grants.entries.length);
		// Teaching is the one section grouped into lists of its own.
		const teaching = docs.cv.sections.teaching as Record<string, unknown[]>;
		const taught = Object.values(teaching).reduce((sum, list) => sum + list.length, 0);
		expect(taught).toBeGreaterThan(0);
		expect(overview.sections.teaching).toBe(taught);
		expect(await fails(tools, 'get_cv', { section: 'hobbies' })).toContain('grants');
	});
});

describe('show_publications', () => {
	it('opens the index with the canonical facet values in the URL', async () => {
		const navigate = vi.fn(async () => {});
		const { tools } = register(undefined, { fetch: apiFetch, navigate });
		const pub = docs.publications.find(
			(item) => Array.isArray(item.tags) && item.tags.length > 0 && item.year
		)!;
		const tag = String((pub.tags as string[])[0]);
		const result = await ok<{ shown: string }>(tools, 'show_publications', {
			query: 'islam',
			tag: tag.toLowerCase(),
			type: pub.type,
			year_from: pub.year
		});
		const years = docs.publications.map((item) => item.year!).filter(Boolean);
		const expected = new URLSearchParams({
			type: String(pub.type),
			tag,
			year_min: String(pub.year),
			year_max: String(Math.max(...years)),
			q: 'islam'
		});
		expect(navigate).toHaveBeenCalledWith(`/publications?${expected}`);
		expect(result.shown).toBe(`${website.url}/publications?${expected}`);
	});

	it('opens the unfiltered index when given nothing', async () => {
		const navigate = vi.fn(async () => {});
		const { tools } = register(undefined, { fetch: apiFetch, navigate });
		await ok(tools, 'show_publications');
		expect(navigate).toHaveBeenCalledWith('/publications');
	});

	it('names the values that exist instead of opening an empty view', async () => {
		const navigate = vi.fn(async () => {});
		const { tools } = register(undefined, { fetch: apiFetch, navigate });
		const error = await fails(tools, 'show_publications', { country: 'Atlantis' });
		expect(error).toContain('Atlantis');
		expect(error).toContain('Benin');
		expect(navigate).not.toHaveBeenCalled();
	});
});
