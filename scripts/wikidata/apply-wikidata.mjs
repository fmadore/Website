import { readFileSync, writeFileSync } from 'node:fs';
import { parseArgs } from 'node:util';
import { collectRecords } from '../lib/data-records.mjs';
import { client, entities, values, doi } from './wikidata.mjs';
import {
	readJson,
	validateReport,
	validateDecisions,
	planEdits,
	reviewIds
} from './wikidata-workflow.mjs';

const { values: options } = parseArgs({
	options: {
		audit: { type: 'string', default: 'reports/wikidata/audit.json' },
		decisions: { type: 'string' },
		'accept-exact': { type: 'boolean' },
		write: { type: 'boolean' },
		help: { type: 'boolean' }
	}
});
if (options.help) {
	console.log(
		'npm run wikidata:apply -- [--audit path.json] [--decisions decisions.json] [--accept-exact] [--write]\nDry-run by default; verifies selected entities live. Never overwrites an existing QID.'
	);
	process.exit(0);
}
const entries = await collectRecords('src/lib/data/publications/**/*.ts', 'wikidata');
const rows = validateReport(readJson(options.audit), entries);
// A wikicite decisions file keys its work decisions under `works`.
const raw = options.decisions ? readJson(options.decisions) : {};
const decisions = raw.works ?? raw;
validateDecisions(decisions, rows, reviewIds(entries));
const edits = planEdits(entries, rows, decisions, options['accept-exact']);
const live = await entities(
	edits.map((edit) => edit.qid),
	client()
);
for (const edit of edits) {
	const entity = live.get(edit.qid);
	if (entity.id !== edit.qid)
		throw new Error(`Redirected QID ${edit.qid}; reconcile canonical item ${entity.id}`);
	const identifiers = values(entity, 'P356');
	if (edit.doi && identifiers.length && !identifiers.some((value) => doi(value) === doi(edit.doi)))
		throw new Error(`Conflicting DOI on ${edit.qid}`);
	console.log(`${options.write ? 'WRITE' : 'DRY RUN'} ${edit.id}: ${edit.qid}`);
}
// Validate the entire plan before any source is changed.
for (const edit of edits) {
	if (readFileSync(edit.file, 'utf8') !== edit.source)
		throw new Error(`Source changed during live verification: ${edit.id}`);
}
for (const edit of edits) if (options.write) writeFileSync(edit.file, edit.updated);
console.log(
	`${edits.length} publication(s) or review(s) ${options.write ? 'updated. Run npm run gen:summaries.' : 'would change. Add --write to save.'}`
);
