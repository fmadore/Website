/**
 * Citation and publication watcher.
 *
 * Answers four questions the site cannot answer about itself:
 *   1. Has anyone new cited this work since the `citedBy` lists were last
 *      updated?
 *   2. Is there a published work under this ORCID that never made it into
 *      `src/lib/data/publications/`?
 *   3. Does OpenAlex still hold every publication on the site, under this
 *      author, and by a key firmer than its title?
 *   4. Is anyone citing this work somewhere no citation index can see?
 *
 * Why not Google Scholar. Scholar has no public API, actively serves CAPTCHAs
 * to datacentre IPs (which is all a GitHub Actions runner ever is), and
 * forbids scraping in its terms. A watcher built on it would be red for
 * reasons nobody can fix. OpenAlex is free, keyless, addressable by ORCID, and
 * returns the citing works themselves rather than a bare count — which is what
 * makes the output actionable. Its coverage of citations is smaller than
 * Scholar's, so treat the numbers here as a floor, not a census.
 *
 * Questions 1 to 3 are the citation graph, and OpenAlex is the spine of all
 * three. It is reached by every key there is — the ORCID, the OpenAlex author
 * record, each DOI on the site and each recorded `openAlexId` — so that a work
 * OpenAlex detaches from the author is still followed, and reported rather
 * than silently lost (`openalex-coverage.mjs`).
 * Question 4 is what the graph structurally cannot answer: it only ever knows
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
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { argv, exit, env } from 'node:process';
import { collectRecords } from './lib/data-records.mjs';
import { normDoi, normTitle, selectFreshCitations } from './citation-grouping.mjs';
import { cleanTitle, flatten } from './citation-text.mjs';
import { assessCoverage, localDois, normWorkId, orFilters } from './openalex-coverage.mjs';
import {
	nameVariants,
	normaliseGoogleBooks,
	normaliseHal,
	normaliseWikipedia,
	isOwnWork,
	selectFreshWorks,
	selectFreshMentions,
	markdownHref,
	normUrl
} from './citation-discovery.mjs';

const ORCID = '0000-0003-0959-2092';
/**
 * The author's OpenAlex record, asked separately from the ORCID because the
 * two can come apart: a record keeps its works if it loses the ORCID link,
 * and an ORCID can end up on a different record.
 */
const OPENALEX_AUTHOR = 'A5000010243';
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

// Share the generators' loader so CV views, summaries, tests and other helper
// modules are excluded before import. Keep the full records, including citedBy.
const publications = await collectRecords('src/lib/data/publications/**/*.ts', 'check-citations');

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
			`/works?filter=${encodeURIComponent(filter)}&select=${select}&per-page=200&cursor=${encodeURIComponent(cursor)}`
		);
		results.push(...page.results);
		cursor = page.meta?.next_cursor ?? null;
		if (page.results.length === 0) break;
	}
	return results;
}

/** `authorships` is read only to say whom a misattributed work is filed under. */
const WORK_FIELDS = 'id,doi,title,publication_year,cited_by_count,type,authorships';

let byOrcid;
try {
	byOrcid = await allWorks(`author.orcid:${ORCID}`, WORK_FIELDS);
} catch (err) {
	console.error(`[check-citations] OpenAlex unreachable: ${err.message}`);
	exit(1);
}

/**
 * The other routes in. OpenAlex answered the ORCID query, so a failure here is
 * a bad request or a blip, not an outage: it degrades the report (and says
 * so) rather than failing the run. Null means the route failed.
 */
const lookupErrors = [];

async function lookup(label, filters) {
	const works = [];
	try {
		for (const filter of filters) works.push(...(await allWorks(filter, WORK_FIELDS)));
		return works;
	} catch (err) {
		console.error(`[check-citations] OpenAlex ${label} lookup failed: ${err.message}`);
		lookupErrors.push({
			label: `OpenAlex ${label} lookup`,
			message: err.message.replace(/ for \/works\?.*$/, '')
		});
		return null;
	}
}

const siteDois = [...new Set(publications.flatMap(({ record }) => [...localDois(record)]))].sort();
const siteIds = [
	...new Set(publications.map(({ record }) => normWorkId(record.openAlexId)).filter(Boolean))
].sort();

const byAuthor = await lookup('author record', [`author.id:${OPENALEX_AUTHOR}`]);
const byDoi = await lookup(
	'DOI',
	orFilters(
		'doi',
		siteDois.map((d) => `https://doi.org/${d}`)
	)
);
const byId = await lookup('work id', orFilters('ids.openalex', siteIds));

