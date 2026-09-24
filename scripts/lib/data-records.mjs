/**
 * Shared loader for the build-time generators that project the TypeScript
 * data files under src/lib/data/** into committed, slimmer modules
 * (the reference index and the publication, talk and activity summaries).
 *
 * It relies on Node's built-in TypeScript type stripping (enabled by default
 * since Node v22.18 / v23.6, so in every supported Node line today), which
 * works because every data file is erasable-syntax-only, letting plain
 * `import()` load each one directly — no Vite, no bundler.
 *
 * Publication and talk records import types alone. Activity records do not:
 * they format their display date with `$lib/utils/date-formatter`, and one
 * links a talk through `$app/paths`. So the resolve hook below gives Node the
 * two things Vite would: the `$lib` alias with extensionless `.ts` resolution,
 * and a `$app/paths` carrying the site's (empty) base path. Anything a data
 * file imports must itself be loadable this way — alias-free past `$lib`.
 */
import { registerHooks } from 'node:module';
import { globSync } from 'node:fs';
import { basename, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

import {
	PUBLICATION_TEMPLATE_IDS,
	COMMUNICATION_TEMPLATE_IDS
} from '../../src/lib/dataMetadata.ts';
import { selectDataRecord } from '../../src/lib/dataRecords.ts';
const LIB_URL = pathToFileURL(resolve('src/lib') + '/').href;

/** `svelte.config.js` sets `paths.base` to '' and records only ever read `base`. */
const APP_PATHS_STUB = `data:text/javascript,${encodeURIComponent("export const base = ''; export const assets = '';")}`;

registerHooks({
	resolve(specifier, context, nextResolve) {
		if (specifier === '$app/paths') return { url: APP_PATHS_STUB, shortCircuit: true };
		const target = specifier.startsWith('$lib/')
			? new URL(specifier.slice('$lib/'.length), LIB_URL).href
			: specifier;
		// Vite resolves `$lib/utils/date-formatter` to the .ts file; Node needs the
		// extension spelled out, for aliased and relative specifiers alike.
		const local = target.startsWith('file:') || target.startsWith('.');
		if (local && !/\.[cm]?[jt]s$/.test(target)) {
			return nextResolve(`${target}.ts`, context);
		}
		return nextResolve(target, context);
	}
});

export const TEMPLATE_IDS = new Set([...PUBLICATION_TEMPLATE_IDS, ...COMMUNICATION_TEMPLATE_IDS]);

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
export function pickRecord(mod, source = 'data module') {
	return selectDataRecord(mod, source);
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
		const record = pickRecord(mod, file);
		if (TEMPLATE_IDS.has(record.id)) continue;
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
