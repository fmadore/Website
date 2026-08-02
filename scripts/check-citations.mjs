/**
 * Citation and publication watcher.
 *
 * Answers two questions the site cannot answer about itself:
 *   1. Has anyone new cited this work since the `citedBy` lists were last
 *      updated?
 *   2. Is there a published work under this ORCID that never made it into
 *      `src/lib/data/publications/`?
 *
 * Why not Google Scholar. Scholar has no public API, actively serves CAPTCHAs
 * to datacentre IPs (which is all a GitHub Actions runner ever is), and
 * forbids scraping in its terms. A watcher built on it would be red for
 * reasons nobody can fix. OpenAlex is free, keyless, addressable by ORCID, and
 * returns the citing works themselves rather than a bare count — which is what
 * makes the output actionable. Its coverage of citations is smaller than
 * Scholar's, so treat the numbers here as a floor, not a census.
 *
 * State lives in the repository, not in a cache file: "new" means *present in
 * OpenAlex and absent from the committed `citedBy` array*, compared on DOI
 * first and title only as a fallback. Add a citation to the data file and it
 * stops being reported, with nothing to reset. That keeps the issue a live
 * to-do list instead of a notification feed.
 *
 * Deciding which OpenAlex records are separate citations at all is the
 * fiddly half of this, and lives in `citation-grouping.mjs`: one book arrives
 * as a volume record, a dozen chapters and an index, and reporting all of them
 * would bury the handful of entries that are really news.
 *
 * The report emits ready-to-paste `CitingWork` literals so acting on it is a
 * copy, not a retyping. It deliberately never edits data files itself —
 * matching a citation to the right publication is a judgement call, and the
 * author is the one qualified to make it.
 *
 * Usage:
 *   node scripts/check-citations.mjs                  # print a summary
 *   node scripts/check-citations.mjs --report out.md  # also write markdown
 *
 * Exit code is 0 unless the APIs were unreachable — "you have new citations"
 * is news, not a build failure.
 */
import { globSync, writeFileSync } from 'node:fs';
import { resolve, basename } from 'node:path';
import { pathToFileURL } from 'node:url';
import { argv, exit } from 'node:process';
import { normDoi, normTitle, selectFreshCitations } from './citation-grouping.mjs';

const ORCID = '0000-0003-0959-2092';
const CONTACT = 'frederick_madore@outlook.com'; // OpenAlex "polite pool" identifier
const API = 'https://api.openalex.org';
const REQUEST_TIMEOUT_MS = 30_000;

const reportPath = argv.find((a) => a.startsWith('--report='))?.slice('--report='.length) ?? null;

// ---------------------------------------------------------------------------
// Local publication data
// ---------------------------------------------------------------------------

/**
 * Loaded the same way `generate-reference-index.mjs` does it: Node's built-in
 * TypeScript type stripping lets each data file be `import()`ed directly, with
 * no Vite and no bundler. Works only because every data file is
 * erasable-syntax-only and imports types with `import type`.
 */
function isDataItem(file) {
	const name = basename(file);
	return (
		name !== 'index.ts' &&
		!name.endsWith('.svelte.ts') &&
		!name.includes('template') &&
		name.endsWith('.ts')
	);
}

const pickRecord = (mod) =>
	Object.values(mod).find((v) => v && typeof v === 'object' && typeof v.id === 'string');

const publications = [];
for (const file of globSync('src/lib/data/publications/**/*.ts').filter(isDataItem)) {
	const record = pickRecord(await import(pathToFileURL(resolve(file)).href));
	if (record && !record.id.includes('template')) publications.push({ file, record });
}

if (publications.length === 0) {
	console.error('[check-citations] Loaded no publications — glob or loader regression. Aborting.');
	exit(1);
}

// ---------------------------------------------------------------------------
// Matching helpers
// ---------------------------------------------------------------------------

/** The named entities publisher markup actually uses. */
const ENTITIES = new Map([
	['amp', '&'],
	['lt', '<'],
	['gt', '>'],
	['quot', '"'],
	['apos', "'"],
	['nbsp', ' ']
]);

