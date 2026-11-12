/**
 * Document overhead guard: the markup around the words, on the pages whose
 * words grow.
 *
 * Lighthouse budgets each audited document at a fixed transfer size
 * (`resource-summary:document:size` in lighthouserc.yml). That is the right
 * budget for a page whose content is fixed and the wrong one for the CV, which
 * gains a few entries every month: sooner or later a fixed cap fails a pull
 * request that only recorded a talk. So the long, growing documents are held
 * here to what should *not* grow with their content, measured in three parts
 * (`document-overhead.mjs`):
 *
 *   shell            everything outside the content container, JSON-LD aside:
 *                    head and inline CSS, masthead, footer, Kit's bootstrap.
 *                    Ceiling in gzip bytes.
 *   density          gzip(container markup) ÷ gzip(container text). Flat, or
 *                    falling slightly, as entries are added; it rises when each
 *                    entry carries more markup.
 *   structured data  the JSON-LD blocks. Ceiling in gzip bytes.
 *
 * This is the tripwire; Lighthouse keeps a per-page document ceiling for /cv
 * as the backstop for a step change. A breach names the part that grew and by
 * how much since the recorded baseline. If the growth is intended, re-measure,
 * record the new baseline and ceiling here, and name the change in the commit.
 *
 * Usage (after `npm run build`):
 *   node scripts/checks/check-documents.mjs
 *
 * Exit code 1 when any part of any page is over its ceiling.
 */
import { existsSync, readFileSync } from 'node:fs';
import { exit } from 'node:process';
import { evaluateBudget, measureDocument, summarise } from './document-overhead.mjs';

const BUILD_DIR = 'build';

/**
 * The long documents, the element that holds each one's content, and its
 * budget. Baselines measured on the build of 2026-11-12 (gzip at zlib's
 * default level). Ceilings leave about 4% on the shell (≈1.2 kB: a new block
 * of global CSS, an inline icon set), 3–5% on the density (≈1 kB of markup on
 * /cv) and ≈0.3 kB on the JSON-LD.
 *
 * The visualisation pages draw their charts as inline SVG, which is markup
 * without text: their density rises by a bar or a cell with each new year of
 * data, so their density headroom is a few years, not forever.
 */
const PAGES = [
	{
		path: '/cv',
		container: 'cv-content',
		baseline: { shell: 27403, css: 16220, density: 1.646, structuredData: 1023 },
		ceiling: { shell: 28500, density: 1.7, structuredData: 1300 }
	},
	{
		path: '/publications',
		container: 'main',
		baseline: { shell: 26898, css: 17069, density: 3.86, structuredData: 1012 },
		ceiling: { shell: 28000, density: 4.0, structuredData: 1300 }
	},
	{
		path: '/conference-activity',
		container: 'main',
		// The JSON-LD carries one Event per organised workshop.
		baseline: { shell: 27166, css: 17314, density: 2.61, structuredData: 1841 },
		ceiling: { shell: 28300, density: 2.7, structuredData: 2300 }
	},
	{
		path: '/publications/visualisations',
		container: 'main',
		baseline: { shell: 28915, css: 18970, density: 4.952, structuredData: 1048 },
		ceiling: { shell: 30000, density: 5.2, structuredData: 1350 }
	},
	{
		path: '/conference-activity/visualisations',
		container: 'main',
		baseline: { shell: 28700, css: 18747, density: 6.274, structuredData: 1067 },
		ceiling: { shell: 29800, density: 6.6, structuredData: 1350 }
	}
];

if (!existsSync(BUILD_DIR)) {
	console.error(`[documents] No ${BUILD_DIR}/. Run \`npm run build\` first.`);
	exit(1);
}

let failed = false;
for (const page of PAGES) {
	const file = `${BUILD_DIR}${page.path}.html`;
	if (!existsSync(file)) {
		console.error(`[documents] ${page.path}: ${file} was not built.`);
		failed = true;
		continue;
	}
	let measure;
	try {
		measure = measureDocument(readFileSync(file, 'utf8'), page.container);
	} catch (error) {
		console.error(`[documents] ${page.path}: ${error.message}; update its container in PAGES.`);
		failed = true;
		continue;
	}
	const failures = evaluateBudget(measure, page);
	if (failures.length) {
		failed = true;
		for (const message of failures) console.error(`[documents] ${page.path}: ${message}`);
	} else {
		console.log(`[documents] ${summarise(page.path, measure, page)}`);
	}
}

if (failed) {
	console.error(
		'[documents] Markup overhead grew. Find what grew, or, if it is meant, record the new ' +
			'baseline and ceiling in scripts/checks/check-documents.mjs and name the change in the commit.'
	);
	exit(1);
}
console.log('[documents] Every long document is within its markup budget.');
