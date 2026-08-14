import { build } from 'esbuild';
import { createHash } from 'node:crypto';
import { cp, mkdir, readFile, rm, stat, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { zipSync } from 'fflate';
import { Client } from '@modelcontextprotocol/client';
import { StdioClientTransport } from '@modelcontextprotocol/client/stdio';

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
 *
 * The bundle ships unsigned, by decision. Signature verification checks the OS
 * trust store, so only a CA-issued code-signing certificate would clear Claude
 * Desktop's unverified-publisher warning, and one is not being bought. A
 * self-signed certificate is not a workaround — chaining to nothing trusted, it
 * verifies as `unsigned` anyway.
 *
 * The archive is written with `fflate` directly rather than through the
 * `@anthropic-ai/mcpb` CLI. That CLI packs with exactly this call (`zipSync`,
 * level 9, Unix mode bits in the external attributes), but it also depends on
 * `@inquirer/prompts` for its interactive `init` wizard, which drags in a
 * `tmp` with two unfixed high-severity advisories. Nothing here ever runs
 * `init`, so the whole chain was a vulnerable devDependency serving one
 * `zipSync` call — 171 packages for a function this file can make itself.
 */

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

const client = new Client(
	{ name: 'pack', version: '0.0.0' },
	{ versionNegotiation: { mode: 'auto' } }
);
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

// ------------------------------------------------------- 4. validate the manifest

/**
 * The manifest is generated above from a fixed template, so the risk is a field
 * going missing in an edit, not arbitrary malformed input. These are the fields
 * Claude Desktop needs to install and launch the bundle at all.
 */
const REQUIRED = [
	['manifest_version', (m) => typeof m.manifest_version === 'string'],
	['name', (m) => /^[a-z0-9][a-z0-9._-]*$/.test(m.name ?? '')],
	['version', (m) => /^\d+\.\d+\.\d+/.test(m.version ?? '')],
	['description', (m) => (m.description ?? '').length > 0],
	['author.name', (m) => (m.author?.name ?? '').length > 0],
	['server.type', (m) => ['node', 'python', 'binary', 'uv'].includes(m.server?.type)],
	['server.entry_point', (m) => (m.server?.entry_point ?? '').length > 0],
	['server.mcp_config.command', (m) => (m.server?.mcp_config?.command ?? '').length > 0],
	['server.mcp_config.args', (m) => Array.isArray(m.server?.mcp_config?.args)]
];

const invalid = REQUIRED.filter(([, ok]) => !ok(manifest)).map(([field]) => field);
if (invalid.length > 0)
	throw new Error(`manifest.json is missing or malformed: ${invalid.join(', ')}`);

// The declared entry point has to be a file that actually exists in the bundle,
// or the extension installs and then fails to start.
await stat(new URL(`./${manifest.server.entry_point}`, `file://${stage}`));

console.log('manifest: valid');

// ------------------------------------------------------------------- 5. pack

const CONTENTS = ['manifest.json', 'icon.png', 'package.json', 'server/index.js'];

const entries = {};
for (const name of CONTENTS) {
	const path = new URL(`./${name}`, `file://${stage}`);
	const data = new Uint8Array(await readFile(path));
	const { mode } = await stat(path);
	// Unix permission bits live in the upper 16 of the external attributes, so
	// the executable bit on the entry point survives the round trip.
	entries[name] =
		process.platform === 'win32' ? data : [data, { os: 3, attrs: (mode & 0o777) << 16 }];
}

const archive = zipSync(entries, { level: 9, mtime: new Date() });

const out = here('./dist/frederickmadore-website.mcpb');
await mkdir(here('./dist/'), { recursive: true });
await writeFile(out, archive);

const shasum = createHash('sha1').update(archive).digest('hex');
console.log(`\n${manifest.name}@${manifest.version}`);
for (const name of CONTENTS) console.log(`  ${name}`);
console.log(`\npackage size: ${(archive.length / 1024).toFixed(1)} KB`);
console.log(`shasum:       ${shasum}`);
console.log(`output:       ${out}`);
console.log(
	'\nUnsigned: clearing the unverified-publisher warning needs a CA-issued\n' +
		'code-signing certificate, which this project does not use.'
);
