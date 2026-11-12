import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import { Client, InMemoryTransport } from '@modelcontextprotocol/client';
import { registerWebMcp, type WebMcpTool } from '#lib/utils/webmcp.ts';
import { WEBMCP_TOOL_NAMES, WEBMCP_UI_TOOLS } from '#lib/utils/webmcpToolNames.ts';

/**
 * Tool-catalogue parity: the WebMCP tools and the MCP server's tools.
 *
 * The twelve read tools are defined twice — hand-written JSON Schema in
 * `webmcp.ts`, zod in `mcp/src/server.ts` — and promise the same names, the
 * same arguments and the same records (CLAUDE.md § WebMCP). Nothing compared
 * them: `mcp/smoke.mjs` counts twelve and stops. A parameter added on one side,
 * an enum value dropped, a bound moved, and an agent gets a different contract
 * depending on which door it came in by.
 *
 * Both catalogues are read as an agent sees them: the server's through a real
 * MCP client over an in-memory transport (`tools/list`, so zod's own JSON
 * Schema conversion is what gets compared), WebMCP's from a stubbed
 * `document.modelContext`. Nothing is fetched; no tool runs.
 *
 * Descriptions are prose and may differ (WebMCP's stay under Chrome's length
 * guidance). Names, parameters, types, enums, bounds, defaults and required
 * sets may not.
 */

interface JsonSchema {
	properties?: Record<string, Record<string, unknown>>;
	required?: string[];
	additionalProperties?: unknown;
}

/**
 * The server module, imported by a computed path. `mcp/` resolves `#lib`
 * through its own tsconfig `paths`, which the site's type-check does not
 * read, so a static import would pull the whole server into `npm run check`
 * and fail there; `npm run mcp:check` type-checks it instead. Vitest resolves
 * `#lib` from package.json either way.
 */
const SERVER_MODULE = '../../../mcp/src/server.ts';
interface ServerModule {
	createWebsiteServer: () => { connect: (transport: unknown) => Promise<void> };
}

const server = new Map<string, JsonSchema>();
const web = new Map<string, WebMcpTool>();
let client: Client;

beforeAll(async () => {
	const { createWebsiteServer } = (await import(/* @vite-ignore */ SERVER_MODULE)) as ServerModule;
	const [clientSide, serverSide] = InMemoryTransport.createLinkedPair();
	await createWebsiteServer().connect(serverSide);
	client = new Client({ name: 'parity', version: '0.0.0' });
	await client.connect(clientSide);
	for (const tool of (await client.listTools()).tools) {
		server.set(tool.name, tool.inputSchema as JsonSchema);
	}

	vi.stubGlobal('document', {
		modelContext: { registerTool: (tool: WebMcpTool) => void web.set(tool.name, tool) }
	});
	registerWebMcp({ navigate: async () => {}, fetch: async () => new Response('{}') })();
	vi.unstubAllGlobals();
});

afterAll(async () => {
	await client?.close();
});

/** The keywords that make up a parameter's contract (not its prose). */
const CONTRACT = [
	'type',
	'enum',
	'minimum',
	'maximum',
	'exclusiveMinimum',
	'exclusiveMaximum',
	'minLength',
	'maxLength',
	'default'
] as const;

/**
 * One parameter's contract. zod writes `.int().nonnegative()` with an upper
 * bound of `Number.MAX_SAFE_INTEGER`, which is the integer type's own range
 * rather than a limit anyone chose; it is dropped so the two sides compare.
 */
function contract(param: Record<string, unknown>): Record<string, unknown> {
	const out: Record<string, unknown> = {};
	for (const key of CONTRACT) {
		if (param[key] === undefined) continue;
		if (key === 'maximum' && param[key] === Number.MAX_SAFE_INTEGER) continue;
		out[key] = key === 'enum' ? [...(param[key] as string[])].sort() : param[key];
	}
	return out;
}

const shape = (schema: JsonSchema) => ({
	parameters: Object.keys(schema.properties ?? {}).sort(),
	required: [...(schema.required ?? [])].sort(),
	closed: schema.additionalProperties === false
});

describe('the WebMCP and MCP tool catalogues', () => {
	it('read both catalogues', () => {
		expect(server.size).toBe(12);
		expect(web.size).toBe(WEBMCP_TOOL_NAMES.length);
	});

	it('name the same tools: the server’s, plus the UI tools on the page', () => {
		const ui = new Set<string>(WEBMCP_UI_TOOLS);
		expect([...server.keys()].sort()).toEqual(WEBMCP_TOOL_NAMES.filter((n) => !ui.has(n)).sort());
		expect([...web.keys()].sort()).toEqual([...WEBMCP_TOOL_NAMES].sort());
	});

	const shared = WEBMCP_TOOL_NAMES.filter((n) => !WEBMCP_UI_TOOLS.includes(n));

	it.each(shared)('%s takes the same parameters and requires the same ones', (name) => {
		const mcp = server.get(name)!;
		const page: JsonSchema = web.get(name)!.inputSchema;
		expect(shape(page)).toEqual(shape(mcp));
	});

	it.each(shared)('%s gives each parameter the same type, enum, bounds and default', (name) => {
		const mcp = server.get(name)!.properties ?? {};
		const page: Record<string, Record<string, unknown>> = web.get(name)!.inputSchema.properties;
		for (const param of Object.keys(mcp)) {
			expect(contract(page[param] ?? {}), `${name}.${param}`).toEqual(contract(mcp[param]!));
		}
	});

	it('show_publications takes the filters of search_publications, without paging, plus the index’s co-author and sort', () => {
		// Its description promises exactly this; hold it to it. `author` and
		// `sort` are the publications index's own controls (its Co-authors facet
		// and its sort row), which the search tool does not offer.
		const search: JsonSchema = web.get('search_publications')!.inputSchema;
		const show: JsonSchema = web.get('show_publications')!.inputSchema;
		const filters = Object.keys(search.properties ?? {}).filter(
			(p) => p !== 'limit' && p !== 'offset'
		);
		expect(Object.keys(show.properties ?? {}).sort()).toEqual(
			[...filters, 'author', 'sort'].sort()
		);
		for (const param of filters) {
			expect(contract(show.properties![param]!), param).toEqual(
				contract(search.properties![param]!)
			);
		}
	});
});
