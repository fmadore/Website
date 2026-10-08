/**
 * Pure checks for the JSON-LD a built page ships, used by
 * `scripts/check-structured-data.mjs` and tested in
 * `scripts/structured-data.test.mjs`.
 *
 * Two invariants, both of which the build once broke on most of its pages:
 *
 *   1. Every URL-valued field is absolute. Structured data is read out of
 *      context — by a search engine, a knowledge graph, a harvester or an agent
 *      — with no page to resolve a relative path against. On this site's own
 *      origin it must be exactly `https://www.frederickmadore.com/…`: gluing
 *      Kit's page-relative `base` to the origin once shipped
 *      `https://www.frederickmadore.com../activities` in every breadcrumb.
 *   2. Every date is a valid ISO 8601 date or date-time. Year- and
 *      month-dated records once shipped `2017T00:00:00+01:00`, which is neither.
 */

/** The production origin. Mirrors `website.url` in src/lib/data/siteConfig.ts; a test binds them. */
export const SITE_ORIGIN = 'https://www.frederickmadore.com';

/** schema.org properties whose value is a URL (or a node id, which must be one too). */
const URL_KEY = /^(@id|url|item|image|logo|sameAs|license|urlTemplate)$|Url$/;

/** schema.org properties whose value is a Date or DateTime. */
const DATE_KEY = /^date[A-Z]|Date$/;

/**
 * Pulls the body of every `application/ld+json` script out of a page.
 * Attribute order does not matter; the body is returned unparsed.
 */
export function extractJsonLdBlocks(html) {
	return [
		...html.matchAll(
			/<script\b[^>]*\btype=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi
		)
	].map(([, body]) => body);
}

const pad = (n) => String(n).padStart(2, '0');

/**
 * True for an ISO 8601 calendar date at any precision this site uses — `2017`,
 * `2017-05`, `2017-05-12` — or a date-time with an optional offset, and only
 * when every component is in range (no 2017-13, no 30 February).
 */
export function isIsoDate(value) {
	const match =
		/^(\d{4})(?:-(\d{2})(?:-(\d{2})(?:T(\d{2}):(\d{2})(?::(\d{2})(?:\.\d+)?)?(?:Z|[+-](\d{2}):(\d{2}))?)?)?)?$/.exec(
			value
		);
	if (!match) return false;
	const [, year, month, day, hour, minute, second, offsetHour, offsetMinute] = match;
	if (month !== undefined && (+month < 1 || +month > 12)) return false;
	if (day !== undefined) {
		// Round-tripping through UTC rejects a day the month does not have.
		const date = new Date(Date.UTC(+year, +month - 1, +day));
		if (
			`${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())}` !==
			`${year}-${month}-${day}`
		)
			return false;
	}
	if (hour !== undefined && (+hour > 23 || +minute > 59)) return false;
	if (second !== undefined && +second > 59) return false;
	if (offsetHour !== undefined && (+offsetHour > 14 || +offsetMinute > 59)) return false;
	return true;
}

/**
 * Why a URL value is unacceptable, or null when it is fine: absolute http(s),
 * and on this site's own host, exactly the https `www` origin.
 */
export function urlProblem(value, origin = SITE_ORIGIN) {
	if (!/^https?:\/\//i.test(value)) return 'not an absolute URL';
	let url;
	try {
		url = new URL(value);
	} catch {
		return 'not a parseable URL';
	}
	const ownHost = new URL(origin).hostname.replace(/^www\./, '');
	const host = url.hostname.replace(/\.+$/, '');
	if (host === ownHost || host.endsWith(`.${ownHost}`)) {
		// Subdomains (the slide decks) are their own sites; only the main host
		// must be spelled exactly as the canonical origin.
		const mainHost = host === ownHost || host === `www.${ownHost}`;
		if (mainHost && value !== origin && !value.startsWith(`${origin}/`)) {
			return `not on the canonical origin ${origin}/`;
		}
	}
	return null;
}

/**
 * Every problem in one parsed JSON-LD value, as `{ key, value, problem }`.
 * Walks the whole tree — `@graph`, nested nodes, arrays — so a property is
 * checked wherever it sits.
 */
export function structuredDataProblems(data, origin = SITE_ORIGIN) {
	const problems = [];
	const visit = (node, key) => {
		if (Array.isArray(node)) {
			for (const item of node) visit(item, key);
			return;
		}
		if (node && typeof node === 'object') {
			for (const [childKey, child] of Object.entries(node)) visit(child, childKey);
			return;
		}
		if (typeof node !== 'string') return;
		if (URL_KEY.test(key) || /^https?:\/\//i.test(node)) {
			const problem = urlProblem(node, origin);
			if (problem) problems.push({ key, value: node, problem });
		}
		if (DATE_KEY.test(key) && !isIsoDate(node)) {
			problems.push({ key, value: node, problem: 'not an ISO 8601 date' });
		}
	};
	visit(data, '');
	return problems;
}