/** A code point a title can contain: in range, not a control, not a surrogate half. */
const isTextCodePoint = (n) =>
	Number.isInteger(n) && n >= 0x20 && n <= 0x10ffff && !(n >= 0xd800 && n <= 0xdfff);

/**
 * Decode HTML entities in a single pass over the string.
 *
 * A chain of `.replace()` calls cannot do this safely: expanding `&amp;` before
 * `&lt;` walks `&amp;lt;` — which encodes the literal text "&lt;" — all the way
 * down to `<`, inventing markup the source never contained. One pass with a
 * lookup decodes each entity exactly once and never re-reads its own output.
 */
function decodeEntities(s) {
	return s.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (match, body) => {
		if (body[0] === '#') {
			const hex = body[1] === 'x' || body[1] === 'X';
			const code = Number.parseInt(hex ? body.slice(2) : body.slice(1), hex ? 16 : 10);
			return isTextCodePoint(code) ? String.fromCodePoint(code) : match;
		}
		return ENTITIES.get(body.toLowerCase()) ?? match;
	});
}

/**
 * Remove tags until the string stops changing. One pass is not enough:
 * deleting the inner tag of `<scr<b>ipt>` splices the outer one back together,
 * so a single sweep can *produce* the markup it was meant to remove.
 */
function stripTags(s) {
	let out = s;
	let previous;
	let passes = 0;
	do {
		previous = out;
		out = out.replace(/<[^>]*>/g, '');
	} while (out !== previous && ++passes < 100);
	return out;
}

/**
 * OpenAlex titles carry publisher markup (`<i>ʿawra</i>`, `<sub>`, entities).
 * Strip it so a pasted `CitingWork` is plain text like every hand-written one.
 *
 * Stripping before decoding is deliberate: an escaped `&lt;i&gt;` was filed as
 * visible text, and decoding first would promote it to a tag that the stripper
 * then eats.
 */
const cleanTitle = (s) =>
	decodeEntities(stripTags(s ?? ''))
		.replace(/\s+/g, ' ')
		.trim();

/** Front and back matter carry DOIs but are not citations worth recording. */
const MATTER = new Set([
	'preface',
	'foreword',
	'introduction',
	'conclusion',
	'index',
	'contents',
	'bibliography',
	'references',
	'notes',
	'acknowledgements',
	'acknowledgments',
	'frontmatter',
	'backmatter',
	'front matter',
	'back matter',
	'copyright page',
	'title pages',
	'appendix',
	'glossary',
	'about the author',
	'list of illustrations',
	'list of abbreviations'
]);

/**
 * Citing works that are indexed correctly but should not be reported, by DOI.
 *
 * The bar for adding a line here is high, and deliberately so: a hand-kept
 * list only suppresses the instance in front of you, while a rule in
 * `citation-grouping.mjs` suppresses the next one too. Duplicate volume
 * records and chapters filed with the whole book's bibliography look like
 * candidates for this list and are not — they are patterns, and they are
 * handled there. What belongs here is what no rule could infer: facts about
 * the world rather than about the metadata.
 */
const EXCLUDED_CITATIONS = new Map([
	['10.2139/ssrn.4738316', 'withdrawn from SSRN at the request of the author or rights holder']
]);

/**
 * OpenAlex sometimes records the publisher as an authorship (e.g. "Walter de
 * Gruyter GmbH & Co. KG" on an edited volume). Those are not people.
 */
const CORPORATE =
	/\b(gmbh|ltd|llc|inc|s\.a\.|co\.? kg|university press|press|publishers?|publishing|editions?|verlag|éditions)\b/i;

/** Every DOI the local dataset knows about, however it is spelled. */
function localDois(record) {
	const out = new Set();
	if (record.doi) out.add(normDoi(record.doi));
	if (record.url) {
		const d = normDoi(record.url);
		if (d.startsWith('10.')) out.add(d);
	}
	return out;
}

// ---------------------------------------------------------------------------
// OpenAlex
// ---------------------------------------------------------------------------