/** Every work found, once, with the routes that found it. */
const routesOf = new Map(); // bare work id → Set<'orcid' | 'author' | 'doi' | 'id'>
const indexed = new Map(); // bare work id → work
for (const [route, list] of [
	['orcid', byOrcid],
	['author', byAuthor],
	['doi', byDoi],
	['id', byId]
]) {
	for (const work of list ?? []) {
		const id = normWorkId(work.id);
		if (!id) continue;
		if (!indexed.has(id)) indexed.set(id, work);
		if (!routesOf.has(id)) routesOf.set(id, new Set());
		routesOf.get(id).add(route);
	}
}
const indexedWorks = [...indexed.values()];

/** Filed under the author by OpenAlex, rather than reached through the site's own identifiers. */
const attributed = (work) => {
	const routes = routesOf.get(normWorkId(work.id));
	return Boolean(routes?.has('orcid') || routes?.has('author'));
};
const ownWorks = indexedWorks.filter(attributed);

if (byAuthor && byAuthor.length === 0 && byOrcid.length > 0) {
	console.warn(
		`[check-citations] OpenAlex author ${OPENALEX_AUTHOR} returned no works — merged into another record? Update OPENALEX_AUTHOR.`
	);
}

const coverage = assessCoverage({
	publications,
	works: indexedWorks,
	attributed,
	idsReturned: byId ? new Set(byId.map((w) => normWorkId(w.id))) : null
});
const { matchOf } = coverage;

const doisFound = new Set(
	(byDoi ?? []).map((w) => normDoi(w.doi)).filter((d) => siteDois.includes(d))
);

console.log(
	`[check-citations] ${publications.length} local publications; OpenAlex: ${byOrcid.length} works under ORCID ${ORCID}, ` +
		`${byAuthor?.length ?? 'n/a'} under author ${OPENALEX_AUTHOR}, ` +
		`${byDoi ? doisFound.size : 'n/a'} of ${siteDois.length} DOIs, ` +
		`${byId?.length ?? 'n/a'} of ${siteIds.length} recorded ids → ${indexedWorks.length} works`
);

// ---------------------------------------------------------------------------
// Pass 1 — new citations
// ---------------------------------------------------------------------------

/** OpenAlex ids are URLs; the bare id is the last segment. */
const workId = (work) =>
	String(work?.id ?? '')
		.split('/')
		.pop();

const newCitations = []; // { publication, citing[] }
const excluded = new Set(); // EXCLUDED_CITATIONS entries that actually fired
// Every work matched to the site, whichever route found it: a work OpenAlex has
// detached from the author still has its citations followed.
const cited = indexedWorks
	.filter((w) => w.cited_by_count > 0)
	.sort((a, b) => b.cited_by_count - a.cited_by_count);

