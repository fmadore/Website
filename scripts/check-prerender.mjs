/**
 * Prerender coverage guard.
 *
 * Detail routes export explicit entries so every dataset item is prerendered.
 * Index pagination and related-item links alone cannot discover the whole corpus.
 * The sitemap is generated independently from the build, so this guard catches
 * any regression that advertises a URL without shipping its document.
 *
 * The check is therefore stated as the invariant that actually matters: every
 * URL the site advertises must resolve to a file the site ships. Reading the
 * expected set from the built sitemap rather than from the datasets keeps this
 * script free of module loading (several data files use runtime `$lib`
 * imports that plain Node cannot resolve) and automatically covers every route
 * type, including any added later.
 *
 * It also holds the Markdown twins (`/…/*.md`, llms.txt v2) to the same
 * standard: a page that announces a twin with `<link rel="alternate"
 * type="text/markdown">` must ship it, a twin shipped beside a page must be
 * announced by that page, the sitemap must not list twins (it advertises web
 * pages), and every link `/llms.txt` makes into the site must resolve.
 *
 * Usage:
 *   node scripts/check-prerender.mjs
 *
 * Exit code 1 when any advertised URL has no corresponding page.
 */
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { exit } from 'node:process';
import { brokenLlmsLinks, checkMarkdownTwins } from './lib/markdown-twins.mjs';

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

// ── Markdown twins ─────────────────────────────────────────────────────────────

const origin = new URL(locs[0]).origin;
const files = readdirSync(BUILD_DIR, { recursive: true, withFileTypes: true })
	.filter((entry) => entry.isFile())
	.map((entry) => `${entry.parentPath}/${entry.name}`.replace(/\\/g, '/'))
	.map((path) => path.slice(BUILD_DIR.length + 1));
const twins = checkMarkdownTwins({
	files,
	read: (file) => readFileSync(`${BUILD_DIR}/${file}`, 'utf8'),
	origin
});
const twinsInSitemap = locs.filter((url) => url.endsWith('.md'));
const llmsBroken = existsSync(`${BUILD_DIR}/llms.txt`)
	? brokenLlmsLinks({ text: readFileSync(`${BUILD_DIR}/llms.txt`, 'utf8'), files, origin })
	: [`${BUILD_DIR}/llms.txt is missing`];

console.log(`[prerender] ${twins.announced} pages announce a Markdown twin`);

const problems = [
	...twins.missing.map(
		({ page, href }) => `${page} announces ${href}, which the build did not ship`
	),
	...twins.foreign.map(({ page, href }) => `${page} announces a twin off the site: ${href}`),
	...twins.unannounced.map((twin) => `${twin} ships, but its page does not announce it`),
	...twinsInSitemap.map((url) => `sitemap.xml lists a Markdown twin: ${url}`),
	...llmsBroken.map((href) => `llms.txt links to ${href}, which the build did not ship`)
];

if (problems.length) {
	console.error('\n[prerender] FAIL — the Markdown twins and the pages disagree.\n');
	for (const problem of problems) console.error(`  ${problem}`);
	console.error(
		'\nTwins are the `*.md` server routes; pages announce them from SEO.svelte by route id' +
			'\n(`$lib/utils/markdownTwin.ts`). A new record route needs both, or neither.\n'
	);
	exit(1);
}

console.log('[prerender] OK — every twin is announced and shipped, and llms.txt resolves.');
