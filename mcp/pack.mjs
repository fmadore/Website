import { build } from 'esbuild';
import { execFile } from 'node:child_process';
import { existsSync } from 'node:fs';
import { cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

/**
 * Builds the `.mcpb` bundle — a zip Claude Desktop installs on a double-click,
 * with no config file to edit and no Node install required (the app supplies
 * its own runtime).
 *
 * Two things differ from `build.mjs`, which produces the developer-facing
 * `dist/index.js`:
 *
 *  1. Dependencies are inlined rather than left external, so the bundle is one
 *     self-contained file with no `node_modules/` to ship.
 *  2. The manifest's tool list is read back out of the built server over the
 *     real protocol instead of being hand-written here. A hand-written list is
 *     a second source of truth that silently drifts the moment a tool is
 *     renamed; this one cannot.
 */

const run = promisify(execFile);
const here = (path) => fileURLToPath(new URL(path, import.meta.url));

const stage = here('./bundle/');
const entry = here('./bundle/server/index.js');

const pkg = JSON.parse(await readFile(here('./package.json'), 'utf8'));

// ---------------------------------------------------------------- 1. compile

await rm(stage, { recursive: true, force: true });
await mkdir(new URL('./server/', `file://${stage}`), { recursive: true });

await build({
	entryPoints: [here('./src/index.ts')],
	outfile: entry,
	bundle: true,
	platform: 'node',
	// Claude Desktop ships its own Node; target the oldest it is likely to
	// carry rather than the version this repo builds the site with.
	target: 'node20',
	format: 'esm',
	minify: true,
	alias: { $lib: here('../src/lib') },
	logLevel: 'info'
});

// The bundle has no package.json of its own by default, so Node would read the
// ESM output as CommonJS and fail on the import statements.
await writeFile(
	new URL('./package.json', `file://${stage}`),
	`${JSON.stringify({ type: 'module' }, null, 2)}\n`
);

await cp(here('../static/icons/icon-512.png'), new URL('./icon.png', `file://${stage}`));

// ------------------------------------------------- 2. ask the server its tools

const client = new Client({ name: 'pack', version: '0.0.0' });
await client.connect(new StdioClientTransport({ command: process.execPath, args: [entry] }));
const { tools } = await client.listTools();
await client.close();

if (tools.length === 0) throw new Error('The built server advertised no tools.');
console.log(`\nmanifest: ${tools.length} tools read from the built server`);

// ------------------------------------------------------------- 3. manifest

const manifest = {
	manifest_version: '0.3',
	name: 'frederickmadore-website',
	display_name: 'Frédérick Madore — Academic Record',
	version: pkg.version,
	description: pkg.description,
	long_description:
		"Search and cite Frédérick Madore's publications, conference papers, invited lectures, research projects, digital humanities work, and CV. Reads the machine-readable data published at frederickmadore.com, so it always reflects the live site. Covers his own scholarship — not the West African source archive (IWAC), which has its own server.",
	author: { name: pkg.author, url: 'https://www.frederickmadore.com' },
	repository: { type: 'git', url: 'https://github.com/fmadore/Website' },
	homepage: 'https://www.frederickmadore.com',
	documentation: 'https://github.com/fmadore/Website/blob/main/mcp/README.md',
	support: 'https://github.com/fmadore/Website/issues',
	icon: 'icon.png',
	license: pkg.license,
	keywords: [
		'academic',
		'bibliography',
		'citations',
		'African studies',
		'Islamic studies',
		'digital humanities'
	],
	server: {
		type: 'node',
		entry_point: 'server/index.js',
		mcp_config: {
			command: 'node',
			args: ['${__dirname}/server/index.js'],
			env: { WEBSITE_API_BASE: '${user_config.api_base}' }
		}
	},
	tools: tools.map((tool) => ({ name: tool.name, description: tool.description })),
	user_config: {
		api_base: {
			type: 'string',
			title: 'Site address',
			description:
				'Where to read the data from. Leave blank for the live site; point it at a local preview (http://localhost:4173) to work against unpublished content.',
			required: false,
			default: ''
		}
	},
	compatibility: {
		platforms: ['darwin', 'win32', 'linux'],
		runtimes: { node: '>=20.0.0' }
	}
};

await writeFile(
	new URL('./manifest.json', `file://${stage}`),
	`${JSON.stringify(manifest, null, 2)}\n`
);

// -------------------------------------------------------- 4. validate and pack

// npm workspaces hoist binaries to the root, but a standalone install of this
// package would keep them local — accept either.
const mcpb = [here('./node_modules/.bin/mcpb'), here('../node_modules/.bin/mcpb')].find(
	(candidate) => existsSync(candidate)
);
if (!mcpb) throw new Error('mcpb CLI not found — run `npm install`.');

const out = here('./dist/frederickmadore-website.mcpb');
await mkdir(here('./dist/'), { recursive: true });

const { stdout: validated } = await run(mcpb, ['validate', `${stage}manifest.json`]);
process.stdout.write(validated);

const { stdout: packed } = await run(mcpb, ['pack', stage, out]);
process.stdout.write(packed);
