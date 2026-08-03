/**
 * Build-time extractor for research project narratives.
 *
 * Why: a research project's substantive text — two to three thousand words
 * across the five projects — lives as markup inside
 * `src/routes/research/<slug>/+page.svelte`, because the prose embeds
 * components (`<ItemReference>`, `<RelevantGrants>`) that cannot survive a
 * round-trip through a data file. That made it the one body of writing on the
 * site invisible to `/api/*.json`, and so to any agent reading the site
 * machine-side. This script lifts the plain text back out at build time, so the
 * route page stays the single place the prose is authored and the API still
 * carries it.
 *
 * How: the markup is regular enough to parse with regexes rather than a Svelte
 * compiler pass — the target is the children of `<ResearchProjectLayout>`, which
 * are plain `<p>`/`<h2>`/`<em>`/`<a>` plus two known components. Anything
 * unexpected raises rather than silently producing truncated prose.
 *
 * `<ItemReference id="…" />` renders as a citation whose text comes from the
 * reference index, so there is nothing to inline; the ids are collected into a
 * `references` array instead, matching how the rest of the API cross-references
 * by id.
 *
 * Output lands outside `src/lib/data/research/` on purpose: that directory is
 * globbed by `import.meta.glob` and a generated module there would be loaded as
 * a malformed research project.
 *
 * Modes:
 *   node scripts/generate-research-prose.mjs          # (re)write the file
 *   node scripts/generate-research-prose.mjs --check  # CI freshness check:
 *       regenerate in memory and exit 1 if the committed file is stale.
 */
import { globSync, readFileSync, writeFileSync } from 'node:fs';

const OUT_FILE = 'src/lib/data/researchProse.generated.ts';
const CHECK_MODE = process.argv.includes('--check');

/** Components that may appear in the prose and carry no text of their own. */
const DROPPABLE_COMPONENTS = ['RelevantGrants', 'ItemReference'];

const ENTITIES = {
	'&amp;': '&',
	'&lt;': '<',
	'&gt;': '>',
	'&quot;': '"',
	'&#39;': "'",
	'&apos;': "'",
	'&nbsp;': ' ',
	'&mdash;': '—',
	'&ndash;': '–',
	'&hellip;': '…'
};

const decode = (text) => text.replace(/&[#a-z0-9]+;/gi, (entity) => ENTITIES[entity] ?? entity);

/**
 * Extract the children of `<ResearchProjectLayout …>`. The opening tag can span
 * many lines and contain `{...spread}` expressions, so find its end by scanning
 * for the `>` that closes it rather than by regex.
 */
function layoutChildren(source, file) {
	const open = source.indexOf('<ResearchProjectLayout');
	if (open === -1) return null; // redirect stubs and other non-project pages
	const close = source.indexOf('</ResearchProjectLayout>');
	if (close === -1) throw new Error(`${file}: unterminated <ResearchProjectLayout>`);

	let depth = 0;
	let start = -1;
	for (let i = open; i < close; i += 1) {
		const char = source[i];
		if (char === '{') depth += 1;
		else if (char === '}') depth -= 1;
		else if (char === '>' && depth === 0) {
			start = i + 1;
			break;
		}
	}
	if (start === -1) throw new Error(`${file}: could not find the end of the opening tag`);
	return source.slice(start, close);
}

/** The slug this page renders, taken from its own data lookup. */
function slugOf(source, file) {
	const match = source.match(/researchProject\(\s*'([^']+)'\s*\)/);
	if (!match) throw new Error(`${file}: no researchProject('…') call to identify the project`);
	return match[1];
}

/** Ids cited inline, in document order, de-duplicated. */
function referencedIds(markup) {
	const ids = [...markup.matchAll(/<ItemReference\s+id="([^"]+)"/g)].map((match) => match[1]);
	return [...new Set(ids)];
}

/**
 * Reduce the markup to plain text: block elements become paragraphs separated by
 * a blank line, inline elements are unwrapped.
 */
function toPlainText(markup, file) {
	let text = markup;

	// Svelte control flow would need real parsing; none is used today, and
	// guessing at it would silently drop or duplicate prose.
	if (/\{#(if|each|await)/.test(text)) {
		throw new Error(
			`${file}: prose contains Svelte control flow, which this extractor cannot read`
		);
	}

	// Comments first, so a commented-out component does not trip the check below.
	text = text.replace(/<!--[\s\S]*?-->/g, '');

	for (const component of DROPPABLE_COMPONENTS) {
		text = text.replace(new RegExp(`<${component}\\b[\\s\\S]*?/>`, 'g'), '');
		text = text.replace(new RegExp(`<${component}\\b[\\s\\S]*?</${component}>`, 'g'), '');
	}

	// Any capitalised tag left is a component this script does not know about,
	// and dropping it blindly could discard prose.
	const unknown = text.match(/<([A-Z]\w+)/);
	if (unknown) throw new Error(`${file}: unhandled component <${unknown[1]}> in the prose`);

	// Block boundaries become paragraph breaks.
	text = text.replace(/<\/(p|h[1-6]|li|blockquote|figcaption)>/g, '\n\n');
	text = text.replace(/<br\s*\/?>/g, '\n');

	text = text.replace(/<[^>]+>/g, '');
	text = decode(text);

	return text
		.split('\n\n')
		.map((paragraph) => paragraph.replace(/\s+/g, ' ').trim())
		.filter(Boolean)
		.join('\n\n');
}

const pages = globSync('src/routes/research/*/+page.svelte').sort();
const prose = {};

for (const file of pages) {
	const source = readFileSync(file, 'utf8');
	const children = layoutChildren(source, file);
	if (children === null) continue;

	const slug = slugOf(source, file);
	const body = toPlainText(children, file);
	if (body.length < 200) throw new Error(`${file}: extracted only ${body.length} characters`);

	prose[slug] = { body, references: referencedIds(children) };
}

if (Object.keys(prose).length === 0) throw new Error('No research project pages found.');

const banner = `// AUTO-GENERATED by scripts/generate-research-prose.mjs — DO NOT EDIT.
// Regenerate with \`npm run gen:prose\` (runs automatically via the prebuild hook).
// The prose is authored in src/routes/research/<slug>/+page.svelte; this is the
// plain-text projection of it, so /api/research.json can carry the full text.
/* eslint-disable */
import type { ResearchProse } from '$lib/types/research';

export const researchProse: Record<string, ResearchProse> = `;

// Sorted keys keep the output deterministic, so --check only fails on real drift.
const sorted = Object.fromEntries(
	Object.keys(prose)
		.sort()
		.map((key) => [key, prose[key]])
);
const output = `${banner}${JSON.stringify(sorted, null, '\t')};\n`;

if (CHECK_MODE) {
	const current = readFileSync(OUT_FILE, 'utf8');
	if (current !== output) {
		console.error(
			`[gen:prose] --check FAILED: ${OUT_FILE} is stale. Run \`npm run gen:prose\` and commit.`
		);
		process.exit(1);
	}
	console.log(`[gen:prose] --check OK: ${OUT_FILE} is up to date (${pages.length} pages scanned).`);
} else {
	writeFileSync(OUT_FILE, output, 'utf8');
	const chars = Object.values(sorted).reduce((sum, entry) => sum + entry.body.length, 0);
	console.log(
		`[gen:prose] wrote ${OUT_FILE}: ${Object.keys(sorted).length} projects, ${chars} characters.`
	);
}
