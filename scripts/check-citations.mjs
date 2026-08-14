/**
 * Citation and publication watcher.
 *
 * Answers three questions the site cannot answer about itself:
 *   1. Has anyone new cited this work since the `citedBy` lists were last
 *      updated?
 *   2. Is there a published work under this ORCID that never made it into
 *      `src/lib/data/publications/`?
 *   3. Is anyone citing this work somewhere no citation index can see?
 *
 * Why not Google Scholar. Scholar has no public API, actively serves CAPTCHAs
 * to datacentre IPs (which is all a GitHub Actions runner ever is), and
 * forbids scraping in its terms. A watcher built on it would be red for
 * reasons nobody can fix. OpenAlex is free, keyless, addressable by ORCID, and
 * returns the citing works themselves rather than a bare count — which is what
 * makes the output actionable. Its coverage of citations is smaller than
 * Scholar's, so treat the numbers here as a floor, not a census.
 *
 * Questions 1 and 2 are the citation graph, and OpenAlex is the spine of both.
 * Question 3 is what the graph structurally cannot answer: it only ever knows
 * the references publishers deposit, which excludes most monographs and most
 * francophone grey literature — between them, the venues this bibliography is
 * cited in most. Google Books, HAL and Wikipedia search running text instead,
 * so they see footnotes no index recorded. They are also far noisier, which is
 * why `citation-discovery.mjs` keeps them in their own report section, as
 * leads to verify rather than records to paste.
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
 *   node scripts/check-citations.mjs --skip-discovery # OpenAlex passes only
 *
 * Exit code is 0 unless OpenAlex was unreachable — "you have new citations" is
 * news, not a build failure, and a discovery source being down degrades the
 * report rather than failing it.
 */
import { globSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve, basename } from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { argv, exit, env } from 'node:process';
import { normDoi, normTitle, selectFreshCitations } from './citation-grouping.mjs';
import { cleanTitle } from './citation-text.mjs';
import {
	nameVariants,
	normaliseGoogleBooks,
	normaliseHal,
	normaliseWikipedia,
	isOwnWork,
	selectFreshWorks,
	selectFreshMentions,
	markdownHref
} from './citation-discovery.mjs';

const ORCID = '0000-0003-0959-2092';
const AUTHOR = 'Frédérick Madore'; // the phrase the discovery sources search for
const CONTACT = 'frederick_madore@outlook.com'; // OpenAlex "polite pool" identifier
const API = 'https://api.openalex.org';
const REQUEST_TIMEOUT_MS = 30_000;

/** Wikipedias worth searching: the languages this work is written and read in. */
const WIKIS = ['fr', 'en', 'de'];

/** Politeness gap between discovery requests. None of these services bills, and none should be hammered. */
const DISCOVERY_PAUSE_MS = 250;

const reportPath = argv.find((a) => a.startsWith('--report='))?.slice('--report='.length) ?? null;
const skipDiscovery = argv.includes('--skip-discovery');

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
// Pass 3 — discovery: citations no index recorded
// ---------------------------------------------------------------------------

/**
 * Acknowledged leads, so a lead that was looked at and rejected stays rejected.
 *
 * The OpenAlex passes need nothing like this: every finding there resolves by
 * being committed to a data file, so the repository is the state and there is
 * nothing to tick off. A discovery lead that turns out *not* to be a citation
 * has no such resting place — it would be re-reported every month forever — so
 * it gets an explicit one. Same shape as `EXCLUDED_CITATIONS` above, kept in a
 * file rather than in this source because it is a list that grows with use.
 */
const ACK_PATH = fileURLToPath(new URL('./citation-discovery-ack.json', import.meta.url));
let ackEntries = {};
try {
	ackEntries = JSON.parse(readFileSync(ACK_PATH, 'utf8'))?.acknowledged ?? {};
} catch (err) {
	console.warn(`[check-citations] could not read ${ACK_PATH}: ${err.message}`);
}
const acknowledged = new Set(Object.keys(ackEntries));

/**
 * Every citing work recorded anywhere in the repository.
 *
 * Global rather than per-publication, unlike the OpenAlex pass: a full-text hit
 * says that someone's book mentions this author, not which of his works it
 * cites. "Is this citing work already recorded against *any* publication" is
 * the only question the data supports.
 */
const allKnownDois = new Set();
const allKnownTitles = new Set();
for (const { record } of publications) {
	for (const c of record.citedBy ?? []) {
		const doi = normDoi(c.url);
		if (doi.startsWith('10.')) allKnownDois.add(doi);
		const title = normTitle(c.title);
		if (title) allKnownTitles.add(title);
	}
}

/** The author's own output, in every spelling the discovery sources might file it under. */
const localTitles = new Set();
for (const { record } of publications) {
	const title = normTitle(record.title);
	if (title) localTitles.add(title);
}
// OpenAlex often holds a translated or short-form title for the same work, and
// Google Books indexes whichever one the publisher used.
for (const w of ownWorks) {
	const title = normTitle(cleanTitle(w.title));
	if (title) localTitles.add(title);
}
const localIsbns = new Set(
	publications
		.map(({ record }) => String(record.isbn ?? '').replace(/[^0-9xX]/g, ''))
		.filter((i) => i.length >= 10)
);

