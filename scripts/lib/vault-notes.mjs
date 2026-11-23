// vault-notes.mjs
// Which vault note belongs to which website record, decided once for every
// record family the syncs write (publications, projects, talks).
//
// Each sync links into the others: a publication names its project note, a
// project lists its publication and talk notes. Those links used to be resolved
// from the notes already on disk, so on a fresh vault whichever family was
// written later was missing from the links of the one written earlier, and only
// a second full sync filled them in (#235). The dependency is circular, so no
// order of the scripts avoids it.
//
// Instead, every script asks the same planners. A planner returns, for each
// record, the note that is or will be its own: the note carrying its key, a
// note it would adopt, or the path it would create, unless that path is taken.
// The sync that owns a family writes exactly what its planner says, so the
// links other syncs draw to it agree with what it writes, by construction.

import { readFileSync, globSync } from 'node:fs';
import path from 'node:path';
import {
	BEGIN,
	walkData,
	loadModule,
	normKey,
	noteIndexByKey,
	readFrontmatter,
	sanitizeFilename,
	createClaims,
	pathTaken
} from './vault-sync-lib.mjs';

export const PUBLICATIONS_DIR = 'Université/Publications';
export const PUBLICATION_RECORDS_DIR = 'Université/Publications/Records';
export const PROJECTS_DIR = 'Tâches et projets/Projects';
export const DH_DIR = 'Tâches et projets/Projects/DH';
export const TALKS_DIR = 'Université/Communications';

/** Communication subtype (its data folder) → its folder under Communications/. */
export const SUBTYPE_FOLDER = {
	events: 'Events',
	panels: 'Panels',
	papers: 'Papers',
	podcasts: 'Podcasts',
	posters: 'Posters',
	talks: 'Talks'
};

/**
 * Records whose vault note already exists outside `Projects/`, or under a name
 * no normalisation will match. Without this the projects sync would create a
 * second, competing note beside a hub the vault already links heavily.
 */
export const PROJECT_NOTE_ALIASES = {
	'research/digital-research-environment': 'Bayreuth/DRE/Digital Research Environment (DRE).md'
};

/**
 * The site path a project lives at, used as its `website_slug`. It has to carry
 * the section, not just the id: `dh-ai-african-studies` is both a research
 * project and a digital-humanities project, and a bare id would collapse the
 * two onto one note.
 */
export const projectSitePath = (kind, id) =>
	`${kind === 'dh' ? 'digital-humanities' : 'research'}/${id}`;

/** A planned note as a wikilink target, or null when the record has none. */
export function noteName(entry) {
	return entry && entry.status !== 'conflict' && entry.status !== 'manual'
		? path.basename(entry.file, '.md')
		: null;
}

// ---- records ---------------------------------------------------------------

async function loadAll(dir, accept) {
	const out = [];
	for (const file of walkData(dir)) {
		const record = await loadModule(file);
		if (accept(record)) out.push({ record, file });
	}
	return out;
}

/** Publications, newest first: the order the publications sync writes in. */
export async function loadPublications(siteRoot) {
	const rows = await loadAll(
		path.join(siteRoot, 'src/lib/data/publications'),
		(r) => r?.id && r.title
	);
	return rows
		.map(({ record }) => record)
		.sort((a, b) => (b.dateISO || '').localeCompare(a.dateISO || ''));
}

export async function loadProjects(siteRoot) {
	const load = async (dir) =>
		(await loadAll(path.join(siteRoot, 'src/lib/data', dir), (r) => r?.id)).map(
			({ record }) => record
		);
	return { dh: await load('digital-humanities'), research: await load('research') };
}

/** Talks with the subtype their data folder gives them. */
export async function loadTalks(siteRoot) {
	const rows = await loadAll(
		path.join(siteRoot, 'src/lib/data/communications'),
		(r) => r?.id && r.title
	);
	return rows.map(({ record, file }) => ({
		c: record,
		subtype: path.basename(path.dirname(file))
	}));
}

// ---- planners --------------------------------------------------------------
//
// Every entry is { file, status }:
//   existing — a note carries the record's key; update it
//   adopted  — a note without the key will be taken over (projects, talks)
//   manual   — talks only: a hand-written note at the home path with no
//              generated block, which the sync leaves alone and nothing links
//   new      — nothing is there; the sync creates the note
//   conflict — the path the sync would create is taken (#234); no note

