/**
 * Bundle budget guard.
 *
 * ECharts, D3, MapLibre and jsPDF are deliberately code-split (see
 * `build.rolldownOptions.manualChunks` in vite.config.ts) because each is
 * enormous and each is needed on exactly one or two pages. Nothing currently
 * enforces that: a stray top-level `import { … } from 'echarts'` in a shared
 * component would silently pull 600 KiB into the code every visitor downloads,
 * and every existing test would still pass. This script is the tripwire.
 *
 * It answers two questions from the Vite client manifest, which records the
 * static (`imports`) and dynamic (`dynamicImports`) edges separately:
 *
 *   1. Is any heavy library reachable through STATIC imports from the app
 *      entry or from a route? Static reachability is what forces a download
 *      before the page can render; a dynamic edge is the whole point of the
 *      split and is fine.
 *   2. Has the shared entry bundle — the JS every page pays for, whatever it
 *      is — grown past its budget?
 *
 * Heavy chunks are identified by content signature rather than by filename,
 * because output filenames are content-hashed and the manualChunks names never
 * reach disk.
 *
 * Usage:
 *   node scripts/check-bundle-budget.mjs
 *
 * Exit code 1 on a budget breach or a static leak.
 */
import { readFileSync, existsSync, statSync } from 'node:fs';
import { exit } from 'node:process';

const MANIFEST = '.svelte-kit/output/client/.vite/manifest.json';
const BUILD_DIR = 'build';

/**
 * Ceiling for the JS every visitor downloads before anything renders: the app
 * entry, the Kit runtime, and their shared chunks. Measured at 103 KiB when
 * this guard was written; the headroom absorbs ordinary growth while still
 * catching a heavy library landing in the shared graph.
 */
const ENTRY_BUDGET_KIB = 140;

/**
 * Ceiling for the JS a visitor downloads for any single route, entry included.
 * The heaviest route measured 698 KiB when this guard was written — mostly the
 * publication and communication datasets, not libraries. The budget is set
 * above that to catch a step change rather than to police ordinary growth.
 */
const ROUTE_BUDGET_KIB = 850;

/**
 * Signatures that identify a heavy library inside a minified chunk. Matched
 * against chunk contents because the emitted filenames are content hashes and
 * the manualChunks names never reach disk.
 */
const HEAVY = [
	{ name: 'ECharts', re: /"echarts"|echartsInstance|zrender/ },
	{ name: 'MapLibre', re: /maplibregl-attrib|maplibregl-canvas|MapLibre GL JS/ },
	{ name: 'jsPDF', re: /jsPDF|jspdf/ }
];

/**
 * A chunk must be at least this big before a signature match counts.
 *
 * Without the floor the check fires on *wrappers*: the lazy-loading module that
 * names `maplibre-gl` in a dynamic import specifier, and component code that
 * references a `maplibregl-*` CSS class, both match while containing none of
 * the library. Those measured 4 KiB and 60 KiB here; the implementations are
 * 1004 KiB (MapLibre), 629 KiB (ECharts) and 390 KiB (jsPDF), so the floor
 * separates a mention from a payload with room to spare.
 *
 * D3 is deliberately absent from `HEAVY`. Its chunks are genuinely small — the
 * d3-core split measures 49 KiB — so no floor can tell a D3 payload from a
 * component that merely imports a scale, and a rule that cannot fire without
 * false positives is worse than none. D3 growth is caught by the route budget
 * below instead. Rather than loosen this, add a signature only when it is
 * verified to match the implementation and nothing else.
 */
const HEAVY_FLOOR_KIB = 150;

if (!existsSync(MANIFEST)) {
	console.error(`[bundle-budget] No manifest at ${MANIFEST}. Run \`npm run build\` first.`);
	exit(1);
}

const manifest = JSON.parse(readFileSync(MANIFEST, 'utf8'));

const APP_ENTRY = '.svelte-kit/generated/client-optimized/app.js';
const KIT_ENTRY = 'node_modules/@sveltejs/kit/src/runtime/client/entry.js';

