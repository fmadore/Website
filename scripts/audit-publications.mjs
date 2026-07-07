// audit-publications.mjs
// Reconcile the site's publications (src/lib/data/publications/) against the
// Obsidian/Zotero library (@citekey.md notes). Reports which site publications
// already have a Zotero note and which are missing, so the gaps can be filled
// by DOI/ISBN. Read-only — writes a report to the scratchpad, nothing else.
//
//   node scripts/audit-publications.mjs

import ts from 'typescript';
import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SITE_ROOT = path.resolve(__dirname, '..');
const DATA_DIR = path.join(SITE_ROOT, 'src/lib/data/publications');
const VAULT = process.env.OBSIDIAN_VAULT || 'C:/Users/frede/Obsidian/Coffre';
const ZOTERO_DIR = path.join(VAULT, 'Zotero');
const REPORT =
	process.env.AUDIT_OUT ||
	'C:/Users/frede/AppData/Local/Temp/claude/C--Users-frede-Obsidian-Coffre/3a9af119-3853-4370-aec0-4a8c29a4778a/scratchpad/publications-audit.md';

function walk(d) {
	const o = [];
	for (const n of readdirSync(d)) {
		const f = path.join(d, n);
		if (statSync(f).isDirectory()) o.push(...walk(f));
		else if (
			n.endsWith('.ts') &&
			n !== 'index.ts' &&
			!n.endsWith('.svelte.ts') &&
			!/template|filters/i.test(n)
		)
			o.push(f);
	}
	return o;
}

async function load(f) {
	const js = ts.transpileModule(readFileSync(f, 'utf8'), {
		compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 }
	}).outputText;
	const mod = await import('data:text/javascript,' + encodeURIComponent(js));
	return mod.default ?? Object.values(mod).find((v) => v && v.id && v.title);
}

