// A record with no note of its own gets a new one at a filename derived from
// its title. Whatever already sits at that path (a note written by hand, or one
// whose slug was removed or renamed) must survive the sync byte for byte, and
// the run must say so, in a dry run and a write alike (#234).

import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { loadModule, sanitizeFilename, walkData } from '../lib/vault-sync-lib.mjs';

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
	});
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
	});

	it('reports an unslugged note as a conflict in a dry run without --adopt', async () => {
		const project = await firstRecord('research');
		const rel = `${PROJECTS}/${sanitizeFilename(project.title)}.md`;
		const file = plant(rel, HANDWRITTEN);

		const dry = sync('sync-projects-to-vault.mjs');
		expect(dry).toMatch(/conflict: 1\b/);
		expect(dry).toContain('--adopt previews title matches');
		expect(readFileSync(file, 'utf8')).toBe(HANDWRITTEN);
	});
});