/** Walk only STATIC import edges — dynamic ones are the split working as designed. */
function staticGraph(...roots) {
	const seen = new Set();
	const visit = (key) => {
		if (seen.has(key) || !manifest[key]) return;
		seen.add(key);
		for (const next of manifest[key].imports ?? []) visit(next);
	};
	roots.forEach(visit);
	return seen;
}

const sizeOf = (file) => {
	const path = `${BUILD_DIR}/${file}`;
	return existsSync(path) ? statSync(path).size : 0;
};

const problems = [];

// --- 1. Shared entry budget ------------------------------------------------

const entryKeys = staticGraph(APP_ENTRY, KIT_ENTRY);
let entryBytes = 0;
for (const key of entryKeys) {
	const file = manifest[key]?.file;
	if (file?.endsWith('.js')) entryBytes += sizeOf(file);
}
const entryKiB = entryBytes / 1024;

console.log(
	`[bundle-budget] shared entry JS: ${entryKiB.toFixed(1)} KiB / ${ENTRY_BUDGET_KIB} KiB budget (${entryKeys.size} chunks)`
);
if (entryKiB > ENTRY_BUDGET_KIB) {
	problems.push(
		`Shared entry JS is ${entryKiB.toFixed(1)} KiB, over the ${ENTRY_BUDGET_KIB} KiB budget. Either something heavy became a static import, or the budget needs a deliberate, reviewed raise in scripts/check-bundle-budget.mjs.`
	);
}

// --- 2. Heavy libraries must never be statically reachable -----------------

/** Cache chunk contents: route graphs overlap heavily. */
const signatureCache = new Map();
function heavyLibsIn(file) {
	if (!signatureCache.has(file)) {
		const path = `${BUILD_DIR}/${file}`;
		const bytes = sizeOf(file);
		const libs =
			bytes / 1024 < HEAVY_FLOOR_KIB
				? [] // too small to be a library implementation — a mention at most
				: HEAVY.filter(({ re }) => re.test(readFileSync(path, 'utf8'))).map(({ name }) => name);
		signatureCache.set(file, libs);
	}
	return signatureCache.get(file);
}

/** Every route node, plus the app shell, is an entry point a visitor can land on. */
const routeKeys = Object.keys(manifest).filter((k) =>
	/^\.svelte-kit\/generated\/client-optimized\/nodes\/\d+\.js$/.test(k)
);

for (const root of [APP_ENTRY, KIT_ENTRY, ...routeKeys]) {
	for (const key of staticGraph(root)) {
		const file = manifest[key]?.file;
		if (!file?.endsWith('.js')) continue;
		for (const lib of heavyLibsIn(file)) {
			problems.push(
				`${lib} is statically reachable from ${manifest[root]?.name ?? root} via ${file}. It must be dynamically imported so only the pages that use it pay for it.`
			);
		}
	}
}

// --- 3. Per-route weight ---------------------------------------------------

let heaviestRoute = { name: null, kib: 0 };
for (const root of routeKeys) {
	let bytes = 0;
	for (const key of staticGraph(APP_ENTRY, KIT_ENTRY, root)) {
		const file = manifest[key]?.file;
		if (file?.endsWith('.js')) bytes += sizeOf(file);
	}
	const kib = bytes / 1024;
	if (kib > heaviestRoute.kib) heaviestRoute = { name: manifest[root]?.name ?? root, kib };
	if (kib > ROUTE_BUDGET_KIB) {
		problems.push(
			`Route ${manifest[root]?.name ?? root} statically loads ${kib.toFixed(1)} KiB, over the ${ROUTE_BUDGET_KIB} KiB budget.`
		);
	}
}

console.log(
	`[bundle-budget] heaviest route: ${heaviestRoute.name} at ${heaviestRoute.kib.toFixed(1)} KiB / ${ROUTE_BUDGET_KIB} KiB budget`
);

// --- Report ----------------------------------------------------------------

if (problems.length) {
	console.error('\n[bundle-budget] FAIL\n');
	// A single leak surfaces once per route that reaches it; report each once.
	for (const problem of [...new Set(problems)]) console.error(`  - ${problem}`);
	console.error('');
	exit(1);
}

console.log('[bundle-budget] OK — no heavy library is statically reachable.');
