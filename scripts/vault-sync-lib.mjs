// vault-sync-lib.mjs
// Shared helpers for the website → Obsidian sync scripts
// (sync-talks-to-vault, sync-projects-to-vault, sync-publications-to-vault).
//
// The sync runs in one direction only: the website repo is the source of truth,
// the vault is a mirror plus the user's own notes. Nothing here ever reads vault
// prose back into the repo, which is what keeps private notes out of a public
// commit by construction rather than by discipline.

import ts from 'typescript';
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import path from 'node:path';

export const BEGIN = '%% begin generated (website sync) %%';
export const END = '%% end generated (website sync) %%';

/**
 * The vault to write into. Required — there is deliberately no hardcoded
 * fallback, because this file is committed to a public repository and a default
 * would publish the author's local directory layout.
 */
export function vaultRoot() {
	const dir = process.env.OBSIDIAN_VAULT;
	if (!dir) {
		const self = path.basename(process.argv[1] ?? 'sync-projects-to-vault.mjs');
		console.error(
			'OBSIDIAN_VAULT is not set. Point it at the vault root, e.g.\n' +
				`  OBSIDIAN_VAULT="/path/to/vault" node scripts/${self}`
		);
		process.exit(2);
	}
	if (!existsSync(dir)) {
		console.error(`OBSIDIAN_VAULT points at a path that does not exist: ${dir}`);
		process.exit(2);
	}
	return dir;
}

/** Every data record under `dir`, skipping barrels, templates and filter modules. */
export function walkData(dir) {
	const out = [];
	for (const name of readdirSync(dir)) {
		const full = path.join(dir, name);
		if (statSync(full).isDirectory()) out.push(...walkData(full));
		else if (
			name.endsWith('.ts') &&
			name !== 'index.ts' &&
			!name.endsWith('.svelte.ts') &&
			!/template|filters/i.test(name)
		)
			out.push(full);
	}
	return out;
}

/** Transpile a typed data module and return its record. */
export async function loadModule(file) {
	const js = ts.transpileModule(readFileSync(file, 'utf8'), {
		compilerOptions: {
			module: ts.ModuleKind.ESNext,
			target: ts.ScriptTarget.ES2022,
			verbatimModuleSyntax: false
		}
	}).outputText;
	const mod = await import('data:text/javascript,' + encodeURIComponent(js));
	return mod.default ?? Object.values(mod)[0];
}

/** Strip combining marks, so "Côte d'Ivoire" and "Cote d'Ivoire" match. */
export const stripDia = (s) => String(s).normalize('NFD').replace(/\p{M}/gu, '');

/** Lowercase, straighten quotes, drop colons (illegal in Windows filenames). */
export function normKey(s) {
	return String(s)
		.toLowerCase()
		.replace(/[‘’`]/g, "'")
		.replace(/[“”]/g, '"')
		.replace(/:/g, '')
		.replace(/\s+/g, ' ')
		.trim();
}

/** Aggressive title normalisation for cross-system matching (Zotero, vault). */
export function normTitle(s) {
	return stripDia(String(s || ''))
		.toLowerCase()
		.replace(/[‘’`]/g, "'")
		.replace(/[^a-z0-9 ]+/g, ' ')
		.replace(/\s+/g, ' ')
		.trim();
}

