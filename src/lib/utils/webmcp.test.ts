import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { allPublications, publicationsByDate } from '$lib/data/publications/index';
import { allCommunications, communicationsByDate } from '$lib/data/communications/index';
import { allResearchProjects } from '$lib/data/research';
import { allDhProjects } from '$lib/data/digital-humanities';
import { author, website } from '$lib/data/siteConfig';
import { registerWebMcp } from './webmcp';

interface Tool {
	name: string;
	inputSchema: { type: string; properties: Record<string, unknown>; required: string[] };
	execute: (
		args: Record<string, unknown>
	) => Promise<{ content: { type: string; text: string }[]; isError?: boolean }>;
}

afterEach(() => {
	vi.unstubAllGlobals();
});

/** Stub a WebMCP runtime and register the site's tools against it. */
function register(
	registerTool: (tool: Tool) => { unregister?: () => void } | undefined = () => ({})
) {
	const tools = new Map<string, Tool>();
	const spy = vi.fn((tool: Tool) => {
		tools.set(tool.name, tool);
		return registerTool(tool);
	});
	vi.stubGlobal('navigator', { modelContext: { registerTool: spy } });
	const cleanup = registerWebMcp();
	return { tools, spy, cleanup };
}

async function call(tool: Tool | undefined, args: Record<string, unknown> = {}) {
	expect(tool).toBeDefined();
	const result = await tool!.execute(args);
	expect(result.content).toHaveLength(1);
	expect(result.content[0]?.type).toBe('text');
	return result;
}

/** Run a tool expected to succeed and parse its JSON payload. */
async function json<T>(tool: Tool | undefined, args: Record<string, unknown> = {}): Promise<T> {
	const result = await call(tool, args);
	expect(result.isError).toBeUndefined();
	return JSON.parse(result.content[0]!.text) as T;
}

interface SearchPayload {
	count: number;
	results: { id: string; type: string; year: number; url: string }[];
}

describe('registerWebMcp', () => {
	it('is a no-op without a WebMCP runtime', () => {
		vi.stubGlobal('navigator', {});
		expect(() => registerWebMcp()()).not.toThrow();
		vi.stubGlobal('navigator', { modelContext: {} });
		expect(() => registerWebMcp()()).not.toThrow();
	});

	it('registers six uniquely named tools with object input schemas', () => {
		const { tools, spy } = register();
		expect(spy).toHaveBeenCalledTimes(6);
		expect([...tools.keys()].sort()).toEqual([
			'get_author_info',
			'get_communication_details',
			'get_publication_details',
			'list_research_projects',
			'search_communications',
			'search_publications'
		]);
		for (const tool of tools.values()) {
			expect(tool.inputSchema.type).toBe('object');
			for (const key of tool.inputSchema.required) {
				expect(tool.inputSchema.properties).toHaveProperty(key);
			}
		}
	});

	it('keeps registering when one tool is refused, and unregisters the rest on cleanup', () => {
		const unregister = vi.fn();
		const { tools, cleanup } = register((tool) => {
			if (tool.name === 'search_publications') throw new Error('refused');
			// A throwing unregister must not stop the others from running.
			if (tool.name === 'get_author_info')
				return {
					unregister: () => {
						throw new Error('gone');
					}
				};
			return { unregister };
		});
		expect(tools.size).toBe(6);
		expect(unregister).not.toHaveBeenCalled();
		expect(() => cleanup()).not.toThrow();
		expect(unregister).toHaveBeenCalledTimes(4);
	});
});