/** Publication id → its note. `bySlug` is every `website_slug` under Publications/. */
export function planPublicationNotes(vault, publications) {
	const bySlug = noteIndexByKey(path.join(vault, PUBLICATIONS_DIR), 'website_slug');
	const claim = createClaims();
	const notes = new Map();
	for (const p of publications) {
		const existing = bySlug.get(`publications/${p.id}`);
		if (existing) {
			notes.set(p.id, { file: existing, status: 'existing' });
			continue;
		}
		const file = path.join(
			vault,
			PUBLICATION_RECORDS_DIR,
			`${p.year} ${sanitizeFilename(p.title)}.md`
		);
		notes.set(p.id, { file, status: claim(file) ? 'new' : 'conflict' });
	}
	return { notes, bySlug };
}

/**
 * Project site path → its note. With `adopt`, an unslugged note under
 * Projects/ whose title or filename matches the record's title, short title,
 * card title or project name is taken over, once: the one-time bootstrap for
 * project notes that predate the sync. Without it, a dry run plans no adoption.
 */
export function planProjectNotes(vault, { dh, research }, { adopt = true } = {}) {
	const projectsDir = path.join(vault, PROJECTS_DIR);
	const bySlug = noteIndexByKey(projectsDir, 'website_slug');
	for (const [slug, rel] of Object.entries(PROJECT_NOTE_ALIASES)) {
		if (!bySlug.has(slug) && pathTaken(path.join(vault, rel)))
			bySlug.set(slug, path.join(vault, rel));
	}
	const all = [
		...dh.map((project) => ({ kind: 'dh', project })),
		...research.map((project) => ({ kind: 'research', project }))
	];
	const notes = new Map();
	for (const { kind, project } of all) {
		const slug = projectSitePath(kind, project.id);
		const existing = bySlug.get(slug);
		if (existing) notes.set(slug, { file: existing, status: 'existing' });
	}

	if (adopt) {
		const byTitle = noteIndexByKey(projectsDir, 'title');
		const byName = new Map();
		for (const file of globSync('**/*.md', { cwd: projectsDir })) {
			byName.set(normKey(path.basename(file, '.md')), path.join(projectsDir, file));
		}
		const taken = new Set([...bySlug.values()].map((file) => path.resolve(file)));
		for (const { kind, project } of all) {
			const slug = projectSitePath(kind, project.id);
			if (notes.has(slug)) continue;
			let hit = null;
			for (const candidate of [
				project.title,
				project.shortTitle,
				project.cardTitle,
				project.projectName
			]) {
				if (!candidate) continue;
				hit = byTitle.get(candidate) || byName.get(normKey(candidate));
				if (hit) break;
			}
			if (!hit || taken.has(path.resolve(hit))) continue;
			if (readFrontmatter(readFileSync(hit, 'utf8')).website_slug) continue;
			taken.add(path.resolve(hit));
			notes.set(slug, { file: hit, status: 'adopted' });
		}
	}

	const claim = createClaims();
	for (const { kind, project } of all) {
		const slug = projectSitePath(kind, project.id);
		if (notes.has(slug)) continue;
		const dir = path.join(vault, kind === 'dh' ? DH_DIR : PROJECTS_DIR);
		const file = path.join(dir, `${sanitizeFilename(project.title)}.md`);
		notes.set(slug, { file, status: claim(file) ? 'new' : 'conflict' });
	}
	return { notes, bySlug };
}

/**
 * Talk id → its note: by `slug` first; otherwise the file at its home path
 * (`<Subtype>/<year> <title>.md`), adopted when it holds a generated block and
 * left alone when it does not; otherwise a new note there.
 */
export function planTalkNotes(vault, talks) {
	const outDir = path.join(vault, TALKS_DIR);
	const bySlug = noteIndexByKey(outDir, 'slug');
	const claim = createClaims();
	const notes = new Map();
	for (const { c, subtype } of talks) {
		const existing = bySlug.get(c.id);
		if (existing) {
			notes.set(c.id, { file: existing, status: 'existing' });
			continue;
		}
		const folder = SUBTYPE_FOLDER[subtype] || 'Talks';
		const file = path.join(
			outDir,
			folder,
			`${c.year || ''} ${sanitizeFilename(c.title)}`.trim() + '.md'
		);
		if (pathTaken(file)) {
			const raw = readFileSync(file, 'utf8');
			// A note that names another talk is that talk's, never this one's.
			const status = readFrontmatter(raw).slug
				? 'conflict'
				: raw.includes(BEGIN)
					? 'adopted'
					: 'manual';
			notes.set(c.id, { file, status });
		} else {
			notes.set(c.id, { file, status: claim(file) ? 'new' : 'conflict' });
		}
	}
	return { notes, bySlug };
}
