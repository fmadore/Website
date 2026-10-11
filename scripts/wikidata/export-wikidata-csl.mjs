import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { parseArgs } from 'node:util';
import { collectRecords } from '../lib/data-records.mjs';
import { exportCsl } from './wikidata-csl.mjs';

const { values: options } = parseArgs({
	options: {
		out: { type: 'string', default: 'reports/wikidata/works.csl.json' },
		help: { type: 'boolean' }
	}
});
if (options.help) {
	console.log(
		'npm run wikidata:export -- [--out reports/wikidata/works.csl.json]\nPublished records as CSL-JSON for the wikicite skill. Forthcoming records are left out.'
	);
	process.exit(0);
}
const entries = await collectRecords('src/lib/data/publications/**/*.ts', 'wikidata');
const { items, excluded } = exportCsl(entries.map(({ record }) => record));
const out = resolve(options.out);
mkdirSync(dirname(out), { recursive: true });
writeFileSync(out, JSON.stringify(items, null, 2) + '\n');
const reviews = items.filter((item) => item.type === 'review-book').length;
console.log(`${items.length - reviews} publications and ${reviews} reviews → ${out}`);
if (excluded.length) console.log(`Forthcoming, not exported: ${excluded.join(', ')}`);
