/**
 * Build-time generator for the slim reference index consumed by
 * `<ItemReference>` (src/lib/components/reference/ItemReference.svelte).
 *
 * Why: ItemReference used to import the full `allPublications` +
 * `allCommunications` datasets (~117 KiB on the wire) purely to resolve a
 * handful of inline citations and their hover previews. That dominated home-page
 * LCP/TBT. This script projects each publication/communication record down to
 * the few fields the link + preview actually render, and emits a static literal
 * module — so reference-using pages no longer bundle the heavy datasets.
 *
 * How: this script relies on Node's built-in TypeScript type stripping
 * (enabled by default since Node v22.18 / v23.6, so in every supported Node
 * line today). That works here only because every data item file is
 * erasable-syntax-only and uses `import type` exclusively (verified — no
 * runtime imports, so `$lib`/`$app` aliases never need resolving), letting
 * plain `import()` load each one directly — no Vite, no bundler. Run
 * automatically via the npm `prebuild` hook, or manually with
 * `npm run gen:refs`. Output is deterministic (sorted keys) to avoid churn.
 *
 * Modes:
 *   node scripts/generate-reference-index.mjs          # (re)write the index
 *   node scripts/generate-reference-index.mjs --check  # CI freshness check:
 *       regenerate in memory and exit 1 if the committed file is stale.
 */
import { globSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve, basename } from 'node:path';
import { pathToFileURL } from 'node:url';

const OUT_FILE = 'src/lib/data/referenceIndex.generated.ts';
const CHECK_MODE = process.argv.includes('--check');

/**
 * Template ids excluded from the index.
 *
 * !! KEEP IN SYNC — this list DUPLICATES the canonical runtime `templateIds`
 * arrays in:
 *   - src/lib/data/publications/index.ts
 *   - src/lib/data/communications/index.ts
 * Those index files can't be imported here (they use Vite's import.meta.glob),
 * so the ids are mirrored as a constant. If you add a template file with a new
 * id, add it to BOTH places. The filename/id `includes('template')` heuristics
 * below remain as a second line of defence, mirroring the runtime's own
 * two-layer filtering (glob negation + explicit id list).
 */
const TEMPLATE_IDS = new Set([
	// src/lib/data/publications/index.ts → templateIds
	'book-template-id',
	'edited-volume-template-id',
	'article-template-id',
	'bulletin-article-template-id',
	'chapter-template-id',
	'special-issue-template-id',
	'report-template-id',
	'encyclopedia-template-id',
	'blogpost-template-id',
	'phd-dissertation-template-id',
	'conference-proceedings-template-id',
	// src/lib/data/communications/index.ts → templateIds
	'paper-template-id',
	'panel-template-id',
	'talk-template-id',
	'event-template-id',
	'podcast-template-id'
]);

/** Files that are not data items (aggregators, filter stores, templates). */
function isDataItem(file) {
	const name = basename(file);
	return (
		name !== 'index.ts' &&
		!name.endsWith('.svelte.ts') &&
		!name.includes('template') &&
		name.endsWith('.ts')
	);
}

/** Pick the exported data object (the one export shaped like a record). */
function pickRecord(mod) {
	return Object.values(mod).find((v) => v && typeof v === 'object' && typeof v.id === 'string');
}

/** Project a full record down to the slim, render-only fields. */
function slim(obj, itemType) {
	const e = { id: obj.id, itemType, title: obj.title, authors: obj.authors ?? [] };
	if (obj.type) e.type = obj.type;
	if (obj.date) e.date = obj.date;
	if (obj.dateISO) e.dateISO = obj.dateISO;
	if (typeof obj.year === 'number') e.year = obj.year;
	if (obj.image) e.image = obj.image;
	if (obj.heroImage?.src) e.heroImage = { src: obj.heroImage.src };
	// Type-specific meta-line fields only (matches ReferencePreviewCard's
	// per-type rendering). Keeps the index minimal and the types precise — e.g.
	// publication `country` is string[] and never rendered, so it's omitted.
	if (itemType === 'publication') {
		if (obj.journal) e.journal = obj.journal;
		if (obj.book) e.book = obj.book;
		if (obj.publisher) e.publisher = obj.publisher;
	} else {
		if (obj.conference) e.conference = obj.conference;
		if (obj.location) e.location = obj.location;
		if (obj.country) e.country = obj.country;
		if (obj.episode !== undefined && obj.episode !== null) e.episode = obj.episode;
	}
	return e;
}

