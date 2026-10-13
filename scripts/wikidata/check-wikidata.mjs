import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { parseArgs } from 'node:util';
import { collectRecords } from '../lib/data-records.mjs';
import {
	API,
	ENDPOINTS,
	AUTHOR_QID,
	client,
	lookupQuery,
	entities,
	candidate,
	classify,
	isForthcoming,
	hash,
	qid
} from './wikidata.mjs';
import { bestTitleMatch, searchTitleCandidates } from './wikidata-titles.mjs';
import { containerDois } from './wikidata-csl.mjs';

const { values: options } = parseArgs({
	options: {
		out: { type: 'string', default: 'reports/wikidata/audit.json' },
		id: { type: 'string' },
		help: { type: 'boolean' }
	}
});
if (options.help) {
	console.log(
		'npm run wikidata:audit -- [--out reports/wikidata/audit.json] [--id publication-id]\nRead-only DOI/ISBN, author corpus and English/French/German title search across both graphs.'
	);
	process.exit(0);
}
const request = client();
const all = await collectRecords('src/lib/data/publications/**/*.ts', 'wikidata');
const selected = all.filter(({ record }) => !options.id || record.id === options.id);
if (!selected.length) throw new Error('No publications selected');
const excluded = selected
	.filter(({ record }) => isForthcoming(record))
	.map(({ record }) => ({ id: record.id, title: record.title, reason: 'forthcoming' }));
const entries = selected.filter(({ record }) => !isForthcoming(record));
console.log(`Eligible: ${entries.length}; excluded forthcoming: ${excluded.length}`);
// Over the whole corpus, so `--id` audits one record exactly as a full run would.
const shared = containerDois(
	all.map(({ record }) => record).filter((record) => !isForthcoming(record))
);
const hits = new Map(entries.map(({ record }) => [record.id, new Map()]));
const errors = [];
function add(id, item, reason) {
	qid(item);
	const matches = hits.get(id);
	matches.set(item, [...(matches.get(item) ?? []), reason]);
}
async function sparql(endpoint, query) {
	const data = await request(endpoint, { query, format: 'json' });
	if (!Array.isArray(data.results?.bindings)) throw new Error('Malformed SPARQL response');
	return data.results.bindings;
}
const authorIds = new Set();
for (const endpoint of entries.length ? ENDPOINTS : []) {
	try {
		for (let i = 0; i < entries.length; i += 10) {
			const query = lookupQuery(
				entries.slice(i, i + 10).map(({ record }) => record),
				shared
			);
			if (!query) continue;
			for (const row of await sparql(endpoint, query))
				add(row.id.value, row.item.value.split('/').pop(), row.reason.value);
		}
		const query = `SELECT DISTINCT ?item WHERE {
{ ?item <http://www.wikidata.org/prop/direct/P50> <http://www.wikidata.org/entity/${AUTHOR_QID}> }
UNION { ?item <http://www.wikidata.org/prop/direct/P98> <http://www.wikidata.org/entity/${AUTHOR_QID}> }
UNION { ?item <http://www.wikidata.org/prop/direct/P2093> "Frédérick Madore" }
}`;
		for (const row of await sparql(endpoint, query))
			authorIds.add(qid(row.item.value.split('/').pop()));
	} catch (error) {
		errors.push(`${endpoint}: ${error.message}`);
	}
}
try {
	const corpus = await entities([...authorIds], request);
	for (const { record } of entries) {
		for (const entity of corpus.values()) {
			const c = candidate(entity, []);
			const match = bestTitleMatch(record.title, c);
			if (match.score >= 0.86)
				add(
					record.id,
					entity.id,
					match.method === 'normalized-exact' ? 'author-title' : 'author-title-fuzzy'
				);
		}
	}
} catch (error) {
	errors.push(`Author corpus: ${error.message}`);
}

const searchCache = new Map();
const searchEvidence = new Map();
for (const { record } of entries) {
	if (record.wikidataId) add(record.id, record.wikidataId, 'recorded');
	// Search even exact matches: surface alternative editions and duplicate records.
	try {
		const matches = await searchTitleCandidates(record.title, request, API, searchCache);
		searchEvidence.set(record.id, matches);
		for (const [id, evidence] of matches)
			for (const { language } of evidence) add(record.id, id, `search-${language}`);
	} catch (error) {
		errors.push(`${record.id}: ${error.message}`);
	}
	console.log(`Searched ${record.id}: ${hits.get(record.id).size} candidate(s)`);
}
let allEntities = new Map();
try {
	allEntities = await entities(
		[...hits.values()].flatMap((items) => [...items.keys()]),
		request
	);
} catch (error) {
	errors.push(`Candidate metadata: ${error.message}`);
}
const rows = entries.map(({ file, record }) => {
	const candidates = [...hits.get(record.id)]
		.filter(([id]) => allEntities.has(id))
		.map(([id, reasons]) => {
			const c = candidate(allEntities.get(id), reasons);
			return {
				...c,
				titleMatch: bestTitleMatch(record.title, c),
				searches: searchEvidence.get(record.id)?.get(id) ?? []
			};
		})
		.sort((a, b) => b.titleMatch.score - a.titleMatch.score || a.qid.localeCompare(b.qid));
	return {
		id: record.id,
		title: record.title,
		type: record.type,
		year: record.year,
		doi: record.doi ?? null,
		isbn: record.isbn ?? null,
		sourceHash: hash(readFileSync(file, 'utf8')),
		...(errors.length
			? { status: 'unavailable', suggestedQid: null }
			: classify(record, candidates)),
		candidates
	};
});
const report = {
	version: 1,
	generatedAt: new Date().toISOString(),
	complete: errors.length === 0,
	endpoints: ENDPOINTS,
	errors,
	publications: rows,
	excluded
};
const out = resolve(options.out);
if (!out.endsWith('.json')) throw new Error('--out must end in .json');
mkdirSync(dirname(out), { recursive: true });
writeFileSync(out, JSON.stringify(report, null, 2) + '\n');
const cell = (text) =>
	String(text ?? '')
		.replace(/[\\|]/g, '\\$&')
		.replace(/[\r\n]/g, ' ');
const markdown = [
	'# Publication reconciliation with Wikidata',
	'',
	`Generated: ${report.generatedAt}. Complete: ${report.complete}.`,
	'No search result is proof of absence. Review titles, dates, authors, containers and book editions before creating an item.',
	'',
	'| Publication | Result | Suggested QID | Candidates |',
	'| --- | --- | --- | --- |',
	...rows.map(
		(row) =>
			`| ${cell(row.title)} (${row.year}) | ${row.status} | ${row.suggestedQid ?? ''} | ${row.candidates.map((c) => `[${c.qid}](https://www.wikidata.org/wiki/${c.qid}) (${c.reasons.join(', ')}; title ${c.titleMatch.score}, ${c.titleMatch.method})`).join('; ')} |`
	),
	'',
	'## Lookup errors',
	'',
	...errors.map((error) => `- ${cell(error)}`),
	'',
	'## Excluded forthcoming publications',
	'',
	...excluded.map((p) => `- ${cell(p.title)} (${p.id})`),
	''
];
writeFileSync(out.replace(/\.json$/, '.md'), markdown.join('\n'));
console.log(
	`Report: ${out}\n${JSON.stringify(rows.reduce((counts, row) => ({ ...counts, [row.status]: (counts[row.status] ?? 0) + 1 }), {}))}`
);
if (errors.length) {
	console.error('Incomplete audit; resolve lookup errors before applying or creating.');
	process.exitCode = 1;
}
