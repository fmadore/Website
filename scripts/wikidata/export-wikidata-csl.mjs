import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { parseArgs } from 'node:util';
import { collectRecords } from '../lib/data-records.mjs';
import { exportCsl, exportCitingCsl } from './wikidata-csl.mjs';

const { values: options } = parseArgs({
	options: {
		out: { type: 'string' },
		citing: { type: 'boolean' },
		help: { type: 'boolean' }
	}
});
if (options.help) {
	console.log(
		'npm run wikidata:export -- [--citing] [--out path.json]\nPublished records and their reviews as CSL-JSON for the wikicite skill (reports/wikidata/works.csl.json); forthcoming records are left out.\nWith --citing, the works that cite them instead (reports/wikidata/citing.csl.json), one per work, each with custom.cites, the QIDs of the records it cites.'
	);
	process.exit(0);
}
const entries = await collectRecords('src/lib/data/publications/**/*.ts', 'wikidata');
const records = entries.map(({ record }) => record);
const out = resolve(
	options.out ??
		(options.citing ? 'reports/wikidata/citing.csl.json' : 'reports/wikidata/works.csl.json')
);
mkdirSync(dirname(out), { recursive: true });
if (options.citing) {
	const { items, excluded } = exportCitingCsl(records);
	writeFileSync(out, JSON.stringify(items, null, 2) + '\n');
	const recorded = items.filter((item) => item.custom.wikidata).length;
	console.log(`${items.length} citing works (${recorded} with a QID) → ${out}`);
	if (excluded.length) console.log(`Wiki articles, not exported: ${excluded.join(', ')}`);
} else {
	const { items, excluded } = exportCsl(records);
	writeFileSync(out, JSON.stringify(items, null, 2) + '\n');
	const reviews = items.filter((item) => item.type === 'review-book').length;
	console.log(`${items.length - reviews} publications and ${reviews} reviews → ${out}`);
	if (excluded.length) console.log(`Forthcoming, not exported: ${excluded.join(', ')}`);
}
