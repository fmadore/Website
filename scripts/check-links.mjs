/**
 * External link checker for the built site.
 *
 * Why a custom script instead of an off-the-shelf checker (lychee, linkinator):
 * an academic bibliography is a worst case for naive HTTP checking. Roughly a
 * third of this site's outbound links are `doi.org` links that resolve to
 * publishers behind bot protection — Taylor & Francis, JSTOR, Elsevier, Wiley,
 * Cambridge. Those answer a non-browser request with 403 even when the link is
 * perfectly alive:
 *
 *   403  https://doi.org/10.1080/00083968.2015.1101008   (live article)
 *   403  https://www.jstor.org/stable/40206835           (live article)
 *   404  https://doi.org/10.1017/S0021853700000000       (genuinely dead)
 *
 * A checker that reports the first two as broken produces an issue nobody
 * reads by the third week. So this script splits the problem by link kind:
 *
 *   DOIs  → resolved against the Handle System API at doi.org/api/handles.
 *           Every DOI is a handle, so this one endpoint is authoritative for
 *           every registration agency — Crossref, DataCite, mEDRA, JaLC and
 *           the rest. (Checking Crossref alone is not enough: 10.19272/…, an
 *           mEDRA DOI cited on this site, is absent from Crossref and would be
 *           reported dead while resolving perfectly.) It is a metadata API, so
 *           no publisher bot-wall sits in front of it:
 *             responseCode 1   = handle registered  → alive
 *             responseCode 100 = handle not found   → genuinely broken
 *   Rest  → ordinary HTTP, but with the response triaged into dead / blocked /
 *           inconclusive rather than a flat pass-fail, so bot-blocking and
 *           transient timeouts never masquerade as rot.
 *
 * Anything the script declines to judge is REPORTED, not silently dropped —
 * a checker that hides its own blind spots is worse than none.
 *
 * Dead links are looked up in the Wayback Machine so the report can suggest a
 * replacement snapshot instead of just naming a problem.
 *
 * Usage:
 *   node scripts/check-links.mjs                  # check build/, print a summary
 *   node scripts/check-links.mjs --report out.md  # also write a markdown report
 *   node scripts/check-links.mjs --only=doi       # DOIs only (fast, no scraping)
 *   node scripts/check-links.mjs --only=web       # non-DOI links only
 *
 * Exit code is 1 when at least one link is classified DEAD, else 0. Blocked and
 * inconclusive results never fail the run.
 */
import { globSync, readFileSync, writeFileSync } from 'node:fs';
import { argv, exit } from 'node:process';

const BUILD_DIR = 'build';
const SITE_HOST = 'www.frederickmadore.com';
const CONTACT = 'frederick_madore@outlook.com'; // Crossref/OpenAlex "polite pool" identifier
const UA = `frederickmadore.com link checker (+https://${SITE_HOST}; mailto:${CONTACT})`;

const REQUEST_TIMEOUT_MS = 20_000;
const CONCURRENCY = 8; // deliberately gentle: this walks other people's servers
const ATTEMPTS = 2;

const reportPath = argv.find((a) => a.startsWith('--report='))?.slice('--report='.length) ?? null;
const only = argv.find((a) => a.startsWith('--only='))?.slice('--only='.length) ?? null;

/**
 * Hosts that are pointless to check over HTTP: they answer bots with a
 * challenge page, a 999, or an infinite redirect regardless of link health.
 * Links here are counted and listed in the report as UNVERIFIED — never
 * silently skipped, so the report always states the true size of its blind
 * spot. DOIs pointing at these publishers are still fully verified, because
 * they go through the Handle System instead.
 */
const UNCHECKABLE_HOSTS = [
	'linkedin.com',
	'x.com',
	'twitter.com',
	'facebook.com',
	'instagram.com',
	'jstor.org',
	'tandfonline.com',
	'sciencedirect.com',
	'onlinelibrary.wiley.com',
	'cambridge.org',
	'academic.oup.com',
	'springer.com',
	'link.springer.com',
	'proquest.com',
	'researchgate.net',
	'scholar.google.com',
	'books.google.com'
];

/** Placeholder DOIs that live in the *-template.ts scaffolds and never ship. */
const PLACEHOLDER_DOIS = new Set(['10.0000/00000']);

const isUncheckable = (host) => UNCHECKABLE_HOSTS.some((h) => host === h || host.endsWith(`.${h}`));

/** Run `fn` over `items` with a bounded number of in-flight requests. */
async function pool(items, limit, fn) {
	const out = new Array(items.length);
	let cursor = 0;
	const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
		while (cursor < items.length) {
			const i = cursor++;
			out[i] = await fn(items[i]);
		}
	});
	await Promise.all(workers);
	return out;
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function request(url, method) {
	return fetch(url, {
		method,
		redirect: 'follow',
		headers: {
			'user-agent': UA,
			// Ask for HTML explicitly: some CDNs 406 a request with no Accept.
			accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
		},
		signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS)
	});
}

