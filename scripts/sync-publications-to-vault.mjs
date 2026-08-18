// sync-publications-to-vault.mjs
// Generate one Obsidian note per publication from the site's typed data, in
// Université/Publications/Records/.
//
//   node scripts/sync-publications-to-vault.mjs           # dry run
//   node scripts/sync-publications-to-vault.mjs --write   # apply
//
// Requires OBSIDIAN_VAULT.
//
// These records are deliberately thin. The vault already holds the bibliography
// (Zotero `@citekey.md` notes) and the full texts (Publications/Textes/), so
// duplicating either would be a third source of truth to keep in step. What a
// record adds is what only the website knows — the project a publication belongs
// to, who cites it, who reviewed it, its table of contents, and the id that
// talks and research prose cross-reference — plus links out to the Zotero note
// and the full text, so the three stay one click apart.
//
// Ownership matches sync-projects-to-vault.mjs: the marked block and a small set
// of frontmatter keys are rewritten every run, everything else is written once.

import { readFileSync, writeFileSync, mkdirSync, readdirSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import {
	BEGIN,
	END,
	vaultRoot,
	walkData,
	loadModule,
	normTitle,
	noteIndexByKey,
	sanitizeFilename,
	hyphenTag,
	yamlStr,
	splitNote,
	setFrontmatterKeys,
	spliceGenerated
} from './vault-sync-lib.mjs';

const SITE_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const VAULT = vaultRoot();
const OUT_DIR = path.join(VAULT, 'Université/Publications/Records');
const TEXTES_DIR = path.join(VAULT, 'Université/Publications/Textes');
const ZOTERO_DIR = path.join(VAULT, 'Zotero');
const PROJECTS_DIR = path.join(VAULT, 'Tâches et projets/Projects');
const SITE = 'https://www.frederickmadore.com';

const WRITE = process.argv.includes('--write');

// Anchored to the host so only a real doi.org URL counts as a DOI.
const DOI_URL_RE = /^https?:\/\/(dx\.)?doi\.org\//i;
const normDoi = (s) =>
	String(s || '')
		.toLowerCase()
		.replace(DOI_URL_RE, '')
		.replace(/^doi:\s*/, '')
		.trim();

const TYPE_LABEL = {
	book: 'Book',
	article: 'Journal article',
	chapter: 'Book chapter',
	'special-issue': 'Special issue',
	report: 'Report',
	encyclopedia: 'Encyclopedia entry',
	blogpost: 'Blog post',
	'phd-dissertation': 'PhD dissertation',
	'masters-thesis': "Master's thesis",
	'conference-proceedings': 'Conference proceedings',
	'bulletin-article': 'Bulletin article',
	'working-paper': 'Working paper'
};

// ---- load the site's publications ------------------------------------------

const pubs = [];
for (const file of walkData(path.join(SITE_ROOT, 'src/lib/data/publications'))) {
	const record = await loadModule(file);
	if (record?.id && record.title) pubs.push(record);
}
pubs.sort((a, b) => (b.dateISO || '').localeCompare(a.dateISO || ''));

// ---- vault indexes ---------------------------------------------------------

/** Zotero literature notes, by DOI and by normalised title. */
const zByDoi = new Map();
const zByTitle = new Map();
if (existsSync(ZOTERO_DIR)) {
	for (const f of readdirSync(ZOTERO_DIR)) {
		if (!f.startsWith('@') || !f.endsWith('.md')) continue;
		const { fm } = splitNote(readFileSync(path.join(ZOTERO_DIR, f), 'utf8'));
		const citekey = f.slice(0, -3);
		const get = (key) => fm?.match(new RegExp(`^${key}:\\s*(.*)$`, 'm'))?.[1]?.trim() ?? '';
		const title = get('title').replace(/^["']|["']$/g, '');
		const doi = normDoi(get('doi') || (DOI_URL_RE.test(get('url')) ? get('url') : ''));
		if (doi) zByDoi.set(doi, citekey);
		if (title) zByTitle.set(normTitle(title), citekey);
	}
}

/** Full-text notes, by normalised filename. */
const textesByTitle = new Map();
if (existsSync(TEXTES_DIR)) {
	for (const f of readdirSync(TEXTES_DIR)) {
		if (f.endsWith('.md')) textesByTitle.set(normTitle(f.slice(0, -3)), f.slice(0, -3));
	}
}

/** projectName → vault note basename, via the notes the projects sync stamped. */
const projectNotes = new Map();
for (const file of walkData(path.join(SITE_ROOT, 'src/lib/data/research'))) {
	const record = await loadModule(file);
	if (record?.projectName) projectNotes.set(record.projectName, `research/${record.id}`);
}
const projectBySlug = noteIndexByKey(PROJECTS_DIR, 'website_slug');
const projectLink = (projectName) => {
	const slug = projectNotes.get(projectName);
	const note = slug ? projectBySlug.get(slug) : null;
	return note ? `[[${path.basename(note, '.md')}]]` : null;
};

const bySlug = noteIndexByKey(path.join(VAULT, 'Université/Publications'), 'website_slug');

// ---- rendering -------------------------------------------------------------

/** Where the item was published, as one line. */
function venue(p) {
	if (p.journal) {
		const bits = [p.journal];
		if (p.volume) bits.push(`${p.volume}${p.issue ? `(${p.issue})` : ''}`);
		if (p.pages) bits.push(p.pages);
		return bits.join(' · ');
	}
	if (p.book)
		return `In *${p.book}*${p.editors ? `, ed. ${p.editors}` : ''}${p.pages ? `, ${p.pages}` : ''}`;
	if (p.encyclopediaTitle) return `In *${p.encyclopediaTitle}*`;
	if (p.proceedingsTitle) return `In *${p.proceedingsTitle}*`;
	if (p.university) return [p.department, p.university].filter(Boolean).join(', ');
	return p.publisher || '';
}

function render(p, matches) {
	const L = [BEGIN, `# ${p.title}`, ''];

	const info = [`> [!info] ${TYPE_LABEL[p.type] || p.type} · ${p.date}`];
	const where = venue(p);
	if (where) info.push(`> ${where}`);
	if (p.publisher && !where.includes(p.publisher)) info.push(`> ${p.publisher}`);
	if (p.authors?.length) info.push(`> By: ${p.authors.join(', ')}`);
	if (p.language) info.push(`> Language: ${p.language}`);
	if (matches.project) info.push(`> Project: ${matches.project}`);
	if (matches.zotero) info.push(`> Zotero: [[${matches.zotero}]]`);
	if (matches.texte) info.push(`> Full text: [[${matches.texte}]]`);
	L.push(...info, '');

	if (p.abstract) L.push('## Abstract', '', p.abstract.trim(), '');

	if (p.tableOfContents?.length) {
		L.push('## Contents', '');
		for (const entry of p.tableOfContents) {
			if (typeof entry === 'string') L.push(`- ${entry}`);
			else
				L.push(
					`- **${entry.title}**${entry.authors?.length ? ` — ${entry.authors.join(', ')}` : ''}`
				);
		}
		L.push('');
	}

	if (p.reviewedBy?.length) {
		L.push(`## Reviews (${p.reviewedBy.length})`, '');
		for (const r of p.reviewedBy) {
			const where2 = [r.journal, r.volume, r.issue, r.pages].filter(Boolean).join(' ');
			const link = r.doi ? `https://doi.org/${r.doi}` : r.url;
			L.push(
				`- ${r.author} (${r.year}), *${r.title}*${where2 ? `, ${where2}` : ''}${link ? ` — ${link}` : ''}`
			);
		}
		L.push('');
	}

	if (p.citedBy?.length) {
		L.push(`## Cited by (${p.citedBy.length})`, '');
		for (const c of p.citedBy) {
			const link = c.url ? ` — ${c.url}` : '';
			L.push(
				`- ${c.authors.join(', ')} (${c.year}), *${c.title}*${c.source ? `, ${c.source}` : ''}${link}`
			);
		}
		L.push('');
	}

	const urls = [];
	if (p.doi) urls.push(`[DOI](https://doi.org/${p.doi})`);
	if (p.url && !DOI_URL_RE.test(p.url)) urls.push(`[Link](${p.url})`);
	if (p.pdfUrl) urls.push(`[PDF](${p.pdfUrl})`);
	for (const u of p.additionalUrls || []) urls.push(`[${u.label}](${u.url})`);
	urls.push(`[Website](${SITE}/publications/${p.id})`);
	L.push('## Links', '', urls.join(' · '), '');

	L.push(
		`*Generated from the website record (\`${p.id}\`). Edits below the marker are preserved on re-sync.*`,
		END
	);
	return L.join('\n');
}

function seedFrontmatter(p, matches) {
	const lines = ['---', 'type: publication'];
	lines.push(`publication_type: ${p.type}`);
	lines.push(`title: ${yamlStr(p.title)}`);
	if (p.authors?.length) {
		lines.push('authors:');
		for (const a of p.authors) lines.push(`  - ${yamlStr(a)}`);
	}
	lines.push(`year: ${p.year}`);
	if (p.dateISO) lines.push(`date: ${p.dateISO}`);
	if (p.journal) lines.push(`journal: ${yamlStr(p.journal)}`);
	if (p.book) lines.push(`book: ${yamlStr(p.book)}`);
	if (p.publisher) lines.push(`publisher: ${yamlStr(p.publisher)}`);
	if (p.language) lines.push(`language: ${yamlStr(p.language)}`);
	if (p.doi) lines.push(`doi: ${yamlStr(p.doi)}`);
	if (p.country?.length) lines.push(`country: [${p.country.map((c) => yamlStr(c)).join(', ')}]`);
	if (matches.project) lines.push(`project: ${yamlStr(matches.project)}`);
	if (matches.zotero) lines.push(`zotero_note: ${yamlStr(`[[${matches.zotero}]]`)}`);
	if (matches.texte) lines.push(`texte: ${yamlStr(`[[${matches.texte}]]`)}`);
	lines.push(`cited_by: ${p.citedBy?.length ?? 0}`);
	lines.push(`reviewed_by: ${p.reviewedBy?.length ?? 0}`);
	const tags = (p.tags || []).map(hyphenTag).filter(Boolean);
	if (tags.length) lines.push(`tags: [${tags.join(', ')}]`);
	lines.push(`website_slug: publications/${p.id}`);
	lines.push(`website_url: ${SITE}/publications/${p.id}`);
	lines.push('---');
	return lines.join('\n');
}

// ---- main ------------------------------------------------------------------

const stats = { created: 0, updated: 0, unchanged: 0 };
const noZotero = [];
const noProject = [];

for (const p of pubs) {
	const doi = normDoi(p.doi);
	const zotero = (doi && zByDoi.get(doi)) || zByTitle.get(normTitle(p.title)) || null;
	const texte = textesByTitle.get(normTitle(p.title)) || null;
	const project = p.project ? projectLink(p.project) : null;
	const matches = { zotero, texte, project };

	if (!zotero) noZotero.push(`${p.year} — ${p.title}`);
	if (p.project && !project) noProject.push(`${p.id} → project "${p.project}"`);

	const slug = `publications/${p.id}`;
	const generated = render(p, matches);
	const target = bySlug.get(slug);

	let full;
	let content;
	let action;

	if (target) {
		full = target;
		const existing = readFileSync(full, 'utf8');
		const spliced = spliceGenerated(existing, generated);
		if (spliced === null) {
			const { fm, body } = splitNote(existing);
			const head = fm === null ? '' : `---\n${fm}---\n\n`;
			content = `${head}${generated}\n\n## Notes (pre-sync)\n\n${body.trim()}\n`;
		} else {
			content = spliced;
		}
		const owned = {
			title: yamlStr(p.title),
			website_slug: slug,
			website_url: `${SITE}/publications/${p.id}`
		};
		// `project` is owned, not seeded: on a first run the project notes may not
		// carry their slug yet, so the link resolves to nothing and would stay
		// missing forever if it were only written at creation.
		if (project) owned.project = yamlStr(project);
		owned.cited_by = String(p.citedBy?.length ?? 0);
		owned.reviewed_by = String(p.reviewedBy?.length ?? 0);
		if (zotero) owned.zotero_note = yamlStr(`[[${zotero}]]`);
		if (texte) owned.texte = yamlStr(`[[${texte}]]`);
		content = setFrontmatterKeys(content, owned);
		action = content === existing ? 'unchanged' : 'updated';
		if (action === 'unchanged') content = null;
	} else {
		full = path.join(OUT_DIR, `${p.year} ${sanitizeFilename(p.title)}.md`);
		content = `${seedFrontmatter(p, matches)}\n\n${generated}\n\n## My notes\n`;
		action = 'created';
	}

	stats[action] += 1;
	if (WRITE && content) {
		mkdirSync(path.dirname(full), { recursive: true });
		writeFileSync(full, content, 'utf8');
	}
	if (action !== 'unchanged') console.log(`${action.padEnd(9)} ${path.relative(VAULT, full)}`);
}

console.log('\n--- summary ---');
console.log(`publications: ${pubs.length}`);
console.log(`created: ${stats.created}  updated: ${stats.updated}  unchanged: ${stats.unchanged}`);
console.log(`matched to a Zotero note: ${pubs.length - noZotero.length}/${pubs.length}`);
if (noZotero.length) {
	console.log('\nno Zotero literature note yet (generate via the Zotero connector):');
	for (const n of noZotero) console.log(`  ${n}`);
}
if (noProject.length) {
	console.log('\nproject named on the record but no vault note found:');
	for (const n of noProject) console.log(`  ${n}`);
}
console.log(WRITE ? '\nWROTE to vault.' : '\nDRY RUN — re-run with --write to apply.');