const variants = nameVariants(AUTHOR);
const own = (hit) => isOwnWork(hit, { variants, localTitles, localIsbns });

/** A source that failed is reported as failed: partial coverage must not read as "nothing found". */
const discoveryErrors = [];
const pause = (ms) => new Promise((r) => setTimeout(r, ms));

async function getJson(url, headers = {}) {
	const res = await fetch(url, {
		headers: {
			'user-agent': `frederickmadore.com citation watcher (mailto:${CONTACT})`,
			...headers
		},
		signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS)
	});
	if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
	return res.json();
}

/**
 * Google Books — the monograph channel.
 *
 * `country` is not optional in practice: without it the API refuses the request
 * from any IP it cannot geolocate, which on a GitHub runner is a coin flip, and
 * the error it returns (403 `unsupportedGeoLocation`) reads like a permissions
 * problem rather than a missing parameter. It selects a market, not a language,
 * so it does not narrow the search to anglophone books.
 */
const BOOKS_PAGE = 40; // API maximum
const BOOKS_MAX = 120; // three pages per name variant: enough for a name this distinctive

async function searchGoogleBooks() {
	const hits = [];
	for (const variant of variants) {
		for (let start = 0; start < BOOKS_MAX; start += BOOKS_PAGE) {
			const params = new URLSearchParams({
				q: `"${variant}"`,
				printType: 'books',
				maxResults: String(BOOKS_PAGE),
				startIndex: String(start),
				country: env.GOOGLE_BOOKS_COUNTRY || 'US'
			});
			// Keyless works at this volume; a key only raises the quota ceiling.
			if (env.GOOGLE_BOOKS_API_KEY) params.set('key', env.GOOGLE_BOOKS_API_KEY);

			const page = await getJson(`https://www.googleapis.com/books/v1/volumes?${params}`);
			const batch = normaliseGoogleBooks(page);
			hits.push(...batch);

			const total = Number(page?.totalItems) || 0;
			if (batch.length === 0 || start + BOOKS_PAGE >= total) break;
			if (start + BOOKS_PAGE >= BOOKS_MAX && total > BOOKS_MAX) {
				console.warn(
					`[check-citations] Google Books: ${total} results for "${variant}", capped at ${BOOKS_MAX}`
				);
			}
			await pause(DISCOVERY_PAUSE_MS);
		}
		await pause(DISCOVERY_PAUSE_MS);
	}
	return hits;
}

/**
 * HAL — the francophone grey-literature channel.
 *
 * The bare `q` is deliberate. HAL's Solr schema exposes a pile of field-scoped
 * aliases, an unknown one is a 400 rather than an empty result, and the default
 * already searches metadata and the full text of deposited files together —
 * which is the whole point of asking HAL. If recall ever looks low, scoping to
 * an explicit full-text field is the thing to try, but it is a narrowing.
 */
async function searchHal() {
	const hits = [];
	for (const variant of variants) {
		const params = new URLSearchParams({
			q: `"${variant}"`,
			fl: 'docid,halId_s,title_s,authFullName_s,producedDateY_i,doiId_s,uri_s,docType_s,journalTitle_s,bookTitle_s',
			rows: '100',
			sort: 'producedDateY_i desc',
			wt: 'json'
		});
		const page = await getJson(`https://api.archives-ouvertes.fr/search/?${params}`);
		hits.push(...normaliseHal(page));

		const total = Number(page?.response?.numFound) || 0;
		if (total > 100) {
			console.warn(`[check-citations] HAL: ${total} results for "${variant}", capped at 100`);
		}
		await pause(DISCOVERY_PAUSE_MS);
	}
	return hits;
}

/**
 * Wikipedia — reach rather than citation.
 *
 * `insource:` is a CirrusSearch operator that matches the wikitext itself, so a
 * quoted name finds the `{{cite book |last=Madore}}` in a reference list, which
 * a plain search of rendered article text would miss.
 */
async function searchWikipedia() {
	const hits = [];
	for (const lang of WIKIS) {
		for (const variant of variants) {
			const params = new URLSearchParams({
				action: 'query',
				list: 'search',
				srsearch: `insource:"${variant}"`,
				srnamespace: '0',
				srlimit: '50',
				format: 'json',
				formatversion: '2'
			});
			const page = await getJson(`https://${lang}.wikipedia.org/w/api.php?${params}`);
			hits.push(...normaliseWikipedia(page, lang));
			await pause(DISCOVERY_PAUSE_MS);
		}
	}
	return hits;
}

async function runSource(label, fn) {
	try {
		return await fn();
	} catch (err) {
		console.error(`[check-citations] ${label} unavailable: ${err.message}`);
		discoveryErrors.push({ label, message: err.message });
		return [];
	}
}

let freshWorks = [];
let freshMentions = [];

