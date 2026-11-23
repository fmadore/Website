// The website → vault syncs, run as the user runs them, against a scratch vault.
//
// - A record with no note of its own gets a new one at a filename derived from
//   its title. Whatever already sits at that path (a note written by hand, or
//   one whose slug was removed or renamed) must survive the sync byte for byte,
//   and the run must say so, in a dry run and a write alike (#234).
// - One full sync on a fresh vault draws every cross-link, and a second one
//   changes nothing (#235).
// - An identifier the site no longer records leaves the note; a link the user
//   set by hand stays (#236).

import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import {
	loadModule,
	readFrontmatter,
	sanitizeFilename,
	setFrontmatterKeys,
	walkData
} from '../lib/vault-sync-lib.mjs';
import { loadProjects, loadPublications } from '../lib/vault-notes.mjs';

const FULL_SYNC = ['publications', 'projects', 'sections', 'talks'].map(
	(family) => `sync-${family}-to-vault.mjs`
);

const ROOT = path.resolve(import.meta.dirname, '..', '..');
const HANDWRITTEN = '# My own note\n\nWritten by hand, never generated.\n';

let vault;
beforeEach(() => {
	vault = mkdtempSync(path.join(tmpdir(), 'vault-sync-'));
});
afterEach(() => {
	rmSync(vault, { recursive: true, force: true });
});

function sync(script, ...args) {
	return execFileSync(process.execPath, [path.join(ROOT, 'scripts/vault', script), ...args], {
		cwd: ROOT,
		env: { ...process.env, OBSIDIAN_VAULT: vault },
		encoding: 'utf8'
	});
}

/** Place a note at `rel` under the vault and return its absolute path. */
function plant(rel, content) {
	const file = path.join(vault, rel);
	mkdirSync(path.dirname(file), { recursive: true });
	writeFileSync(file, content, 'utf8');
	return file;
}

async function firstRecord(dir, accept = () => true) {
	for (const file of walkData(path.join(ROOT, 'src/lib/data', dir))) {
		const record = await loadModule(file);
		if (record?.id && record.title && accept(record)) return record;
	}
	throw new Error(`no record in ${dir}`);
}

describe('sync-publications-to-vault', () => {
	const RECORDS = 'Université/Publications/Records';

	it('leaves a handwritten note at the target path untouched and reports the conflict', async () => {
		const p = await firstRecord('publications');
		const rel = `${RECORDS}/${p.year} ${sanitizeFilename(p.title)}.md`;
		const file = plant(rel, HANDWRITTEN);

		const dry = sync('sync-publications-to-vault.mjs');
		expect(dry).toMatch(/conflict: 1\b/);
		expect(dry).toContain(`← website_slug: publications/${p.id}`);

		const written = sync('sync-publications-to-vault.mjs', '--write');
		expect(written).toMatch(/conflict: 1\b/);
		const createdLines = written.split('\n').filter((line) => line.startsWith('created'));
		expect(createdLines.some((line) => line.includes(path.basename(rel)))).toBe(false);
		expect(readFileSync(file, 'utf8')).toBe(HANDWRITTEN);

		// Every other record still gets its note.
		const created = readdirSync(path.join(vault, RECORDS)).filter((f) => f.endsWith('.md'));
		expect(created.length).toBeGreaterThan(1);
	}, 60_000);
});

describe('sync-projects-to-vault', () => {
	const PROJECTS = 'Tâches et projets/Projects';

	it('does not overwrite a note that claims another slug at the target path', async () => {
		const project = await firstRecord('research');
		const rel = `${PROJECTS}/${sanitizeFilename(project.title)}.md`;
		// Adoption skips a note that already names a slug, so this is the path a
		// renamed or retired research id leaves behind.
		const content = `---\nwebsite_slug: research/retired-id\n---\n\n${HANDWRITTEN}`;
		const file = plant(rel, content);

		const written = sync('sync-projects-to-vault.mjs', '--write');
		expect(written).toMatch(/conflict: 1\b/);
		expect(written).toContain(`← website_slug: research/${project.id}`);
		expect(readFileSync(file, 'utf8')).toBe(content);
	}, 60_000);

	it('reports an unslugged note as a conflict in a dry run without --adopt', async () => {
		const project = await firstRecord('research');
		const rel = `${PROJECTS}/${sanitizeFilename(project.title)}.md`;
		const file = plant(rel, HANDWRITTEN);

		const dry = sync('sync-projects-to-vault.mjs');
		expect(dry).toMatch(/conflict: 1\b/);
		expect(dry).toContain('--adopt previews title matches');
		expect(readFileSync(file, 'utf8')).toBe(HANDWRITTEN);
	}, 60_000);
});

describe('a full sync', () => {
	it('draws every project link on a fresh vault, and a second run changes nothing', async () => {
		for (const script of FULL_SYNC) sync(script, '--write');

		// Every publication whose project is a research project names its note,
		// although the projects sync ran after the publications sync.
		const { research } = await loadProjects(ROOT);
		const names = new Set(research.map((r) => r.projectName).filter(Boolean));
		const linked = (await loadPublications(ROOT)).filter((p) => names.has(p.project));
		expect(linked.length).toBeGreaterThan(0);
		const records = path.join(vault, 'Université/Publications/Records');
		const withProject = readdirSync(records).filter(
			(f) => readFrontmatter(readFileSync(path.join(records, f), 'utf8')).project
		);
		expect(withProject).toHaveLength(linked.length);

		// And the project notes link the talks, written by the last script.
		const projects = path.join(vault, 'Tâches et projets/Projects');
		const talkNames = new Set(
			readdirSync(path.join(vault, 'Université/Communications'), { recursive: true })
				.filter((f) => String(f).endsWith('.md'))
				.map((f) => path.basename(String(f), '.md'))
		);
		const projectText = readdirSync(projects, { recursive: true })
			.filter((f) => String(f).endsWith('.md'))
			.map((f) => readFileSync(path.join(projects, String(f)), 'utf8'))
			.join('\n');
		const talkLinks = [...projectText.matchAll(/\[\[([^\]]+)\]\]/g)].filter(([, name]) =>
			talkNames.has(name)
		);
		expect(talkLinks.length).toBeGreaterThan(0);

		for (const script of FULL_SYNC) {
			const again = sync(script, '--write');
			expect(again, script).toMatch(/created: 0\b/);
			expect(again, script).toMatch(/updated: 0\b/);
		}
	}, 120_000);
});

describe('site-owned identifiers', () => {
	it('removes an identifier the site no longer records, and keeps a hand-set link', async () => {
		sync('sync-publications-to-vault.mjs', '--write');
		const p = (await loadPublications(ROOT)).find((r) => !r.openAlexId);
		const file = path.join(
			vault,
			'Université/Publications/Records',
			`${p.year} ${sanitizeFilename(p.title)}.md`
		);
		writeFileSync(
			file,
			setFrontmatterKeys(readFileSync(file, 'utf8'), {
				openalex: 'W0000000000',
				zotero_note: '"[[@handset2026]]"'
			}),
			'utf8'
		);

		const out = sync('sync-publications-to-vault.mjs', '--write');
		const fm = readFrontmatter(readFileSync(file, 'utf8'));
		expect(fm.openalex).toBeUndefined();
		expect(fm.zotero_note).toBe('[[@handset2026]]');
		expect(out).toContain('openalex W0000000000');
	}, 60_000);
});