const stripDia = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '');
const normTitle = (s) =>
	stripDia(String(s || ''))
		.toLowerCase()
		.replace(/[''`]/g, "'")
		.replace(/[^a-z0-9 ]+/g, ' ')
		.replace(/\s+/g, ' ')
		.trim();
// Anchored to the host so only a real doi.org URL is treated as a DOI — an
// unanchored /doi\.org/ would also match e.g. https://evil.example/?doi.org.
const DOI_URL_RE = /^https?:\/\/(dx\.)?doi\.org\//i;
const normDoi = (s) =>
	String(s || '')
		.toLowerCase()
		.replace(DOI_URL_RE, '')
		.replace(/^doi:\s*/, '')
		.trim();

// Escape a value for a Markdown table cell: backslash first (so it can't defeat
// the pipe escaping), then the pipe, then flatten any newlines.
const mdCell = (s) =>
	String(s ?? '')
		.replace(/\\/g, '\\\\')
		.replace(/\|/g, '\\|')
		.replace(/\r?\n/g, ' ');

// Zotero item keys are short upper-case base-32 tokens (e.g. "A1B2C3D4"). Match
// against an anchored allowlist before any value from the HTTP response is
// written into the report, so nothing untrusted flows through unchecked.
const safeZoteroKey = (k) => (/^[A-Z0-9]{1,32}$/.test(k) ? k : '(invalid key)');

function frontmatter(raw) {
	const text = (raw.charCodeAt(0) === 0xfeff ? raw.slice(1) : raw).replace(/\r\n/g, '\n');
	if (!text.startsWith('---')) return {};
	const end = text.indexOf('\n---', 3);
	if (end === -1) return {};
	const fm = {};
	for (const line of text.slice(3, end).split('\n')) {
		const m = line.match(/^([A-Za-z_]+):\s*(.*)$/);
		if (m) fm[m[1]] = m[2].replace(/^["']|["']$/g, '').trim();
	}
	return fm;
}

// ---- build Zotero index ----
const zByDoi = new Map();
const zByTitle = new Map();
let zCount = 0;
for (const f of readdirSync(ZOTERO_DIR)) {
	if (!f.startsWith('@') || !f.endsWith('.md')) continue;
	zCount++;
	const fm = frontmatter(readFileSync(path.join(ZOTERO_DIR, f), 'utf8'));
	const citekey = fm.citekey || f.slice(1, -3);
	const doi = normDoi(fm.doi || (fm.url && DOI_URL_RE.test(fm.url) ? fm.url : ''));
	if (doi) zByDoi.set(doi, citekey);
	if (fm.title) zByTitle.set(normTitle(fm.title), citekey);
}

// ---- load site publications ----
const files = walk(DATA_DIR);
const pubs = [];
for (const f of files) {
	try {
		const p = await load(f);
		if (p && p.title) pubs.push(p);
	} catch (err) {
		console.error('load failed:', path.basename(f), err.message);
	}
}

// ---- fetch live Zotero library (local API) to tell 'absent' from 'no note' ----
const libByDoi = new Map();
const libByTitle = new Map();
let libCount = 0;
let libOk = false;
try {
	const res = await fetch(
		'http://localhost:23119/api/users/0/items?q=Madore&qmode=titleCreatorYear&limit=300&itemType=-attachment&format=json'
	);
	const items = await res.json();
	libOk = true;
	libCount = items.length;
	for (const it of items) {
		const d = it.data || {};
		const doi = normDoi(d.DOI || (d.url && DOI_URL_RE.test(d.url) ? d.url : ''));
		const rec = { key: safeZoteroKey(it.key), itemType: d.itemType };
		if (doi) libByDoi.set(doi, rec);
		if (d.title) libByTitle.set(normTitle(d.title), rec);
	}
} catch (e) {
	console.error('Zotero local API unavailable — cannot split absent vs no-note:', e.message);
}

// ---- classify each site publication into 3 buckets ----
const hasNote = [];
const inZoteroNoNote = [];
const absent = [];
for (const p of pubs) {
	const doi = normDoi(p.doi);
	const noteHit = (doi && zByDoi.get(doi)) || zByTitle.get(normTitle(p.title));
	if (noteHit) {
		hasNote.push({ p, citekey: noteHit });
		continue;
	}
	const libHit = (doi && libByDoi.get(doi)) || libByTitle.get(normTitle(p.title));
	if (libHit) inZoteroNoNote.push({ p, ...libHit });
	else absent.push(p);
}

// ---- report ----
const lines = [];
lines.push('# Publications audit — website vs Zotero', '');
lines.push(`- Website publications: **${pubs.length}**`);
lines.push(`- Vault literature notes scanned: **${zCount}**`);
lines.push(
	`- Zotero library items checked (local API): **${libOk ? libCount : 'API unavailable'}**`,
	''
);
lines.push(`- ✅ Already have a note: **${hasNote.length}**`);
lines.push(
	`- 📝 In Zotero, no note yet: **${inZoteroNoNote.length}** — pull into notes via the Zotero plugin`
);
lines.push(`- ➕ Absent from Zotero: **${absent.length}** — need adding`, '');

lines.push(
	'## 📝 In Zotero — select these and generate notes with the Zotero Desktop Connector',
	''
);
lines.push('| Zotero key | Type | Year | Title | DOI/ISBN |');
lines.push('|---|---|---|---|---|');
for (const m of inZoteroNoNote.sort((a, b) => (b.p.year || 0) - (a.p.year || 0))) {
	const ref = m.p.doi || (m.p.isbn ? 'ISBN ' + m.p.isbn : '—');
	lines.push(`| \`${m.key}\` | ${m.p.type} | ${m.p.year || ''} | ${mdCell(m.p.title)} | ${ref} |`);
}

lines.push('', '## ➕ Absent from Zotero — add these', '');
lines.push('| Type | Year | Title | DOI/ISBN (addable?) |');
lines.push('|---|---|---|---|');
for (const p of absent.sort((a, b) => (b.year || 0) - (a.year || 0))) {
	const ref = p.doi ? p.doi + ' ✔' : p.isbn ? 'ISBN ' + p.isbn + ' ✔' : '— (manual)';
	lines.push(`| ${p.type} | ${p.year || ''} | ${mdCell(p.title)} | ${ref} |`);
}

lines.push('', '## ✅ Already covered', '');
for (const m of hasNote.sort((a, b) => (b.p.year || 0) - (a.p.year || 0)))
	lines.push(`- ${m.p.year} — ${m.p.title}  →  \`@${m.citekey}\``);

writeFileSync(REPORT, lines.join('\n'), 'utf8');
console.log(lines.slice(0, 9).join('\n'));
console.log('\nFull report:', REPORT);