async function openAlex(path) {
	const sep = path.includes('?') ? '&' : '?';
	const url = `${API}${path}${sep}mailto=${encodeURIComponent(CONTACT)}`;
	const res = await fetch(url, {
		headers: { 'user-agent': `frederickmadore.com citation watcher (mailto:${CONTACT})` },
		signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS)
	});
	if (!res.ok) throw new Error(`OpenAlex ${res.status} for ${path}`);
	return res.json();
}

/** Page through a filtered work list (200 per page is the API maximum). */
async function allWorks(filter, select) {
	const results = [];
	let cursor = '*';
	while (cursor) {
		const page = await openAlex(
			`/works?filter=${filter}&select=${select}&per-page=200&cursor=${encodeURIComponent(cursor)}`
		);
		results.push(...page.results);
		cursor = page.meta?.next_cursor ?? null;
		if (page.results.length === 0) break;
	}
	return results;
}

let ownWorks;
try {
	ownWorks = await allWorks(
		`author.orcid:${ORCID}`,
		'id,doi,title,publication_year,cited_by_count,type'
	);
} catch (err) {
	console.error(`[check-citations] OpenAlex unreachable: ${err.message}`);
	exit(1);
}

console.log(
	`[check-citations] ${publications.length} local publications, ${ownWorks.length} OpenAlex works under ORCID ${ORCID}`
);

// ---------------------------------------------------------------------------
// Pass 1 — new citations
// ---------------------------------------------------------------------------

/** OpenAlex ids are URLs; the bare id is the last segment. */
const workId = (work) =>
	String(work?.id ?? '')
		.split('/')
		.pop();

/** Link each OpenAlex work to a local publication: DOI first, then title. */
function matchLocal(work) {
	const doi = normDoi(work.doi);
	if (doi) {
		const byDoi = publications.find(({ record }) => localDois(record).has(doi));
		if (byDoi) return byDoi;
	}
	const title = normTitle(work.title);
	if (!title) return null;
	return publications.find(({ record }) => normTitle(record.title) === title) ?? null;
}

const newCitations = []; // { publication, citing[] }
const excluded = new Set(); // EXCLUDED_CITATIONS entries that actually fired
const cited = ownWorks
	.filter((w) => w.cited_by_count > 0)
	.sort((a, b) => b.cited_by_count - a.cited_by_count);

for (const work of cited) {
	const match = matchLocal(work);
	if (!match) continue; // unmatched works are handled by pass 2

	// Match a recorded citation on its DOI before its title. Titles are the
	// weaker key by far: OpenAlex files the short form a publisher supplied
	// while the bibliography here carries the full one ("The Modernity of Islam
	// in Burkina Faso" against "…: Contrasting Strategies in Two Emergent
	// Movements"), and a journal that translates its titles supplies a
	// different language altogether. Both entries carry the same DOI, so on
	// titles alone a citation stays "new" for as long as it is recorded.
	const recorded = match.record.citedBy ?? [];
	const knownTitles = new Set(recorded.map((c) => normTitle(c.title)));
	const knownDois = new Set(recorded.map((c) => normDoi(c.url)).filter((d) => d.startsWith('10.')));
	const openAlexId = workId(work);

	let citing;
	try {
		citing = await allWorks(
			`cites:${openAlexId}`,
			'id,doi,title,type,publication_year,authorships,primary_location,referenced_works'
		);
	} catch (err) {
		console.error(`[check-citations] could not fetch citations for ${openAlexId}: ${err.message}`);
		continue;
	}

	const candidates = citing
		.filter((c) => c.title)
		.filter((c) => !MATTER.has(normTitle(c.title)))
		// OpenAlex's own designation for front and back matter, which catches
		// what MATTER's title list cannot enumerate ("List of contributors").
		.filter((c) => c.type !== 'paratext')
		// Self-citation is not news.
		.filter((c) => !(c.authorships ?? []).some((a) => a.author?.orcid?.includes(ORCID)))
		.filter((c) => {
			const reason = EXCLUDED_CITATIONS.get(normDoi(c.doi));
			if (reason) excluded.add(normDoi(c.doi));
			return !reason;
		})
		.map((c) => ({
			authors: (c.authorships ?? [])
				.map((a) => a.author?.display_name)
				.filter((n) => n && !CORPORATE.test(n)),
			year: c.publication_year,
			title: cleanTitle(c.title),
			source: c.primary_location?.source?.display_name ?? undefined,
			url: c.doi ?? undefined,
			// Grouping inputs, stripped before the entry reaches the report.
			doi: normDoi(c.doi),
			type: c.type,
			container: c.primary_location?.raw_source_name ?? '',
			refs: c.referenced_works ?? [],
			known: knownDois.has(normDoi(c.doi)) || knownTitles.has(normTitle(c.title))
		}));

	const fresh = selectFreshCitations(candidates);
	for (const c of fresh) {
		delete c.doi;
		delete c.type;
		delete c.container;
		delete c.refs;
		delete c.known;
	}
	fresh.sort((a, b) => (b.year ?? 0) - (a.year ?? 0));

	if (fresh.length) newCitations.push({ publication: match, citing: fresh });
}

