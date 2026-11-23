import { expect, it } from 'vitest';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import {
	walkData,
	loadModule,
	createClaims,
	createNote,
	pathTaken,
	setFrontmatterKeys
} from './vault-sync-lib.mjs';

it('setFrontmatterKeys removes a key set to null, continuation lines included', () => {
	const note = [
		'---',
		'title: "A"',
		'authors:',
		'  - "One"',
		'  - "Two"',
		'openalex: W1',
		'year: 2020',
		'---',
		'body',
		''
	].join('\n');
	expect(setFrontmatterKeys(note, { authors: null, openalex: null, wikidata: null })).toBe(
		['---', 'title: "A"', 'year: 2020', '---', 'body', ''].join('\n')
	);
	expect(setFrontmatterKeys('body\n', { openalex: null })).toBe('body\n');
});

it('createNote writes a new note but never replaces an existing one', () => {
	const dir = mkdtempSync(path.join(tmpdir(), 'vault-lib-'));
	try {
		const file = path.join(dir, 'Records', 'note.md');
		expect(pathTaken(file)).toBe(false);
		expect(createNote(file, 'first')).toBe(true);
		expect(createNote(file, 'second')).toBe(false);
		expect(readFileSync(file, 'utf8')).toBe('first');
	} finally {
		rmSync(dir, { recursive: true, force: true });
	}
});

it('createClaims refuses a taken path and a second claim on one path, ignoring case', () => {
	const dir = mkdtempSync(path.join(tmpdir(), 'vault-lib-'));
	try {
		writeFileSync(path.join(dir, 'taken.md'), 'mine');
		const claim = createClaims();
		expect(claim(path.join(dir, 'taken.md'))).toBe(false);
		expect(claim(path.join(dir, 'Free.md'))).toBe(true);
		expect(claim(path.join(dir, 'free.md'))).toBe(false);
	} finally {
		rmSync(dir, { recursive: true, force: true });
	}
});

it('loads communication records without importing CV or summary views', async () => {
	const files = walkData(path.resolve('src/lib/data/communications'));
	expect(files.length).toBeGreaterThan(0);
	expect(files.some((file) => path.basename(file) === 'cv.ts')).toBe(false);
	const records = await Promise.all(files.map(loadModule));
	expect(records.every((record) => typeof record.id === 'string')).toBe(true);
	expect(records.some((record) => record.id === 'serveurs-mcp-glam-africains-stias-2026')).toBe(
		true
	);
});
