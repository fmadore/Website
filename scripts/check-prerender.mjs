/**
 * Prerender coverage guard.
 *
 * The detail routes (`/publications/[id]`, `/communications/[id]`, …) declare
 * no `entries`, so SvelteKit decides what to prerender by crawling links out of
 * pages it has already rendered. That only reaches items something links to.
 * The index pages build their lists on the client, so they contribute no
 * crawlable anchors, and an item reachable by no other route — no "recent" slot
 * on the home page, no related-items card, no inline `<ItemReference>` — never
 * gets prerendered at all.
 *
 * Nothing catches that today, and the failure is worse than a missing page:
 * `sitemap.xml` is generated from the datasets rather than from the build
 * output, so every one of those URLs is still advertised to search engines and
 * 404s when anyone follows it. Every existing test passes while this happens —
 * the data is valid, the route is correct, the page simply does not exist.
 *
 * The check is therefore stated as the invariant that actually matters: every
 * URL the site advertises must resolve to a file the site ships. Reading the
 * expected set from the built sitemap rather than from the datasets keeps this
 * script free of module loading (several data files use runtime `$lib`
 * imports that plain Node cannot resolve) and automatically covers every route
 * type, including any added later.
 *
 * Usage:
 *   node scripts/check-prerender.mjs
 *
 * Exit code 1 when any advertised URL has no corresponding page.
 */
import { existsSync, readFileSync } from 'node:fs';
import { exit } from 'node:process';

const BUILD_DIR = 'build';
const SITEMAP = `${BUILD_DIR}/sitemap.xml`;

if (!existsSync(SITEMAP)) {
	console.error(`[prerender] No ${SITEMAP}. Run \`npm run build\` first.`);
	exit(1);
}

const xml = readFileSync(SITEMAP, 'utf8');
const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(([, url]) => url.trim());

if (locs.length === 0) {
	console.error('[prerender] sitemap.xml contains no <loc> entries — generator regression.');
	exit(1);
}

/**
 * Map an advertised URL to the file the static adapter would emit for it.
 * `/publications/foo` ships as either `publications/foo.html` or
 * `publications/foo/index.html` depending on the trailing-slash setting, so
 * accept both rather than pin the check to one.
 */
function pageExists(url) {
	let path;
	try {
		path = new URL(url).pathname;
	} catch {
		return null; // malformed <loc> — reported as missing
	}
	path = path.replace(/\/+$/, ''); // normalise trailing slash
	if (path === '') return existsSync(`${BUILD_DIR}/index.html`);
	// Routes that already name a file (/rss.xml, /sitemap.xml, /llms.txt) ship
	// as that file, not as HTML.
	if (/\.[a-z0-9]+$/i.test(path)) return existsSync(`${BUILD_DIR}${path}`);
	return existsSync(`${BUILD_DIR}${path}.html`) || existsSync(`${BUILD_DIR}${path}/index.html`);
}

const missing = locs.filter((url) => !pageExists(url));

console.log(
	`[prerender] ${locs.length} URLs advertised in sitemap.xml, ${missing.length} with no page`
);

if (missing.length) {
	// Group by route section: a whole collection failing to prerender reads very
	// differently from one stray item, and the grouping makes that obvious.
	const bySection = new Map();
	for (const url of missing) {
		const section = new URL(url).pathname.split('/').filter(Boolean)[0] ?? '(root)';
		if (!bySection.has(section)) bySection.set(section, []);
		bySection.get(section).push(new URL(url).pathname);
	}

	console.error(
		'\n[prerender] FAIL — the sitemap points search engines at pages that do not exist.\n'
	);
	for (const [section, paths] of [...bySection].sort((a, b) => b[1].length - a[1].length)) {
		console.error(`  ${section} — ${paths.length} missing`);
		for (const p of paths.sort()) console.error(`    ${p}`);
	}
	console.error(
		'\nThese items are in the datasets (so the sitemap lists them) but nothing links to them,' +
			'\nso the prerender crawler never reaches them. Fix by exporting `entries` from the' +
			'\naffected `[id]/+page.ts`, which makes SvelteKit prerender every item rather than only' +
			'\nthose it can discover by following links.\n'
	);
	exit(1);
}

console.log(`[prerender] OK — every advertised URL resolves to a page.`);