// A suppression that no longer suppresses anything reads as coverage while
// hiding nothing. Say so rather than let the list rot.
for (const [doi, why] of EXCLUDED_CITATIONS) {
	if (!excluded.has(doi)) {
		console.warn(
			`[check-citations] stale EXCLUDED_CITATIONS entry ${doi} (${why}) — no longer cited`
		);
	}
}

// ---------------------------------------------------------------------------
// Pass 2 — publications missing from the site
// ---------------------------------------------------------------------------

/**
 * OpenAlex indexes a lot of noise around a real author: duplicate records,
 * corrections, and above all *reviews of* a book rather than the book itself.
 * Only flag work types that plausibly belong in the bibliography.
 */
const REPORTABLE_TYPES = new Set(['article', 'book', 'book-chapter', 'dissertation', 'report']);

/**
 * OpenAlex work ids that duplicate something already on the site.
 *
 * A journal that supplies a translated title gets indexed twice: once as the
 * record of account, carrying the DOI, and once as a bare title with no
 * identifier at all. `matchLocal` cannot join them — there is no DOI to match
 * on, and the two titles share almost no words once normalised — so the
 * duplicate is reported as a missing publication every month.
 *
 * The list lives here rather than in `src/lib/data/publications/` on purpose:
 * this is an artefact of one aggregator's deduplication, not a fact about the
 * bibliography, and the data files should not have to carry it.
 */
const KNOWN_DUPLICATES = new Map([
	[
		'W3135158559',
		"Cahiers d'études africaines' English title for hadj-cote-divoire-2018; " +
			'the French record W2789989347 is the one carrying the DOI'
	]
]);

const missing = ownWorks
	.filter((w) => REPORTABLE_TYPES.has(w.type))
	.filter((w) => !KNOWN_DUPLICATES.has(workId(w)))
	.filter((w) => !matchLocal(w))
	.sort((a, b) => (b.publication_year ?? 0) - (a.publication_year ?? 0));

// A suppression that no longer suppresses anything is worse than none: it
// reads as coverage while hiding nothing. Say so rather than let it rot.
for (const [id, why] of KNOWN_DUPLICATES) {
	if (!ownWorks.some((w) => workId(w) === id)) {
		console.warn(
			`[check-citations] stale KNOWN_DUPLICATES entry ${id} (${why}) — no longer indexed`
		);
	}
}

// ---------------------------------------------------------------------------
// Report
// ---------------------------------------------------------------------------

/**
 * Everything below turns API strings into a Markdown document that the
 * workflow posts as a GitHub issue body, verbatim. A title is the one input
 * here that someone else controls — OpenAlex indexes whatever a publisher
 * files — so flatten it to inert text first: control characters (a newline
 * ends a bullet early), backticks (which close the surrounding code fence),
 * and any absurd length.
 */