describe('publication tools', () => {
	it('searches by type and year, newest first, with site URLs', async () => {
		const { tools } = register();
		const book = publicationsByDate.find((pub) => pub.type === 'book')!;
		const payload = await json<SearchPayload>(tools.get('search_publications'), {
			type: 'book',
			year: book.year,
			limit: 50
		});
		const expected = publicationsByDate.filter(
			(pub) => pub.type === 'book' && pub.year === book.year
		);
		expect(payload.count).toBe(expected.length);
		expect(payload.results.map((row) => row.id)).toEqual(expected.map((pub) => pub.id));
		for (const row of payload.results) {
			expect(row.url).toBe(`${website.url}/publications/${row.id}`);
		}
	});

	it('matches a query case-insensitively against the title', async () => {
		const { tools } = register();
		const target = publicationsByDate[0]!;
		const payload = await json<SearchPayload>(tools.get('search_publications'), {
			query: `  ${target.title.toUpperCase()} `,
			limit: 50
		});
		expect(payload.results.map((row) => row.id)).toContain(target.id);
	});

	it('clamps the limit to 1–50 and defaults it to 10', async () => {
		const { tools } = register();
		const search = tools.get('search_publications');
		expect((await json<SearchPayload>(search)).count).toBe(Math.min(10, publicationsByDate.length));
		expect((await json<SearchPayload>(search, { limit: -5 })).count).toBe(1);
		expect((await json<SearchPayload>(search, { limit: 500 })).count).toBe(
			Math.min(50, publicationsByDate.length)
		);
	});

	it('returns a record by id, and an error for a missing or unknown id', async () => {
		const { tools } = register();
		const details = tools.get('get_publication_details');
		const pub = allPublications.find((item) => item.abstract)!;
		const record = await json<{ id: string; abstract: string; url: string }>(details, {
			id: pub.id
		});
		expect(record.id).toBe(pub.id);
		expect(record.abstract).toBe(pub.abstract);
		expect(record.url).toBe(`${website.url}/publications/${pub.id}`);

		expect((await call(details, {})).isError).toBe(true);
		const unknown = await call(details, { id: 'no-such-publication' });
		expect(unknown.isError).toBe(true);
		expect(unknown.content[0]?.text).toContain('no-such-publication');
	});
});

describe('talk tools', () => {
	it('searches by type and year, newest first, with site URLs', async () => {
		const { tools } = register();
		const talk = communicationsByDate.find((comm) => comm.type === 'conference')!;
		const payload = await json<SearchPayload>(tools.get('search_communications'), {
			type: 'conference',
			year: talk.year,
			limit: 50
		});
		const expected = communicationsByDate.filter(
			(comm) => comm.type === 'conference' && comm.year === talk.year
		);
		expect(payload.results.map((row) => row.id)).toEqual(
			expected.slice(0, 50).map((comm) => comm.id)
		);
		for (const row of payload.results) {
			expect(row.url).toBe(`${website.url}/communications/${row.id}`);
		}
	});

	it('matches a query against the venue', async () => {
		const { tools } = register();
		const talk = communicationsByDate.find((comm) => comm.conference)!;
		const payload = await json<SearchPayload>(tools.get('search_communications'), {
			query: talk.conference,
			limit: 50
		});
		expect(payload.results.map((row) => row.id)).toContain(talk.id);
	});

	it('returns a record by id, and an error for a missing or unknown id', async () => {
		const { tools } = register();
		const details = tools.get('get_communication_details');
		const comm = allCommunications[0]!;
		const record = await json<{ id: string; title: string }>(details, { id: comm.id });
		expect(record).toMatchObject({ id: comm.id, title: comm.title });

		expect((await call(details, { id: 42 })).isError).toBe(true);
		expect((await call(details, { id: 'no-such-talk' })).isError).toBe(true);
	});
});

describe('site tools', () => {
	it('lists every research and digital-humanities project, each at a real route', async () => {
		const { tools } = register();
		const payload = await json<{
			research: { id: string; url: string }[];
			digitalHumanities: { id: string; url: string }[];
		}>(tools.get('list_research_projects'));

		expect(payload.research.map((row) => row.id)).toEqual(allResearchProjects.map((p) => p.id));
		expect(payload.digitalHumanities.map((row) => row.id)).toEqual(allDhProjects.map((p) => p.id));
		for (const row of payload.research) {
			expect(row.url).toBe(`${website.url}/research/${row.id}`);
			const route = new URL(`../../routes/research/${row.id}/+page.svelte`, import.meta.url);
			expect(existsSync(fileURLToPath(route)), row.id).toBe(true);
		}
	});

	it('describes the author from the site configuration', async () => {
		const { tools } = register();
		const info = await json<{ name: string; website: string; profiles: Record<string, string> }>(
			tools.get('get_author_info')
		);
		expect(info.name).toBe(author.name);
		expect(info.website).toBe(website.url);
		for (const url of Object.values(info.profiles)) expect(url).toMatch(/^https:\/\//);
	});
});
