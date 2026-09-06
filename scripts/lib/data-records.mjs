/**
 * Shared loader for the build-time generators that project the TypeScript
 * data files under src/lib/data/** into committed, slimmer modules
 * (generate-reference-index.mjs, generate-publication-summaries.mjs).
 *
 * It relies on Node's built-in TypeScript type stripping (enabled by default
 * since Node v22.18 / v23.6, so in every supported Node line today). That
 * works here only because every data item file is erasable-syntax-only and
 * uses `import type` exclusively (verified — no runtime imports, so `$lib` /
 * `$app` aliases never need resolving), letting plain `import()` load each one
 * directly — no Vite, no bundler.
 */
import { globSync } from 'node:fs';
import { basename, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

/**
 * Template ids excluded from every projection.
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
export const TEMPLATE_IDS = new Set([
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
	'working-paper-template-id',
	// src/lib/data/communications/index.ts → templateIds
	'paper-template-id',
	'panel-template-id',
	'talk-template-id',
	'event-template-id',
	'podcast-template-id'
]);

/** Files that are not data items (aggregators, filter stores, templates). */
export function isDataItem(file) {
	const name = basename(file);
	return (
		name !== 'index.ts' &&
		name !== 'summaries.ts' &&
		name !== 'summaryConfig.ts' &&
		!name.endsWith('.generated.ts') &&
		!name.endsWith('.svelte.ts') &&
		!name.endsWith('.test.ts') &&
		!name.includes('template') &&
		name.endsWith('.ts')
	);
}

/** Pick the exported data object (the one export shaped like a record). */
export function pickRecord(mod) {
	return Object.values(mod).find((v) => v && typeof v === 'object' && typeof v.id === 'string');
}

/**
 * Load every data record matched by `globPattern`, skipping templates and
 * aborting on duplicate ids (each data file must export a unique id).
 * Returns `{ file, record }` pairs in glob order; `label` prefixes any error.
 */
export async function collectRecords(globPattern, label) {
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
		entries.push({ file, record });
	}
	if (duplicates.length) {
		console.error(
			`[${label}] ERROR: duplicate id(s) within the dataset:\n` +
				duplicates.map((d) => `  - ${d}`).join('\n') +
				'\nEach data file must export a unique id. Aborting.'
		);
		process.exit(1);
	}
	return entries;
}