for (const work of cited) {
	const match = matchOf.get(work);
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
 * identifier at all. `matchPublication` cannot join them — there is no DOI to match
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
	.filter((w) => !matchOf.has(w))
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
// Coverage — the same question asked from the site's side
// ---------------------------------------------------------------------------

const { unattributed, toRecord, stale } = coverage;
// "Not in OpenAlex" is only an answer once every route that could have found a
// publication has answered; after a failed lookup it would be a guess.
const unindexed = byAuthor && byDoi && byId ? coverage.unindexed : null;

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
const allKnownUrls = new Set();
for (const { record } of publications) {
	for (const c of record.citedBy ?? []) {
		const doi = normDoi(c.url);
		if (doi.startsWith('10.')) allKnownDois.add(doi);
		const title = normTitle(c.title);
		if (title) allKnownTitles.add(title);
		// Wikipedia mentions carry no DOI and share titles across languages, so
		// the article URL is what marks one as already recorded.
		if (c.url) allKnownUrls.add(normUrl(c.url));
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
for (const w of indexedWorks) {
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

/**
 * Statuses worth trying again. 429 is the one that matters: unauthenticated
 * Google Books is throttled per IP, and a GitHub runner shares its IP with
 * every other job on the host, so the quota can be spent before this script
 * ever runs. The first live run lost the whole monograph channel to one.
 */
const RETRY_STATUSES = new Set([429, 500, 502, 503, 504]);
const RETRY_ATTEMPTS = 3;
const RETRY_BACKOFF_MS = [2_000, 8_000];

/** `Retry-After` in either of its spellings, capped so a silly value cannot stall the job. */
function retryAfterMs(res, fallback) {
	const header = res.headers.get('retry-after');
	if (!header) return fallback;
	const seconds = Number(header);
	const ms = Number.isFinite(seconds)
		? seconds * 1000
		: Number.isFinite(Date.parse(header))
			? Date.parse(header) - Date.now()
			: NaN;
	return Number.isFinite(ms) && ms > 0 ? Math.min(ms, 30_000) : fallback;
}

async function getJson(url, headers = {}) {
	let last;
	for (let attempt = 0; attempt < RETRY_ATTEMPTS; attempt++) {
		const res = await fetch(url, {
			headers: {
				'user-agent': `frederickmadore.com citation watcher (mailto:${CONTACT})`,
				...headers
			},
			signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS)
		});
		if (res.ok) return res.json();

		last = new Error(`${res.status} ${res.statusText}`);
		if (!RETRY_STATUSES.has(res.status) || attempt === RETRY_ATTEMPTS - 1) throw last;

		const wait = retryAfterMs(res, RETRY_BACKOFF_MS[attempt]);
		console.warn(
			`[check-citations] ${res.status} from ${new URL(url).host}, retrying in ${wait}ms`
		);
		await pause(wait);
	}
	throw last;
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
	freshMentions = selectFreshMentions(wiki, { acknowledged, knownUrls: allKnownUrls });

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
 * Everything below turns API strings into a Markdown document that the workflow
 * posts as a GitHub issue body, verbatim. Every string that reaches it from one
 * of the four services goes through `flatten` first — see `citation-text.mjs`
 * for why — and then through one of the escapers here, chosen by where in the
 * document it lands: a TypeScript literal, Markdown prose, or a link target.
 */

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
		'Filed under the ORCID or the OpenAlex author record but with no matching file in `src/lib/data/publications/`. Some will be duplicates or records of reviews rather than new work — verify before adding.',
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

/** `[W123](https://openalex.org/W123)`: the record a finding is about, one click away. */
const workLink = (work) => {
	const id = normWorkId(work.id);
	return id ? `[${id}](https://openalex.org/${id})` : 'an OpenAlex record with no id';
};

const fileOf = (publication) => `\`${publication.file.replace(/\\/g, '/')}\``;

/** Whom OpenAlex files a work under: the names, and the author records behind them. */
const filedUnder = (work) => {
	const names = (work.authorships ?? [])
		.map(({ author }) => {
			if (!author?.display_name) return null;
			const id = String(author.id ?? '')
				.split('/')
				.pop();
			return id ? `${author.display_name} (${id})` : author.display_name;
		})
		.filter(Boolean);
	if (names.length === 0) return 'no author';
	const shown = names.slice(0, 6).join(', ');
	return names.length > 6 ? `${shown} and ${names.length - 6} more` : shown;
};

const citations = (work) => {
	const n = Number(work.cited_by_count) || 0;
	return `${n} citation${n === 1 ? '' : 's'}`;
};

if (unattributed.length) {
	lines.push(
		`## ${unattributed.length} publication${unattributed.length === 1 ? '' : 's'} OpenAlex does not file under the author`,
		'',
		`Found through the site's own DOI or \`openAlexId\`, but under neither ORCID ${ORCID} nor author record ${OPENALEX_AUTHOR}. Their citations are still followed above; what is wrong is the attribution, which only OpenAlex can correct. Until it does, these works are missing from the author's OpenAlex profile and from everything built on it.`,
		''
	);
	for (const { publication, works } of unattributed) {
		lines.push(`- **${md(publication.record.title)}** — ${fileOf(publication)}`);
		for (const work of works) {
			lines.push(`  · ${workLink(work)}, filed under ${md(filedUnder(work))}`);
		}
	}
	lines.push('');
}

if (toRecord.length) {
	lines.push(
		`## ${toRecord.length} OpenAlex id${toRecord.length === 1 ? '' : 's'} to record`,
		'',
		"Publications with no DOI of their own — none at all, or one they share with other publications on the site (a volume's on its chapters, an issue's on the pieces in it) — so OpenAlex could only be matched to them by title. A title is the weakest key there is: edit one here and the match is gone. Add the line to the data file and the work is matched on its id from then on.",
		''
	);
	for (const { publication, works } of toRecord) {
		const [best, ...others] = works;
		lines.push(`### ${md(publication.record.title)}`, '', fileOf(publication), '');
		lines.push('```ts', `openAlexId: '${normWorkId(best.id)}',`, '```', '');
		if (others.length) {
			const listed = others.map((w) => `${workLink(w)} (${citations(w)})`).join(', ');
			lines.push(
				`OpenAlex also matches ${listed}: a duplicate record, or a work of the same title. The id above, ${workLink(best)}, carries the most citations (${citations(best)}); the others are still followed while their titles match.`,
				''
			);
		}
	}
}

if (stale.length) {
	lines.push(
		`## ${stale.length} recorded OpenAlex id${stale.length === 1 ? '' : 's'} that no longer resolve${stale.length === 1 ? 's' : ''}`,
		'',
		'OpenAlex retires an id when it merges a duplicate record into another. Find the work on openalex.org again and replace the `openAlexId` in the data file.',
		''
	);
	for (const { publication, id, malformed } of stale) {
		const why = malformed ? 'is not an OpenAlex work id' : 'was not returned';
		lines.push(`- **${md(publication.record.title)}** — ${fileOf(publication)} · ${md(id)} ${why}`);
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
		'Found with CirrusSearch `insource:`, which matches the wikitext, so these are usually citation templates in a reference list. Verify what is actually being cited, then record it in the `citedBy` array of that work — with the article URL as `url`, which is what marks it as recorded — and it stops appearing here. An article that names the author without citing him is not a citation: dismiss it in `scripts/citation-discovery-ack.json`.',
		''
	);
	for (const hit of freshMentions) {
		lines.push(`- \`${hit.lang}\` · ${link(hit.title, hit.url)}`);
		if (hit.snippet) lines.push(`  > ${md(hit.snippet)}`);
		lines.push(`  · not a citation? dismiss with \`"${md(hit.key)}": "names but does not cite"\``);
	}
	lines.push('');
}

if (lookupErrors.length || discoveryErrors.length) {
	lines.push('## Incomplete run', '');
	if (lookupErrors.length) {
		lines.push(
			'These OpenAlex lookups failed, so the sections above lack whatever only they would have found, and the list of publications not in OpenAlex is withheld rather than guessed at.',
			''
		);
		for (const e of lookupErrors) lines.push(`- **${md(e.label)}** — ${md(e.message)}`);
		lines.push('');
	}
	if (discoveryErrors.length) {
		lines.push(
			'These sources could not be reached, so the discovery sections above are missing whatever they would have contributed. Nothing else in this report is affected.',
			''
		);
		for (const e of discoveryErrors) lines.push(`- **${md(e.label)}** — ${md(e.message)}`);
		lines.push('');
	}
}

const findings =
	totalNew ||
	missing.length ||
	unattributed.length ||
	toRecord.length ||
	stale.length ||
	freshWorks.length ||
	freshMentions.length ||
	lookupErrors.length ||
	discoveryErrors.length;

if (!findings) {
	lines.push(
		'Nothing new. Every OpenAlex citation is recorded, every indexed work is on the site and filed under the author, and no full-text source turned up an unacknowledged lead.',
		''
	);
}

// Reference, not a finding: most of these will never be indexed, and a list
// that can never empty must not hold the issue open.
if (unindexed?.length) {
	lines.push(
		`## ${unindexed.length} publication${unindexed.length === 1 ? '' : 's'} not in OpenAlex`,
		'',
		'For reference; these do not keep this issue open. No route found them: not the author, not a DOI, not a recorded id, not a title. Blog posts, special issues and much francophone work are often never indexed. If one is in OpenAlex under another title, record its `openAlexId` and it is followed from then on.',
		''
	);
	const byYear = (a, b) => (Number(b.record.year) || 0) - (Number(a.record.year) || 0);
	for (const publication of [...unindexed].sort(byYear)) {
		const year = Number(publication.record.year) || 'n.d.';
		lines.push(`- **${year}** · ${md(publication.record.title)} — ${fileOf(publication)}`);
	}
	lines.push('');
}

const totalCitations = indexedWorks.reduce((n, w) => n + (Number(w.cited_by_count) || 0), 0);
const routeCounts = [
	`${byOrcid.length} under the ORCID`,
	`${byAuthor ? byAuthor.length : 'n/a'} under author record ${OPENALEX_AUTHOR}`,
	`${byDoi ? doisFound.size : 'n/a'} of the site's ${siteDois.length} DOIs`,
	`${byId ? byId.length : 'n/a'} of its ${siteIds.length} recorded ids`
];
const foundOnSite = new Set(matchOf.values()).size;
lines.push(
	'## Totals',
	'',
	`- ${indexedWorks.length} works found in OpenAlex, cited ${totalCitations} times: ${routeCounts.join(', ')}`,
	`- ${publications.length} publications on the site, ${foundOnSite} of them found in OpenAlex`,
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
				`${unattributed.length} misattributed, ${toRecord.length} id(s) to record, ${stale.length} stale id(s), ` +
				`${freshWorks.length} full-text lead(s), ${freshMentions.length} Wikipedia mention(s).`
		: '[check-citations] Up to date.'
);
