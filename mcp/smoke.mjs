import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
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
 * Requires `npm run build` at the repo root first.
 */

const buildDir = fileURLToPath(new URL('../build/', import.meta.url));
const serverEntry = fileURLToPath(new URL('./dist/index.js', import.meta.url));

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

const client = new Client({ name: 'smoke', version: '0.0.0' });
const transport = new StdioClientTransport({
	command: process.execPath,
	args: [serverEntry],
	env: { ...process.env, WEBSITE_API_BASE: base }
});

const text = (result) => result.content.map((part) => part.text).join('\n');

try {
	await client.connect(transport);

	const { tools } = await client.listTools();
	const names = tools.map((tool) => tool.name).sort();
	console.log(`\ntools (${names.length}): ${names.join(', ')}\n`);

	check('all 11 tools registered', names.length === 11, `got ${names.length}`);
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
		parsed.some((p) => p.publications?.length)
	);
	check(
		'research projects cross-reference grants',
		parsed.some((p) => p.grants?.length)
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

	const pubs = JSON.parse(
		await readFile(new URL('api/publications.json', `file://${buildDir}`), 'utf8')
	);
	const book = pubs.items.find((item) => item.type === 'book');

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

	const missing = await client.callTool({
		name: 'get_publication',
		arguments: { id: 'no-such-publication' }
	});
	check('unknown id reports an error, not a crash', missing.isError === true);

	console.log(`\n${checks - failures.length}/${checks} checks passed`);
} finally {
	await client.close().catch(() => {});
	http.close();
}

if (failures.length > 0) {
	console.error(`\nFAILED: ${failures.join('; ')}`);
	process.exit(1);
}
