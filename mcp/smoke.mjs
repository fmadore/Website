import { createServer } from 'node:http';
import { execFile } from 'node:child_process';
import { existsSync } from 'node:fs';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

/**
 * End-to-end smoke test.
 *
 * Serves the site's built `/api` directory over HTTP, launches the server as a
 * real subprocess, and drives it through the MCP client — so this exercises the
 * protocol wiring, the JSON shapes, and the bundled citation code together.
 * Unit tests over the pure modules cannot catch a broken tool registration or a
 * field the API renamed; this can.
 *
 * The suite runs against both builds when both exist:
 *
 *  - `dist/index.js`, the developer build with external dependencies
 *  - the server unpacked out of the `.mcpb`, which is minified, has its
 *    dependencies inlined, and targets an older Node — i.e. the artifact users
 *    actually install. Building it is not proof it runs.
 *
 * Requires `npm run build` at the repo root first.
 */

const run = promisify(execFile);
const here = (path) => fileURLToPath(new URL(path, import.meta.url));
const buildDir = here('../build/');

const failures = [];
let checks = 0;

function check(label, condition, detail = '') {
	checks += 1;
	if (condition) {
		console.log(`  ok   ${label}`);
	} else {
		console.log(`  FAIL ${label}${detail ? ` — ${detail}` : ''}`);
		failures.push(label);
	}
}

const http = createServer(async (req, res) => {
	try {
		const body = await readFile(new URL(`.${req.url}`, `file://${buildDir}`));
		res.writeHead(200, { 'Content-Type': 'application/json' }).end(body);
	} catch {
		res.writeHead(404).end('not found');
	}
});

await new Promise((resolve) => http.listen(0, '127.0.0.1', resolve));
const base = `http://127.0.0.1:${http.address().port}`;

const text = (result) => result.content.map((part) => part.text).join('\n');

const publications = JSON.parse(
	await readFile(new URL('api/publications.json', `file://${buildDir}`), 'utf8')
);
const book = publications.items.find((item) => item.type === 'book');