export function sanitizeFilename(str) {
	// Windows rejects a trailing dot or space outright, and truncating a title
	// mid-sentence is the usual way to produce one.
	const tidy = (s) => s.replace(/[. ]+$/, '').trim();
	const clean = tidy(
		String(str)
			.replace(/[\\/:*?"<>|#^[\]]/g, '')
			.replace(/\s+/g, ' ')
	);
	if (clean.length <= 90) return clean;
	const cut = clean.slice(0, 90);
	const lastSpace = cut.lastIndexOf(' ');
	return tidy(lastSpace > 60 ? cut.slice(0, lastSpace) : cut);
}

export function hyphenTag(tag) {
	return String(tag)
		.toLowerCase()
		.replace(/&/g, 'and')
		.replace(/[^a-z0-9À-ſ]+/g, '-')
		.replace(/^-+|-+$/g, '');
}

/** Quote a YAML scalar, escaping backslashes before quotes so neither can break out. */
export function yamlStr(s) {
	return '"' + String(s).replace(/\\/g, '\\\\').replace(/"/g, '\\"') + '"';
}

// ---- note / frontmatter handling ------------------------------------------

/** Split a note into its frontmatter block (without fences) and its body. */
export function splitNote(raw) {
	const text = (raw.charCodeAt(0) === 0xfeff ? raw.slice(1) : raw).replace(/\r\n/g, '\n');
	if (!text.startsWith('---\n')) return { fm: null, body: text };
	const end = text.indexOf('\n---', 3);
	if (end === -1) return { fm: null, body: text };
	return { fm: text.slice(4, end + 1), body: text.slice(end + 5) };
}

/**
 * Shallow read of a frontmatter block: scalar keys only. Enough to look up
 * `website_slug` and friends; not a YAML parser.
 */
export function readFrontmatter(raw) {
	const { fm } = splitNote(raw);
	const out = {};
	if (!fm) return out;
	for (const line of fm.split('\n')) {
		const m = line.match(/^([A-Za-z_][A-Za-z0-9_-]*):\s*(.*)$/);
		if (m) out[m[1]] = m[2].replace(/^["']|["']$/g, '').trim();
	}
	return out;
}

/**
 * Replace a fixed set of frontmatter keys, leaving every other key — and its
 * formatting — untouched. `updates` maps key → rendered value.
 *
 * Deliberately line surgery rather than parse-and-dump: round-tripping the
 * vault's YAML through a serialiser reorders keys, restyles quotes and mangles
 * the wikilinks inside list values.
 */
export function setFrontmatterKeys(raw, updates) {
	const { fm, body } = splitNote(raw);
	if (fm === null) {
		const lines = Object.entries(updates).map(([k, v]) => `${k}: ${v}`);
		return `---\n${lines.join('\n')}\n---\n\n${body}`;
	}

	const lines = fm.replace(/\n$/, '').split('\n');
	const remaining = new Map(Object.entries(updates));
	const out = [];

	for (let i = 0; i < lines.length; i += 1) {
		const key = lines[i].match(/^([A-Za-z_][A-Za-z0-9_-]*):/)?.[1];
		if (!key || !remaining.has(key)) {
			out.push(lines[i]);
			continue;
		}
		// Swallow the old value, including any indented or `- ` continuation lines.
		while (i + 1 < lines.length && /^(\s+\S|- )/.test(lines[i + 1])) i += 1;
		out.push(`${key}: ${remaining.get(key)}`);
		remaining.delete(key);
	}

	for (const [k, v] of remaining) out.push(`${k}: ${v}`);
	return `---\n${out.join('\n')}\n---\n${body}`;
}

/** Swap the marked region. Returns null when the note carries no marker. */
export function spliceGenerated(existing, generated) {
	const s = existing.indexOf(BEGIN);
	const e = existing.indexOf(END);
	if (s === -1 || e === -1) return null;
	return existing.slice(0, s) + generated + existing.slice(e + END.length);
}

/** Map of normKey(basename) → basename for the .md notes in a directory. */
export function noteIndex(dir, recurse = false) {
	const map = new Map();
	if (!existsSync(dir)) return map;
	for (const f of readdirSync(dir)) {
		const full = path.join(dir, f);
		if (statSync(full).isDirectory()) {
			if (recurse) for (const [k, v] of noteIndex(full, true)) if (!map.has(k)) map.set(k, v);
		} else if (f.endsWith('.md')) {
			map.set(normKey(f.slice(0, -3)), f.slice(0, -3));
		}
	}
	return map;
}

/**
 * Every note under `dir` carrying `key` in its frontmatter, indexed by that
 * value. This is how a record finds its note: an id is stable, a title is not,
 * so renaming a note in Obsidian must not break the link.
 */
export function noteIndexByKey(dir, key) {
	const map = new Map();
	if (!existsSync(dir)) return map;
	const walk = (d) => {
		for (const f of readdirSync(d)) {
			const full = path.join(d, f);
			if (statSync(full).isDirectory()) walk(full);
			else if (f.endsWith('.md')) {
				const value = readFrontmatter(readFileSync(full, 'utf8'))[key];
				if (value && !map.has(value)) map.set(value, full);
			}
		}
	};
	walk(dir);
	return map;
}

// ---- HTML → Markdown -------------------------------------------------------

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

export const decodeEntities = (text) =>
	String(text).replace(/&[#a-z0-9]+;/gi, (entity) => ENTITIES[entity] ?? entity);

/** Inline markup → Markdown. Anything left with a tag in it is a caller error. */
function inlineToMarkdown(html, where) {
	// Closing tags are written `</a\n>` wherever Prettier has broken a long
	// opening tag across lines, so every one of them tolerates trailing space.
	// `<br>` becomes a sentinel rather than a newline: source markup is hard
	// wrapped, so every other newline has to collapse to a space, and an early
	// `\n` here would be indistinguishable from the wrapping.
	const BR = '\u0000';
	let text = String(html)
		.replace(/<br\s*\/?>/g, BR)
		.replace(/<a\b[^>]*\bhref="([^"]*)"[^>]*>([\s\S]*?)<\/a\s*>/g, (_, href, label) => {
			const clean = label.replace(/\s+/g, ' ').trim();
			return `[${clean}](${href})`;
		})
		.replace(/<(strong|b)\s*>([\s\S]*?)<\/\1\s*>/g, (_, __, inner) => `**${inner.trim()}**`)
		.replace(/<(em|i)\s*>([\s\S]*?)<\/\1\s*>/g, (_, __, inner) => `*${inner.trim()}*`)
		.replace(/<code\s*>([\s\S]*?)<\/code\s*>/g, (_, inner) => '`' + inner.trim() + '`');

	const leftover = text.match(/<[^>]+>/);
	if (leftover) throw new Error(`${where}: unhandled inline markup ${leftover[0]}`);

	return decodeEntities(text)
		.replace(/\s+/g, ' ')
		.split(BR)
		.map((line) => line.trim())
		.join('\n')
		.trim();
}

/**
 * Convert the constrained HTML used in the site's `description` fields to
 * Markdown. The grammar is closed — p, h2-h4, ul, ol, li, plus the inline set
 * above — and anything outside it raises rather than being dropped, so prose
 * can never vanish silently into a generated note.
 */
export function htmlToMarkdown(html, where = 'description') {
	let rest = String(html).trim();
	const blocks = [];

	while (rest.length) {
		const ws = rest.match(/^\s+/);
		if (ws) {
			rest = rest.slice(ws[0].length);
			continue;
		}

		const heading = rest.match(/^<h([2-6])\b[^>]*>([\s\S]*?)<\/h\1\s*>/);
		if (heading) {
			blocks.push(`${'#'.repeat(Number(heading[1]))} ${inlineToMarkdown(heading[2], where)}`);
			rest = rest.slice(heading[0].length);
			continue;
		}

		const para = rest.match(/^<p\b[^>]*>([\s\S]*?)<\/p\s*>/);
		if (para) {
			blocks.push(inlineToMarkdown(para[1], where));
			rest = rest.slice(para[0].length);
			continue;
		}

		const list = rest.match(/^<(ul|ol)\b[^>]*>([\s\S]*?)<\/\1\s*>/);
		if (list) {
			const ordered = list[1] === 'ol';
			const items = [...list[2].matchAll(/<li\b[^>]*>([\s\S]*?)<\/li\s*>/g)].map((m) =>
				inlineToMarkdown(m[1], where)
			);
			if (!items.length) throw new Error(`${where}: empty <${list[1]}>`);
			blocks.push(items.map((item, i) => `${ordered ? `${i + 1}.` : '-'} ${item}`).join('\n'));
			rest = rest.slice(list[0].length);
			continue;
		}

		throw new Error(`${where}: unhandled block near ${JSON.stringify(rest.slice(0, 60))}`);
	}

	return blocks.join('\n\n');
}
