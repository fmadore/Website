/**
 * Structured-data guard.
 *
 * Parses every `application/ld+json` block in the built pages and fails when a
 * URL-valued field is not an absolute URL on the canonical origin (or an
 * external one), or a date is not valid ISO 8601. Both defects shipped on most
 * of the site's pages before this check existed: breadcrumbs addressed to
 * `https://www.frederickmadore.com../…`, root-relative `url` and `image`
 * values, and `2017T00:00:00+01:00` as a publication date. Unit tests on the
 * builders missed them because each was fed a base path the build never uses;
 * this reads what the build actually ships. Rules: scripts/lib/structured-data.mjs.
 *
 * It holds the FAIR Signposting links to the same standard: every `describedby`
 * names its media type and, on this site, points at a file the build ships;
 * every Signposting landing page has one; and every BibTeX record the build
 * ships is named by its page. Rules: scripts/lib/signposting.mjs.
 *
 * And it holds every indexable page to a `<title>` of its own (the 404 and
 * offline pages and redirect stubs excepted). Rules:
 * scripts/checks/check-structured-data-titles.mjs.
 *
 * Usage:
 *   node scripts/checks/check-structured-data.mjs
 *
 * Exit code 1 when any block fails to parse or carries a bad URL or date, a
 * Signposting link and the files disagree, or two pages share a `<title>`.
 */
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { exit } from 'node:process';
import {
	SITE_ORIGIN,
	extractJsonLdBlocks,
	structuredDataProblems
} from '../lib/structured-data.mjs';
import { signpostingProblems } from '../lib/signposting.mjs';
import { duplicateTitles } from './check-structured-data-titles.mjs';

const BUILD_DIR = 'build';

if (!existsSync(`${BUILD_DIR}/index.html`)) {
	console.error(`[structured-data] No ${BUILD_DIR}/index.html. Run \`npm run build\` first.`);
	exit(1);
}

/** Every file in the build, as a site path (`/publications/x.html`). */
function sitePaths(dir) {
	return readdirSync(dir).flatMap((name) => {
		const path = join(dir, name);
		if (statSync(path).isDirectory()) return sitePaths(path);
		return [`/${relative(BUILD_DIR, path).replaceAll('\\', '/')}`];
	});
}

const shipped = new Set(sitePaths(BUILD_DIR));
const pages = [...shipped].filter((path) => path.endsWith('.html'));
/** A site path ships as itself, or as the page the static adapter writes for it. */
const ships = (path) =>
	shipped.has(path) || shipped.has(`${path}.html`) || shipped.has(`${path}/index.html`);

/** problem description → pages it occurs on */
const failures = new Map();
const fail = (description, page) =>
	failures.set(description, [...(failures.get(description) ?? []), page]);
const described = new Set();
const titled = [];
let blocks = 0;

for (const page of pages) {
	const html = readFileSync(`${BUILD_DIR}${page}`, 'utf8');
	titled.push({ path: page, html });
	for (const body of extractJsonLdBlocks(html)) {
		blocks += 1;
		let data;
		try {
			data = JSON.parse(body);
		} catch (err) {
			fail(`unparseable JSON-LD: ${err.message}`, page);
			continue;
		}
		for (const { key, value, problem } of structuredDataProblems(data)) {
			fail(`${key}: ${problem} — ${JSON.stringify(value)}`, page);
		}
	}

	const signposts = signpostingProblems({ html, origin: SITE_ORIGIN, ships });
	for (const problem of signposts.problems) fail(`Signposting: ${problem}`, page);
	for (const path of signposts.described) described.add(path);
}

// A metadata record no page names is invisible to a harvester following links.
for (const path of shipped) {
	if (path.endsWith('.bib') && !described.has(path)) {
		fail(`Signposting: ${path} ships, but no page names it with describedby`, path);
	}
}

// A search engine shows one result per title; a reader cannot tell them apart.
const sharedTitles = duplicateTitles(titled);
for (const [title, where] of sharedTitles) {
	for (const page of where) fail(`<title> shared by ${where.length} pages: ${title}`, page);
}

console.log(
	`[structured-data] ${blocks} JSON-LD blocks on ${pages.length} pages; ` +
		`${described.size} metadata documents named by describedby`
);

if (failures.size > 0) {
	const pagesAffected = new Set([...failures.values()].flat()).size;
	console.error(
		`\n[structured-data] FAIL — ${failures.size} distinct problems on ${pagesAffected} pages.\n`
	);
	for (const [description, where] of [...failures].sort((a, b) => b[1].length - a[1].length)) {
		const sample = where.slice(0, 3).join(', ');
		const more = where.length > 3 ? ` and ${where.length - 3} more` : '';
		console.error(`  ${description}\n    on ${sample}${more}`);
	}
	console.error(
		'\nBuild JSON-LD addresses with `siteUrl()` from #lib/utils/siteHelpers (never from' +
			"\nKit's `base`, which is page-relative), and dates with `formatJsonLdDate()`." +
			'\nSignposting links come from `publicationSignposts()` in #lib/utils/signposting.ts.' +
			'\nRecord page titles come from `recordPageTitle()` in #lib/utils/seoUtils.ts.\n'
	);
	exit(1);
}

console.log(
	'[structured-data] OK — every URL is absolute, every date is ISO 8601, ' +
		'every Signposting link resolves, and every page has a title of its own.'
);