function flatten(value, maxLength = 500) {
	const text = String(value ?? '')
		// eslint-disable-next-line no-control-regex
		.replace(/[\u0000-\u001f\u007f]+/g, ' ')
		.replace(/`/g, "'")
		.replace(/\s+/g, ' ')
		.trim();
	return text.length > maxLength ? `${text.slice(0, maxLength - 1)}…` : text;
}

/**
 * Escape a string for a single-quoted TypeScript literal.
 *
 * The backslash has to be doubled *first*. Escaping only the quote turns a
 * title ending in a backslash into `'…\'`, whose closing quote is now itself
 * escaped — the literal runs on into the following line and the pasted block
 * no longer parses.
 */
const esc = (s) => flatten(s).replace(/\\/g, '\\\\').replace(/'/g, "\\'");

/** Defuse the Markdown actives, for text rendered as prose rather than code. */
const md = (s) => flatten(s).replace(/[\\`*_[\]<>#|]/g, (ch) => `\\${ch}`);

/**
 * Only what genuinely looks like a DOI URL reaches a data file. OpenAlex
 * always spells this `https://doi.org/10.…`; anything else is dropped rather
 * than pasted into the repository on trust.
 */
const safeDoiUrl = (raw) => {
	const s = String(raw ?? '').trim();
	return /^https:\/\/doi\.org\/10\.\d{4,9}\/[^\s"'<>\\]+$/i.test(s) ? s : undefined;
};

const lines = [];
const totalNew = newCitations.reduce((n, e) => n + e.citing.length, 0);

if (totalNew) {
	lines.push(
		`## ${totalNew} new citation${totalNew === 1 ? '' : 's'}`,
		'',
		'Present in OpenAlex, absent from the `citedBy` array of the matching data file. Each block is ready to paste.',
		''
	);
	for (const { publication, citing } of newCitations) {
		lines.push(
			`### ${publication.record.title}`,
			'',
			`\`${publication.file.replace(/\\/g, '/')}\``,
			''
		);
		lines.push('```ts');
		for (const c of citing) {
			lines.push('{');
			lines.push(`\tauthors: [${c.authors.map((a) => `'${esc(a)}'`).join(', ')}],`);
			lines.push(`\tyear: ${Number(c.year) || 'undefined'},`);
			lines.push(`\ttitle: '${esc(c.title)}',`);
			if (c.source) lines.push(`\tsource: '${esc(c.source)}',`);
			const url = safeDoiUrl(c.url);
			if (url) lines.push(`\turl: '${esc(url)}'`);
			lines.push('},');
		}
		lines.push('```', '');
	}
}

if (missing.length) {
	lines.push(
		`## ${missing.length} work${missing.length === 1 ? '' : 's'} not on the site`,
		'',
		'Indexed under the ORCID but with no matching file in `src/lib/data/publications/`. Some will be duplicates or records of reviews rather than new work — verify before adding.',
		''
	);
	for (const w of missing) {
		const url = safeDoiUrl(w.doi);
		const doi = url ? ` — ${md(url)}` : '';
		const year = Number(w.publication_year) || 'n.d.';
		lines.push(`- **${year}** · ${md(cleanTitle(w.title))}${doi} _(${md(w.type)})_`);
	}
	lines.push('');
}

if (!totalNew && !missing.length) {
	lines.push(
		'Nothing new. Every OpenAlex citation is recorded and every indexed work is on the site.',
		''
	);
}

const totalCitations = ownWorks.reduce((n, w) => n + w.cited_by_count, 0);
lines.push(
	'## Totals',
	'',
	`- ${ownWorks.length} works indexed by OpenAlex, cited ${totalCitations} times`,
	`- ${publications.length} publications on the site`,
	'',
	'_OpenAlex indexes fewer citations than Google Scholar, so these counts are a floor._',
	''
);

const report = lines.join('\n');
if (reportPath) writeFileSync(reportPath, report, 'utf8');

console.log(`\n${report}`);
console.log(
	totalNew || missing.length
		? `[check-citations] ${totalNew} new citation(s), ${missing.length} missing publication(s).`
		: '[check-citations] Up to date.'
);