// ---------------------------------------------------------------------------
// Collection
// ---------------------------------------------------------------------------

const htmlFiles = globSync(`${BUILD_DIR}/**/*.html`);

if (htmlFiles.length === 0) {
	console.error(
		`[check-links] No HTML found under ${BUILD_DIR}/. Run \`npm run build\` first — this script checks the built site, not the sources (template files carry example.com placeholders that never ship).`
	);
	exit(1);
}

const DOI_IN_URL = /^https?:\/\/(?:dx\.)?doi\.org\/(10\.[^\s"'<>]+)$/i;
const HREF = /<a\b[^>]*\bhref=["']([^"']+)["']/gi;

/** url → Set of page paths that link to it */
const webLinks = new Map();
/** doi → Set of page paths that cite it */
const dois = new Map();

const record = (map, key, page) => {
	if (!map.has(key)) map.set(key, new Set());
	map.get(key).add(page);
};

for (const file of htmlFiles) {
	const page = file.slice(BUILD_DIR.length).replace(/\\/g, '/');
	const html = readFileSync(file, 'utf8');
	for (const [, rawHref] of html.matchAll(HREF)) {
		// Built HTML is escaped; only &amp; matters for URLs in practice.
		const href = rawHref.replace(/&amp;/g, '&').trim();
		if (!/^https?:\/\//i.test(href)) continue; // internal, mailto:, tel:, #anchor

		const doiMatch = href.match(DOI_IN_URL);
		if (doiMatch) {
			const doi = decodeURIComponent(doiMatch[1]).replace(/[.,;)]+$/, '');
			if (!PLACEHOLDER_DOIS.has(doi)) record(dois, doi, page);
			continue;
		}

		let host;
		try {
			host = new URL(href).hostname.toLowerCase();
		} catch {
			continue; // unparseable href — nothing useful to check
		}
		if (host === SITE_HOST) continue; // self-links are covered by the build itself
		record(webLinks, href, page);
	}
}

// ---------------------------------------------------------------------------
// DOI verification (Handle System)
// ---------------------------------------------------------------------------

/** Handle System response codes we care about (RFC 3652 / handle.net API). */
const HANDLE_FOUND = 1;
const HANDLE_NOT_FOUND = 100;

async function checkDoi(doi) {
	const url = `https://doi.org/api/handles/${encodeURIComponent(doi)}`;
	for (let attempt = 1; attempt <= ATTEMPTS; attempt++) {
		try {
			const res = await request(url, 'GET');
			// The API answers 404 *with* a JSON body for an unregistered handle,
			// so the body is the source of truth, not the HTTP status.
			const data = await res.json();
			if (data?.responseCode === HANDLE_FOUND) return { doi, status: 'ok' };
			if (data?.responseCode === HANDLE_NOT_FOUND) {
				return { doi, status: 'dead', reason: 'DOI is not registered (Handle System)' };
			}
			// Any other response code is a Handle-side oddity, not evidence of rot.
			return {
				doi,
				status: 'inconclusive',
				reason: `unexpected Handle responseCode ${data?.responseCode}`
			};
		} catch {
			if (attempt < ATTEMPTS) await sleep(1500 * attempt);
		}
	}
	return { doi, status: 'inconclusive', reason: 'Handle System unreachable' };
}

// ---------------------------------------------------------------------------
// Web link verification
// ---------------------------------------------------------------------------

/**
 * Triage an HTTP status into rot vs. noise.
 *
 * Only 404/410 — the codes that actually mean "this resource is gone" — count
 * as dead. 401/403/405/406/429 and 5xx mean the server declined to answer a
 * robot, which says nothing about whether a human would see the page.
 */
function classify(status) {
	if (status >= 200 && status < 400) return 'ok';
	if (status === 404 || status === 410) return 'dead';
	return 'blocked';
}

async function checkWebLink(url) {
	const host = new URL(url).hostname.toLowerCase();
	if (isUncheckable(host)) return { url, status: 'unverified', reason: `${host} blocks robots` };

	let lastError = null;
	for (let attempt = 1; attempt <= ATTEMPTS; attempt++) {
		try {
			// HEAD first (cheap, no body). Plenty of servers mishandle it, so any
			// non-success falls through to a real GET before we judge the link.
			let res = await request(url, 'HEAD');
			if (!res.ok) res = await request(url, 'GET');

			const verdict = classify(res.status);
			if (verdict === 'ok') return { url, status: 'ok' };
			if (verdict === 'dead') return { url, status: 'dead', reason: `HTTP ${res.status}` };
			return { url, status: 'unverified', reason: `HTTP ${res.status} (robot blocked)` };
		} catch (err) {
			lastError = err;
			if (attempt < ATTEMPTS) await sleep(1500 * attempt);
		}
	}

	// Distinguish "the host no longer exists" (real rot, and the single most
	// common way an academic link dies) from a timeout, which is usually us.
	const cause = lastError?.cause?.code ?? lastError?.name ?? String(lastError);
	if (cause === 'ENOTFOUND' || cause === 'EAI_AGAIN') {
		return { url, status: 'dead', reason: 'domain does not resolve' };
	}
	if (cause === 'TimeoutError') {
		return { url, status: 'inconclusive', reason: 'timed out' };
	}
	return { url, status: 'inconclusive', reason: `network error (${cause})` };
}

// ---------------------------------------------------------------------------
// Wayback Machine fallback
// ---------------------------------------------------------------------------

/** Look for an archived snapshot so the report can propose a replacement. */
async function wayback(url) {
	try {
		const res = await request(
			`https://archive.org/wayback/available?url=${encodeURIComponent(url)}`,
			'GET'
		);
		if (!res.ok) return null;
		const data = await res.json();
		const snap = data?.archived_snapshots?.closest;
		return snap?.available ? snap.url : null;
	} catch {
		return null; // the suggestion is a nicety; never let it fail the run
	}
}

// ---------------------------------------------------------------------------
// Run
// ---------------------------------------------------------------------------

const doiList = only === 'web' ? [] : [...dois.keys()].sort();
const webList = only === 'doi' ? [] : [...webLinks.keys()].sort();

console.log(
	`[check-links] ${htmlFiles.length} pages → ${doiList.length} DOIs, ${webList.length} other external links`
);

const doiResults = await pool(doiList, CONCURRENCY, checkDoi);
const webResults = await pool(webList, CONCURRENCY, checkWebLink);

const dead = [
	...doiResults
		.filter((r) => r.status === 'dead')
		.map((r) => ({ ...r, url: `https://doi.org/${r.doi}`, pages: dois.get(r.doi) })),
	...webResults
		.filter((r) => r.status === 'dead')
		.map((r) => ({ ...r, pages: webLinks.get(r.url) }))
];

// Only dead links get a Wayback lookup — that keeps the extra requests
// proportional to the number of real problems, which is normally zero.
for (const item of dead) item.snapshot = await wayback(item.url);

const inconclusive = [
	...doiResults
		.filter((r) => r.status === 'inconclusive')
		.map((r) => ({ ...r, url: `https://doi.org/${r.doi}` })),
	...webResults.filter((r) => r.status === 'inconclusive')
];
const unverified = webResults.filter((r) => r.status === 'unverified');
const okCount =
	doiResults.filter((r) => r.status === 'ok').length +
	webResults.filter((r) => r.status === 'ok').length;

// ---------------------------------------------------------------------------
// Report
// ---------------------------------------------------------------------------

const lines = [];
const pagesOf = (item) =>
	[...(item.pages ?? [])]
		.slice(0, 5)
		.map((p) => `\`${p}\``)
		.join(', ') + ((item.pages?.size ?? 0) > 5 ? ` +${item.pages.size - 5} more` : '');

if (dead.length) {
	lines.push(`## ${dead.length} dead link${dead.length === 1 ? '' : 's'}`, '');
	for (const item of dead) {
		lines.push(`- ${item.url}`);
		lines.push(`  - **${item.reason}**`);
		lines.push(`  - Linked from: ${pagesOf(item)}`);
		if (item.snapshot) lines.push(`  - Wayback snapshot: ${item.snapshot}`);
		else lines.push('  - No Wayback snapshot found.');
	}
	lines.push('');
}

if (inconclusive.length) {
	lines.push(
		`## ${inconclusive.length} inconclusive`,
		'',
		'Timed out or errored on the network. Usually transient — worth a look only if the same link recurs week after week.',
		''
	);
	for (const item of inconclusive) lines.push(`- ${item.url} — ${item.reason}`);
	lines.push('');
}

lines.push(
	'## Coverage',
	'',
	`- ${okCount} links verified reachable`,
	`- ${unverified.length} not verifiable over HTTP (host blocks robots) — any DOI pointing at these was still verified via the Handle System`,
	`- ${dead.length} dead, ${inconclusive.length} inconclusive`,
	''
);

if (unverified.length) {
	lines.push('<details><summary>Links no robot can check</summary>', '');
	for (const item of unverified) lines.push(`- ${item.url} — ${item.reason}`);
	lines.push('', '</details>', '');
}

const report = lines.join('\n');

if (reportPath) writeFileSync(reportPath, report, 'utf8');

console.log(`\n${report}`);
console.log(
	dead.length
		? `[check-links] FAIL — ${dead.length} dead link(s).`
		: '[check-links] OK — no dead links.'
);

exit(dead.length ? 1 : 0);
