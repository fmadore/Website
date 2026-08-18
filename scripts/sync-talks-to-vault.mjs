// sync-talks-to-vault.mjs
// Generate Obsidian notes for every talk (communication) from the site's typed
// data in src/lib/data/communications/, wired to the vault's project, author and
// concept notes. Re-runnable: regenerates only the marked block, preserving
// anything the user adds below it, and never overwrites a manual note that has
// no marker.
//
//   node scripts/sync-talks-to-vault.mjs           # dry run (prints plan)
//   node scripts/sync-talks-to-vault.mjs --write   # write to the vault
//
// Requires OBSIDIAN_VAULT. There is no default: this file is committed to a
// public repository, and a hardcoded fallback would publish a local path.

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import {
	BEGIN,
	END,
	vaultRoot,
	walkData as walk,
	loadModule,
	normKey,
	noteIndex,
	sanitizeFilename,
	hyphenTag,
	yamlStr,
	spliceGenerated
} from './vault-sync-lib.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SITE_ROOT = path.resolve(__dirname, '..');
const DATA_DIR = path.join(SITE_ROOT, 'src/lib/data/communications');

const VAULT = vaultRoot();
const OUT_DIR = path.join(VAULT, 'Université/Communications');
const AUTEURS_DIR = path.join(VAULT, 'Zotero/Auteurs');
const CONCEPTS_DIR = path.join(VAULT, 'Zotero/Concepts');
const PROJECTS_DIR = path.join(VAULT, 'Tâches et projets/Projects');

const WRITE = process.argv.includes('--write');

// Talks whose subject is a workshop I built a hub for — link the hub too.
const HUB_BY_ID = {
	'stias-dh-ai-african-studies-workshop-2026': 'Point Sud 2026',
	'volkswagenstiftung-dh-ai-african-studies-workshop-2026': 'Volkswagen Scoping Workshops'
};

// Project field values whose vault note has a different basename (can't match by
// normalisation alone — e.g. the DRE hub lives under a different name).
const PROJECT_ALIASES = {
	'Digital Research Environment (University of Bayreuth)': 'Digital Research Environment (DRE)'
};

const SUBTYPE_FOLDER = {
	events: 'Events',
	panels: 'Panels',
	papers: 'Papers',
	podcasts: 'Podcasts',
	talks: 'Talks'
};

// ---- rendering -------------------------------------------------------------

function buildContext() {
	return {
		authors: noteIndex(AUTEURS_DIR),
		concepts: noteIndex(CONCEPTS_DIR),
		projects: noteIndex(PROJECTS_DIR, true)
	};
}

function linkAuthor(name, ctx) {
	if (name === 'Frédérick Madore') return '**Frédérick Madore**';
	const hit = ctx.authors.get(normKey(name));
	return hit ? `[[${hit}]]` : name;
}

function linkedConcepts(tags, ctx) {
	const out = [];
	for (const t of tags || []) {
		const hit = ctx.concepts.get(normKey(t));
		if (hit) out.push(`[[${hit}]]`);
	}
	return out;
}

function projectLink(project, ctx) {
	if (!project) return null;
	// Alias targets are known-good basenames that may live outside Projects/ (e.g. the DRE hub).
	if (PROJECT_ALIASES[project]) return `[[${PROJECT_ALIASES[project]}]]`;
	const hit = ctx.projects.get(normKey(project));
	return hit ? `[[${hit}]]` : project; // plain text if no vault note
}

function renderFrontmatter(c, ctx) {
	const langs = Array.isArray(c.language) ? c.language : c.language ? [c.language] : [];
	const lines = ['---', 'type: communication'];
	lines.push(`communication_type: ${c.type || 'talk'}`);
	if (c.dateISO) lines.push(`date: ${c.dateISO}`);
	if (c.year) lines.push(`year: ${c.year}`);
	if (c.conference) lines.push(`conference: ${yamlStr(c.conference)}`);
	if (c.location) lines.push(`location: ${yamlStr(c.location)}`);
	if (c.country) lines.push(`country: ${yamlStr(c.country)}`);
	if (langs.length) lines.push(`language: [${langs.join(', ')}]`);
	if (Array.isArray(c.authors) && c.authors.length) {
		lines.push('authors:');
		for (const a of c.authors) lines.push(`  - ${yamlStr(a)}`);
	}
	const proj = projectLink(c.project, ctx);
	if (proj && proj.startsWith('[[')) lines.push(`project: ${yamlStr(proj)}`);
	if (c.doi) lines.push(`doi: ${yamlStr(c.doi)}`);
	if (c.url) lines.push(`url: ${c.url}`);
	const tags = (c.tags || []).map(hyphenTag).filter(Boolean);
	if (tags.length) lines.push(`tags: [${tags.join(', ')}]`);
	lines.push('source: website');
	lines.push(`slug: ${c.id}`);
	lines.push('---');
	return lines.join('\n');
}