async function collect(globPattern, itemType) {
	const files = globSync(globPattern).filter(isDataItem);
	const entries = [];
	const seen = new Map(); // id → first file it came from
	const duplicates = [];
	for (const file of files) {
		const mod = await import(pathToFileURL(resolve(file)).href);
		const record = pickRecord(mod);
		if (!record || TEMPLATE_IDS.has(record.id) || record.id.includes('template')) continue;
		if (seen.has(record.id)) {
			duplicates.push(`"${record.id}" (${seen.get(record.id)} and ${file})`);
			continue;
		}
		seen.set(record.id, file);
		entries.push(slim(record, itemType));
	}
	if (duplicates.length) {
		console.error(
			`[gen:refs] ERROR: duplicate id(s) within the ${itemType} dataset:\n` +
				duplicates.map((d) => `  - ${d}`).join('\n') +
				'\nEach data file must export a unique id. Aborting.'
		);
		process.exit(1);
	}
	return entries;
}

// Publications first: they win on id conflicts, mirroring ItemReference's
// lookup order (it checks allPublications before allCommunications).
const pubEntries = await collect('src/lib/data/publications/**/*.ts', 'publication');
const commEntries = await collect('src/lib/data/communications/**/*.ts', 'communication');

const merged = {};
const conflicts = [];
for (const entry of [...pubEntries, ...commEntries]) {
	if (merged[entry.id]) {
		conflicts.push(entry.id);
		continue;
	}
	merged[entry.id] = entry;
}

// Deterministic key order to keep diffs minimal.
const index = {};
for (const id of Object.keys(merged).sort((a, b) => a.localeCompare(b))) {
	index[id] = merged[id];
}

if (conflicts.length) {
	console.warn(
		'\n' +
			'='.repeat(72) +
			`\n[gen:refs] WARNING: ${conflicts.length} id(s) exist in BOTH datasets; kept the\n` +
			`[gen:refs] publication (mirrors ItemReference lookup order):\n` +
			conflicts.map((id) => `[gen:refs]   - ${id}`).join('\n') +
			'\n' +
			'='.repeat(72) +
			'\n'
	);
}

const banner = `// AUTO-GENERATED by scripts/generate-reference-index.mjs — DO NOT EDIT.
// Regenerate with \`npm run gen:refs\` (runs automatically via the prebuild hook).
/* eslint-disable */
import type { ReferenceIndexEntry } from '$lib/types/referenceIndex';

export const referenceIndex: Record<string, ReferenceIndexEntry> = `;

const output = banner + JSON.stringify(index, null, '\t') + ';\n';

if (CHECK_MODE) {
	let committed = null;
	try {
		committed = readFileSync(OUT_FILE, 'utf8');
	} catch {
		// Missing file counts as stale.
	}
	if (committed !== output) {
		console.error(
			`[gen:refs] ERROR: ${OUT_FILE} is stale (or missing). ` +
				'Run `npm run gen:refs` and commit the result.'
		);
		process.exit(1);
	}
	console.log(
		`[gen:refs] --check OK: ${OUT_FILE} is up to date (${Object.keys(index).length} entries).`
	);
} else {
	writeFileSync(OUT_FILE, output, 'utf8');
	console.log(`[gen:refs] Wrote ${Object.keys(index).length} entries → ${OUT_FILE}`);
}
