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
 * they format their display date with `#lib/utils/date-formatter.ts`, which
 * Node resolves itself, from the `imports` field of package.json. The resolve
 * hook below adds the one thing Vite would and Node will not: extensionless
 * `.ts` resolution for relative specifiers. Anything a data file imports must
 * itself be loadable this way, so no `$app/*` module.
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

registerHooks({
	resolve(specifier, context, nextResolve) {
		// Vite resolves `./date-formatter` to the .ts file; Node needs the
		// extension spelled out.
		if (specifier.startsWith('.') && !/\.[cm]?[jt]s$/.test(specifier)) {
			return nextResolve(`${specifier}.ts`, context);
		}
		return nextResolve(specifier, context);
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
		name !== 'order.ts' &&
		name !== 'cv.ts' &&
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