function renderGenerated(c, ctx) {
	const L = [];
	L.push(BEGIN);
	L.push(`# ${c.title}`);
	L.push('');
	const kind = (c.type || 'talk').replace(/^\w/, (m) => m.toUpperCase());
	const place = [c.location, c.country].filter(Boolean).join(', ');
	L.push(`> [!info] ${kind} · ${c.date}${place ? ' · ' + place : ''}`);
	if (c.conference && c.conference !== c.title) L.push(`> ${c.conference}`);
	const proj = projectLink(c.project, ctx);
	if (proj) L.push(`> Project: ${proj}`);
	if (HUB_BY_ID[c.id]) L.push(`> Workshop: [[${HUB_BY_ID[c.id]}]]`);
	const coAuthors = (c.authors || []).map((a) => linkAuthor(a, ctx)).join(', ');
	if (coAuthors) L.push(`> By: ${coAuthors}`);
	const concepts = linkedConcepts(c.tags, ctx);
	if (concepts.length) L.push(`> Topics: ${concepts.join(' · ')}`);
	L.push('');

	if (c.abstract) {
		L.push('## Abstract');
		L.push('');
		L.push(c.abstract.trim());
		L.push('');
	}

	if (Array.isArray(c.papers) && c.papers.length) {
		L.push('## Papers');
		for (const p of c.papers) {
			const who = (p.authors || []).map((a) => a.name).join(', ');
			L.push(`- **${p.title}**${who ? ' — ' + who : ''}`);
		}
		L.push('');
	}

	if (Array.isArray(c.participants) && c.participants.length) {
		L.push('## Participants');
		for (const p of c.participants) {
			const role = p.role ? ` (${p.role})` : '';
			const aff = p.affiliation ? ` — ${p.affiliation}` : '';
			L.push(`- ${linkAuthor(p.name, ctx)}${role}${aff}`);
		}
		L.push('');
	}

	const urls = [];
	if (c.url) urls.push(`[${c.urlLabel || 'Link'}](${c.url})`);
	if (c.slidesUrl) urls.push(`[Slides](${c.slidesUrl})`);
	for (const u of c.additionalUrls || []) urls.push(`[${u.label}](${u.url})`);
	if (c.doi) urls.push(`[DOI](https://doi.org/${c.doi})`);
	if (urls.length) {
		L.push('## Links');
		L.push(urls.join(' · '));
		L.push('');
	}

	L.push(
		`*Generated from the website record (\`${c.id}\`). Edits below the marker are preserved on re-sync.*`
	);
	L.push(END);
	return L.join('\n');
}

// ---- main ------------------------------------------------------------------

const files = walk(DATA_DIR);
const comms = [];
for (const f of files) {
	try {
		const c = await loadModule(f);
		if (c && c.id && c.title) comms.push({ c, subtype: path.basename(path.dirname(f)) });
	} catch (err) {
		console.error('FAILED to load', path.relative(SITE_ROOT, f), '-', err.message);
	}
}

const ctx = buildContext();
const stats = { created: 0, updated: 0, skipped: 0, byType: {} };
const unmatchedProjects = new Set();

for (const { c, subtype } of comms) {
	const folder = SUBTYPE_FOLDER[subtype] || 'Talks';
	stats.byType[folder] = (stats.byType[folder] || 0) + 1;
	if (c.project && !projectLink(c.project, ctx).startsWith('[[')) unmatchedProjects.add(c.project);

	const dir = path.join(OUT_DIR, folder);
	const fname = `${c.year || ''} ${sanitizeFilename(c.title)}`.trim() + '.md';
	const full = path.join(dir, fname);

	const generated = renderGenerated(c, ctx);
	let content;
	let action;

	// Read the existing note in one shot instead of existsSync()-then-read: a
	// stat-then-use pair is a TOCTOU race. ENOENT simply means "create fresh".
	let existing = null;
	try {
		existing = readFileSync(full, 'utf8');
	} catch (err) {
		if (err.code !== 'ENOENT') throw err;
	}

	if (existing !== null) {
		if (existing.includes(BEGIN)) {
			content = spliceGenerated(existing, generated);
			action = 'updated';
		} else {
			action = 'skipped'; // manual note without a marker — don't touch
		}
	} else {
		content = `${renderFrontmatter(c, ctx)}\n\n${generated}\n\n## My notes\n`;
		action = 'created';
	}

	stats[action]++;
	if (WRITE && content) {
		mkdirSync(dir, { recursive: true });
		writeFileSync(full, content, 'utf8');
	}
	if (!WRITE) console.log(`${action.padEnd(8)} ${folder}/${fname}`);
}

console.log('\n--- summary ---');
console.log('talks loaded:', comms.length);
console.log('by folder:', JSON.stringify(stats.byType));
console.log(
	`created: ${stats.created}  updated: ${stats.updated}  skipped(manual): ${stats.skipped}`
);
if (unmatchedProjects.size)
	console.log('project values with no vault note (left as text):', [...unmatchedProjects]);
console.log(WRITE ? '\nWROTE to vault.' : '\nDRY RUN — re-run with --write to apply.');