async function exercise(entry) {
	const client = new Client({ name: 'smoke', version: '0.0.0' });
	await client.connect(
		new StdioClientTransport({
			command: process.execPath,
			args: [entry],
			env: { ...process.env, WEBSITE_API_BASE: base }
		})
	);

	try {
		const { tools } = await client.listTools();
		const names = tools.map((tool) => tool.name).sort();
		console.log(`  tools (${names.length}): ${names.join(', ')}`);

		check('all 12 tools registered', names.length === 12, `got ${names.length}`);
		check(
			'every tool has a description',
			tools.every((tool) => (tool.description ?? '').length > 20)
		);

		const byQuery = await client.callTool({
			name: 'search_publications',
			arguments: { query: 'campus', limit: 5 }
		});
		check(
			'search_publications finds campus work',
			/id: /.test(text(byQuery)),
			text(byQuery).slice(0, 120)
		);

		// The corpus is francophone; a query without diacritics must still reach it.
		const accentless = await client.callTool({
			name: 'search_publications',
			arguments: { country: "cote d'ivoire", limit: 50 }
		});
		check('country filter is accent-insensitive', /matches?:/.test(text(accentless)));

		const filtered = await client.callTool({
			name: 'search_publications',
			arguments: { type: 'book', limit: 50 }
		});
		check('type filter returns only books', !/\n {2}(article|chapter) · /.test(text(filtered)));

		const ranged = await client.callTool({
			name: 'search_communications',
			arguments: { year_from: 2024, year_to: 2024, limit: 50 }
		});
		check(
			'year range excludes other years',
			!/ · 20(1\d|2[0-35-9])\n/.test(text(ranged)),
			text(ranged).slice(0, 120)
		);

		const projects = await client.callTool({ name: 'list_research_projects', arguments: {} });
		const parsed = JSON.parse(text(projects));
		check(
			'research projects cross-reference publications',
			parsed.some((project) => project.publications?.length)
		);
		check(
			'research projects cross-reference grants',
			parsed.some((project) => project.grants?.length)
		);

		const firstId = parsed[0].id;
		const project = await client.callTool({
			name: 'get_research_project',
			arguments: { id: firstId }
		});
		check('get_research_project round-trips an id', JSON.parse(text(project)).id === firstId);

		const cv = await client.callTool({ name: 'get_cv', arguments: { section: 'grants' } });
		const grants = JSON.parse(text(cv)).entries;
		check('get_cv returns grant records', grants.length > 0 && Boolean(grants[0].funder));

		const bibtex = await client.callTool({
			name: 'get_citation',
			arguments: { id: book.id, style: 'bibtex' }
		});
		check(
			'bibtex entry is well-formed',
			/^@\w+\{/.test(text(bibtex).trim()),
			text(bibtex).slice(0, 80)
		);
		check('bibtex carries the title', text(bibtex).includes('title'));

		const reference = await client.callTool({
			name: 'get_citation',
			arguments: { id: book.id, style: 'reference' }
		});
		check(
			'plain reference has no markup',
			!/[<>]/.test(text(reference)),
			text(reference).slice(0, 120)
		);

		// Every dataset's substantive writing has to be reachable, not merely
		// indexed. Each of these fetches the full record and asserts the prose
		// arrived — the failure this guards against is text that is searchable
		// but that no tool will actually hand back.
		const fullPublication = await client.callTool({
			name: 'get_publication',
			arguments: { id: book.id }
		});
		check(
			'get_publication returns the abstract',
			(JSON.parse(text(fullPublication)).abstract ?? '').length > 200
		);

		const talkId = JSON.parse(text(projects))[0].communications?.[0];
		const fullTalk = await client.callTool({
			name: 'get_communication',
			arguments: { id: talkId }
		});
		check(
			'get_communication returns the abstract',
			(JSON.parse(text(fullTalk)).abstract ?? '').length > 200
		);

		const activities = await client.callTool({
			name: 'search_activities',
			arguments: { limit: 1 }
		});
		const activityId = text(activities).match(/id: (\S+)/)?.[1];
		const fullActivity = await client.callTool({
			name: 'get_activity',
			arguments: { id: activityId }
		});
		check(
			'get_activity returns the body text',
			(JSON.parse(text(fullActivity)).content ?? '').length > 200
		);

		const fullProject = await client.callTool({
			name: 'get_research_project',
			arguments: { id: firstId }
		});
		check(
			'get_research_project returns the narrative',
			(JSON.parse(text(fullProject)).body ?? '').length > 1000,
			`${(JSON.parse(text(fullProject)).body ?? '').length} chars`
		);

		const dhProjects = await client.callTool({ name: 'list_dh_projects', arguments: {} });
		check(
			'digital humanities projects carry their descriptions',
			JSON.parse(text(dhProjects)).every((dh) => (dh.description ?? '').length > 200)
		);

		// The listing stays a listing: narratives are fetched, not broadcast.
		check(
			'list_research_projects omits the narratives',
			JSON.parse(text(projects)).every((project) => project.body === undefined)
		);

		const missing = await client.callTool({
			name: 'get_publication',
			arguments: { id: 'no-such-publication' }
		});
		check('unknown id reports an error, not a crash', missing.isError === true);
	} finally {
		await client.close().catch(() => {});
	}
}

let unpacked;
try {
	console.log('\n── developer build (dist/index.js) ──');
	await exercise(here('./dist/index.js'));

	const bundle = here('./dist/frederickmadore-website.mcpb');
	if (existsSync(bundle)) {
		console.log('\n── installed bundle (unpacked from .mcpb) ──');
		unpacked = await mkdtemp(join(tmpdir(), 'mcpb-'));
		// `unzip` is present on CI runners and dev machines alike; if it is not,
		// say so rather than silently skipping the artifact users install.
		await run('unzip', ['-q', bundle, '-d', unpacked]);
		await exercise(join(unpacked, 'server', 'index.js'));

		const manifest = JSON.parse(await readFile(join(unpacked, 'manifest.json'), 'utf8'));
		check(
			'manifest declares the entry point that exists',
			manifest.server.entry_point === 'server/index.js'
		);
		check('manifest tool list matches the server', manifest.tools.length === 12);
	} else {
		console.log('\n(no .mcpb built — run `npm run pack -w mcp` to include it)');
	}

	console.log(`\n${checks - failures.length}/${checks} checks passed`);
} finally {
	http.close();
	if (unpacked) await rm(unpacked, { recursive: true, force: true });
}

if (failures.length > 0) {
	console.error(`\nFAILED: ${failures.join('; ')}`);
	process.exit(1);
}