if (skipDiscovery) {
	console.log('[check-citations] discovery sources skipped (--skip-discovery)');
} else {
	const [books, hal, wiki] = [
		await runSource('Google Books', searchGoogleBooks),
		await runSource('HAL', searchHal),
		await runSource('Wikipedia', searchWikipedia)
	];

	freshWorks = selectFreshWorks([...books, ...hal], {
		knownDois: allKnownDois,
		knownTitles: allKnownTitles,
		acknowledged,
		own
	});
	freshMentions = selectFreshMentions(wiki, acknowledged);

	console.log(
		`[check-citations] discovery: ${books.length} Google Books + ${hal.length} HAL raw → ${freshWorks.length} lead(s); ` +
			`${wiki.length} Wikipedia raw → ${freshMentions.length} mention(s)`
	);

	// As with the two suppression lists above: an acknowledgement that no longer
	// matches anything reads as coverage while hiding nothing.
	const seenKeys = new Set([...books, ...hal, ...wiki].map((h) => h.key));
	if (discoveryErrors.length === 0) {
		for (const [key, why] of Object.entries(ackEntries)) {
			if (!seenKeys.has(key)) {
				console.warn(
					`[check-citations] stale acknowledgement ${key} (${why}) — no longer returned by its source`
				);
			}
		}
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

/** `[text](url)` when the URL survives validation, plain text when it does not. */
const link = (text, url) => {
	const href = markdownHref(url);
	return href ? `[${md(text)}](${href})` : md(text);
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

const SOURCE_LABELS = { books: 'Google Books', hal: 'HAL' };

if (freshWorks.length) {
	lines.push(
		`## ${freshWorks.length} lead${freshWorks.length === 1 ? '' : 's'} from full-text search`,
		'',
		'Works whose text names the author, found by searching Google Books and HAL rather than by following the citation graph — so this is where monographs, theses and francophone grey literature turn up, and also where bibliography name-checks and false positives do. **Verify before recording.** Unlike the blocks above these are not ready to paste: a full-text hit does not say which publication it cites, and that is the one thing a `citedBy` entry has to get right.',
		'',
		'Record a real citation in the `citedBy` array of the work it cites and it stops appearing here. For anything that is not a citation, paste its key into `scripts/citation-discovery-ack.json`.',
		''
	);
	for (const hit of freshWorks) {
		const year = hit.year ?? 'n.d.';
		const authors = hit.authors.length ? ` — ${md(hit.authors.slice(0, 4).join(', '))}` : '';
		const where = hit.container ? ` _(${md(hit.container)})_` : '';
		lines.push(`- **${year}** · ${link(hit.title, hit.url)}${authors}${where}`);
		lines.push(`  · ${SOURCE_LABELS[hit.source] ?? hit.source}`);
		if (hit.doi) lines.push(`  · \`${md(hit.doi)}\``);
		if (hit.snippet) lines.push(`  > ${md(hit.snippet)}`);
		lines.push(`  · dismiss with \`"${md(hit.key)}": "not a citation"\``);
	}
	lines.push('');
}

if (freshMentions.length) {
	lines.push(
		`## ${freshMentions.length} Wikipedia article${freshMentions.length === 1 ? '' : 's'} naming the author`,
		'',
		'Found with CirrusSearch `insource:`, which matches the wikitext, so these are usually citation templates in a reference list. Reach rather than citation: nothing in the repository represents one, so acknowledge each in `scripts/citation-discovery-ack.json` once seen — otherwise it is reported every month.',
		''
	);
	for (const hit of freshMentions) {
		lines.push(`- \`${hit.lang}\` · ${link(hit.title, hit.url)}`);
		if (hit.snippet) lines.push(`  > ${md(hit.snippet)}`);
		lines.push(`  · acknowledge with \`"${md(hit.key)}": "seen"\``);
	}
	lines.push('');
}

if (discoveryErrors.length) {
	lines.push(
		'## Incomplete run',
		'',
		'These sources could not be reached, so the discovery sections above are missing whatever they would have contributed. Nothing else in this report is affected.',
		''
	);
	for (const e of discoveryErrors) lines.push(`- **${md(e.label)}** — ${md(e.message)}`);
	lines.push('');
}

const findings =
	totalNew || missing.length || freshWorks.length || freshMentions.length || discoveryErrors.length;

if (!findings) {
	lines.push(
		'Nothing new. Every OpenAlex citation is recorded, every indexed work is on the site, and no full-text source turned up an unacknowledged lead.',
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
	'_OpenAlex indexes fewer citations than Google Scholar, so these counts are a floor — which is what the full-text sources are there to raise._',
	''
);

/**
 * A machine-readable verdict for the workflow's triage step, which otherwise
 * has to guess at the shape of the headings above and silently stops opening
 * issues the day one of them is reworded.
 */
const report = `<!-- citation-watch: ${findings ? 'findings' : 'clean'} -->\n${lines.join('\n')}`;
if (reportPath) writeFileSync(reportPath, report, 'utf8');

console.log(`\n${report}`);
console.log(
	findings
		? `[check-citations] ${totalNew} new citation(s), ${missing.length} missing publication(s), ` +
				`${freshWorks.length} full-text lead(s), ${freshMentions.length} Wikipedia mention(s).`
		: '[check-citations] Up to date.'
);
