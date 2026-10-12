/**
 * The citation graph on Wikidata, against the `citedBy` lists.
 *
 * Wikidata records a citation as `cites work` (P2860) on the citing work's
 * item, and the site records that item's QID on the `citedBy` entry
 * (`wikidataId`, written by `wikidata:apply`). The two then check each other:
 *
 *   - a citation on Wikidata that the cited work's `citedBy` does not record
 *     is news for the site, found by whoever added it (a WikiCite bot, a
 *     reader, an earlier run), including citations no index or full-text
 *     search reaches;
 *   - an entry that records a QID whose item does not cite the work is a link
 *     Wikidata lacks, to add with the wikicite skill;
 *   - an entry with no QID yet is coverage still to do. Counted, not listed.
 *
 * A citing item that is one of the site's own records (a self-citation) or a
 * review it lists (`reviewedBy`) is not news. Pure: the queries run in
 * `check-citations.mjs`.
 */
import { isForthcoming } from '../../src/lib/utils/date-formatter.ts';

/** The SPARQL endpoints: since the 2025 graph split, scholarly works live on their own. */
export const ENDPOINTS = [
	'https://query.wikidata.org/sparql',
	'https://query-scholarly.wikidata.org/sparql'
];

/** Every item citing one of `qids`, with a title and date to report it by. */
export function citationQuery(qids) {
	const values = qids.map((q) => `wd:${q}`).join(' ');
	return `SELECT ?citing ?cited (SAMPLE(?t) AS ?title) (MIN(?d) AS ?date) WHERE {
  VALUES ?cited { ${values} }
  ?citing wdt:P2860 ?cited .
  OPTIONAL { ?citing wdt:P1476 ?t }
  OPTIONAL { ?citing wdt:P577 ?d }
} GROUP BY ?citing ?cited`;
}

const ENTITY = 'http://www.wikidata.org/entity/';

/** SPARQL JSON bindings → `{ citing, cited, title, year }` rows. */
export function citationRows(bindings) {
	return bindings.map((b) => ({
		citing: b.citing.value.replace(ENTITY, ''),
		cited: b.cited.value.replace(ENTITY, ''),
		title: b.title?.value ?? null,
		year: b.date?.value ? Number(b.date.value.slice(0, 4)) || null : null
	}));
}

/**
 * Compare Wikidata's citations of the site's records with their `citedBy`
 * lists. `records` are the publication records; `rows` the citation rows of
 * both graphs (duplicates are harmless); `acknowledged` the dismissed keys
 * (`wikidata:Q…`).
 */
export function compareWikidataCitations(records, rows, acknowledged = new Set()) {
	const published = records.filter((p) => p.wikidataId && !isForthcoming(p));
	const recordOf = new Map(published.map((p) => [p.wikidataId, p]));
	const own = new Set(records.map((p) => p.wikidataId).filter(Boolean));
	const reviews = new Set(
		records.flatMap((p) => (p.reviewedBy ?? []).map((r) => r.wikidataId)).filter(Boolean)
	);
	// By pair, not by citing item: a work recorded as citing one record may cite
	// others the site has not recorded yet.
	const recorded = new Set(
		published.flatMap((p) =>
			(p.citedBy ?? []).filter((c) => c.wikidataId).map((c) => `${c.wikidataId}>${p.wikidataId}`)
		)
	);
	const pairs = new Set(rows.map((r) => `${r.citing}>${r.cited}`));

	const unknown = new Map();
	for (const row of rows) {
		const record = recordOf.get(row.cited);
		if (
			!record ||
			own.has(row.citing) ||
			reviews.has(row.citing) ||
			recorded.has(`${row.citing}>${row.cited}`)
		)
			continue;
		if (acknowledged.has(`wikidata:${row.citing}`)) continue;
		const entry = unknown.get(row.citing) ?? {
			qid: row.citing,
			key: `wikidata:${row.citing}`,
			title: row.title,
			year: row.year,
			cites: []
		};
		if (!entry.cites.includes(record)) entry.cites.push(record);
		unknown.set(row.citing, entry);
	}

	const unlinked = [];
	let withoutQid = 0;
	let entries = 0;
	for (const record of published)
		for (const citing of record.citedBy ?? []) {
			entries++;
			if (!citing.wikidataId) withoutQid++;
			else if (!pairs.has(`${citing.wikidataId}>${record.wikidataId}`))
				unlinked.push({ record, citing });
		}

	// A dismissal that no longer matches anything reads as coverage while hiding nothing.
	const citingQids = new Set(rows.map((r) => r.citing));
	const staleAcks = [...acknowledged].filter(
		(key) => key.startsWith('wikidata:') && !citingQids.has(key.slice('wikidata:'.length))
	);

	const byYear = (a, b) => (b.year ?? 0) - (a.year ?? 0);
	return { unknown: [...unknown.values()].sort(byYear), unlinked, withoutQid, entries, staleAcks };
}
