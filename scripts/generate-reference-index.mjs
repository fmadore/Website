/**
 * Build-time generator for the slim reference index consumed by
 * `<ItemReference>` (src/lib/components/reference/ItemReference.svelte).
 *
 * Why: ItemReference used to import the full `allPublications` +
 * `allCommunications` datasets (~117 KiB on the wire) purely to resolve a
 * handful of inline citations and their hover previews. That dominated home-page
 * LCP/TBT. This script projects each publication/communication record down to
 * the few fields the link + preview actually render, and emits a static literal
 * module — so reference-using pages no longer bundle the heavy datasets.
 *
 * How: every data item file uses only `import type` (verified), so Node's
 * native TS type-stripping (Node >= 24) can `import()` each one directly — no
 * Vite, no bundler. Run automatically via the npm `prebuild` hook, or manually
 * with `npm run gen:refs`. Output is deterministic (sorted keys) to avoid churn.
 */
import { globSync } from 'node:fs';
import { writeFileSync } from 'node:fs';
import { resolve, basename } from 'node:path';
import { pathToFileURL } from 'node:url';

const OUT_FILE = 'src/lib/data/referenceIndex.generated.ts';
// Tiny companion index: only the fields <ReferenceLink> needs to render an inline
// citation without a hover (itemType + precomputed citation text + title). This is
// statically imported (eager) while the full index above is loaded lazily on first
// hover — so reference-using pages no longer bundle all preview data up front.
const CITE_FILE = 'src/lib/data/referenceCitations.generated.ts';

/** Files that are not data items (aggregators, filter stores, templates). */
function isDataItem(file) {
	const name = basename(file);
	return (
		name !== 'index.ts' &&
		!name.endsWith('.svelte.ts') &&
		!name.includes('template') &&
		name.endsWith('.ts')
	);
}

/** Pick the exported data object (the one export shaped like a record). */
function pickRecord(mod) {
	return Object.values(mod).find((v) => v && typeof v === 'object' && typeof v.id === 'string');
}

/** Project a full record down to the slim, render-only fields. */
function slim(obj, itemType) {
	const e = { id: obj.id, itemType, title: obj.title, authors: obj.authors ?? [] };
	if (obj.type) e.type = obj.type;
	if (obj.date) e.date = obj.date;
	if (obj.dateISO) e.dateISO = obj.dateISO;
	if (typeof obj.year === 'number') e.year = obj.year;
	if (obj.image) e.image = obj.image;
	if (obj.heroImage?.src) e.heroImage = { src: obj.heroImage.src };
	// Type-specific meta-line fields only (matches ReferencePreviewCard's
	// per-type rendering). Keeps the index minimal and the types precise — e.g.
	// publication `country` is string[] and never rendered, so it's omitted.
	if (itemType === 'publication') {
		if (obj.journal) e.journal = obj.journal;
		if (obj.book) e.book = obj.book;
		if (obj.publisher) e.publisher = obj.publisher;
	} else {
		if (obj.conference) e.conference = obj.conference;
		if (obj.location) e.location = obj.location;
		if (obj.country) e.country = obj.country;
		if (obj.episode !== undefined && obj.episode !== null) e.episode = obj.episode;
	}
	return e;
}

/** Year string for the inline citation — mirrors ReferenceLink.getYear exactly
 * (including its substring(0,4) behaviour) so rendered citations don't change. */
function citeYear(e) {
	if (e.dateISO) return e.dateISO.substring(0, 4);
	if (e.date) return e.date.substring(0, 4);
	if (typeof e.year === 'number') return String(e.year);
	return 'N/D';
}

/** Author citation text — mirrors ReferenceLink.getAuthorCitation exactly. */
function citeAuthors(e) {
	const authors = e.authors;
	if (!authors || authors.length === 0) return 'N/A';
	const last = authors.map((a) => (typeof a === 'string' ? a.split(' ').pop() || 'N/A' : 'N/A'));
	if (last.length === 1) return last[0];
	if (last.length === 2) return `${last[0]} and ${last[1]}`;
	return `${last[0]} et al.`;
}

/** Tiny inline-citation projection from a slim entry. */
function citationOf(e) {
	return { itemType: e.itemType, cite: `(${citeAuthors(e)}, ${citeYear(e)})`, title: e.title };
}

async function collect(globPattern, itemType) {
	const files = globSync(globPattern).filter(isDataItem);
	const entries = [];
	for (const file of files) {
		const mod = await import(pathToFileURL(resolve(file)).href);
		const record = pickRecord(mod);
		if (!record || record.id.includes('template')) continue;
		entries.push(slim(record, itemType));
	}
	return entries;
}

// Publications first: they win on id conflicts, mirroring ItemReference's
// lookup order (it checks allPublications before allCommunications).
const pubEntries = await collect('src/lib/data/publications/**/*.ts', 'publication');
const commEntries = await collect('src/lib/data/communications/**/*.ts', 'communication');

const merged = {};
const conflicts = [];
for (const entry of [...pubEntries, ...commEntries]) {
	if (merged[entry.id]) {
		conflicts.push(entry.id);
		continue;
	}
	merged[entry.id] = entry;
}

// Deterministic key order to keep diffs minimal.
const index = {};
for (const id of Object.keys(merged).sort((a, b) => a.localeCompare(b))) {
	index[id] = merged[id];
}

if (conflicts.length) {
	console.warn(
		`[gen:refs] ${conflicts.length} id(s) in both datasets; kept the publication: ${conflicts.join(', ')}`
	);
}

// Citations map shares the full index's key order so diffs stay aligned.
const citations = {};
for (const id of Object.keys(index)) {
	citations[id] = citationOf(index[id]);
}

const AUTOGEN = `// AUTO-GENERATED by scripts/generate-reference-index.mjs — DO NOT EDIT.
// Regenerate with \`npm run gen:refs\` (runs automatically via the prebuild hook).
/* eslint-disable */
`;

const fullBanner = `${AUTOGEN}import type { ReferenceIndexEntry } from '$lib/types/referenceIndex';

export const referenceIndex: Record<string, ReferenceIndexEntry> = `;

const citeBanner = `${AUTOGEN}import type { ReferenceCitationEntry } from '$lib/types/referenceIndex';

export const referenceCitations: Record<string, ReferenceCitationEntry> = `;

writeFileSync(OUT_FILE, fullBanner + JSON.stringify(index, null, '\t') + ';\n', 'utf8');
writeFileSync(CITE_FILE, citeBanner + JSON.stringify(citations, null, '\t') + ';\n', 'utf8');
console.log(
	`[gen:refs] Wrote ${Object.keys(index).length} entries → ${OUT_FILE} (full) + ${CITE_FILE} (citations)`
);
