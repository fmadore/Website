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
 * Usage:
 *   node scripts/check-structured-data.mjs
 *
 * Exit code 1 when any block fails to parse or carries a bad URL or date.
 */
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { exit } from 'node:process';
import { extractJsonLdBlocks, structuredDataProblems } from './lib/structured-data.mjs';

const BUILD_DIR = 'build';

if (!existsSync(`${BUILD_DIR}/index.html`)) {
	console.error(`[structured-data] No ${BUILD_DIR}/index.html. Run \`npm run build\` first.`);
	exit(1);
}

function htmlFiles(dir) {
	return readdirSync(dir).flatMap((name) => {
		const path = join(dir, name);
		if (statSync(path).isDirectory()) return htmlFiles(path);
		return path.endsWith('.html') ? [path] : [];
	});
}

const pages = htmlFiles(BUILD_DIR);
/** problem description → pages it occurs on */
const failures = new Map();
let blocks = 0;

for (const file of pages) {
	const page = `/${relative(BUILD_DIR, file).replaceAll('\\', '/')}`;
	for (const body of extractJsonLdBlocks(readFileSync(file, 'utf8'))) {
		blocks += 1;
		let data;
		try {
			data = JSON.parse(body);
		} catch (err) {
			const key = `unparseable JSON-LD: ${err.message}`;
			failures.set(key, [...(failures.get(key) ?? []), page]);
			continue;
		}
		for (const { key, value, problem } of structuredDataProblems(data)) {
			const description = `${key}: ${problem} — ${JSON.stringify(value)}`;
			failures.set(description, [...(failures.get(description) ?? []), page]);
		}
	}
}

console.log(`[structured-data] ${blocks} JSON-LD blocks on ${pages.length} pages`);

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
		'\nBuild JSON-LD addresses with `siteUrl()` from $lib/utils/siteHelpers (never from' +
			"\nKit's `base`, which is page-relative), and dates with `formatJsonLdDate()`.\n"
	);
	exit(1);
}

console.log('[structured-data] OK — every URL is absolute and every date is ISO 8601.');
