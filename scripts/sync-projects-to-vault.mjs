// sync-projects-to-vault.mjs
// Generate Obsidian notes for every research project and digital-humanities
// project from the site's typed data, mirroring what sync-talks-to-vault.mjs
// does for communications.
//
//   node scripts/sync-projects-to-vault.mjs            # dry run (prints plan)
//   node scripts/sync-projects-to-vault.mjs --adopt    # dry run + slug matches
//   node scripts/sync-projects-to-vault.mjs --write    # apply
//
// Requires OBSIDIAN_VAULT.
//
// Notes are matched to records by a `website_slug` frontmatter key, never by
// title: titles drift, and the vault already holds two notes whose names differ
// from the site's only in case. A note with no `website_slug` is invisible to
// this script, which is what protects the vault-only project notes (Interview
// Companion, Digitalisation Togo Pilot Project, …) from being touched at all.
//
// `--adopt` bootstraps that key: it matches unslugged notes by normalised title
// and writes the slug in, printing every match for review first.
//
// Field ownership, so a re-run can never eat the user's work:
//   owned  — `title`, `website_url`, `website_slug`, and the marked block
//   seeded — everything else, written once at creation and never again
// Drift in seeded fields is reported at the end, not silently corrected.

import { readFileSync, writeFileSync, mkdirSync, globSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import {
	BEGIN,
	END,
	vaultRoot,
	walkData,
	loadModule,
	normKey,
	noteIndex,
	noteIndexByKey,
	sanitizeFilename,
	hyphenTag,
	yamlStr,
	readFrontmatter,
	setFrontmatterKeys,
	spliceGenerated,
	splitNote,
	htmlToMarkdown,
	decodeEntities,
	replaceToFixedPoint
} from './vault-sync-lib.mjs';

const SITE_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const VAULT = vaultRoot();
const PROJECTS_DIR = path.join(VAULT, 'Tâches et projets/Projects');
const DH_DIR = path.join(PROJECTS_DIR, 'DH');
const CONCEPTS_DIR = path.join(VAULT, 'Zotero/Concepts');
const SITE = 'https://www.frederickmadore.com';

const WRITE = process.argv.includes('--write');
const ADOPT = process.argv.includes('--adopt') || WRITE;

/**
 * The site path a record lives at, used as its `website_slug`. It has to carry
 * the section, not just the id: `dh-ai-african-studies` is both a research
 * project and a digital-humanities project, and a bare id would collapse the
 * two onto one note.
 */
const sitePath = (kind, id) => `${kind === 'dh' ? 'digital-humanities' : 'research'}/${id}`;

/**
 * Records whose vault note already exists outside `Projects/`, or under a name
 * no normalisation will match. Without this the script would create a second,
 * competing note beside a hub the vault already links heavily.
 */
const NOTE_ALIASES = {
	'research/digital-research-environment': 'Bayreuth/DRE/Digital Research Environment (DRE).md'
};

// ---- research prose --------------------------------------------------------
// The narrative of a research project lives as markup in its route page, not in
// its data record, because it embeds components. generate-research-prose.mjs
// already flattens it to plain text for the JSON API; here we want Markdown
// instead, keeping the links and turning each <ItemReference> into a wikilink.

const DROPPABLE = ['RelevantGrants'];

function layoutChildren(source, file) {
	const open = source.indexOf('<ResearchProjectLayout');
	if (open === -1) return null; // redirect stubs and other non-project pages
	const close = source.indexOf('</ResearchProjectLayout>');
	if (close === -1) throw new Error(`${file}: unterminated <ResearchProjectLayout>`);

	let depth = 0;
	for (let i = open; i < close; i += 1) {
		const char = source[i];
		if (char === '{') depth += 1;
		else if (char === '}') depth -= 1;
		else if (char === '>' && depth === 0) return source.slice(i + 1, close);
	}
	throw new Error(`${file}: could not find the end of the opening tag`);
}

function slugOf(source, file) {
	const match = source.match(/researchProject\(\s*'([^']+)'\s*\)/);
	if (!match) throw new Error(`${file}: no researchProject('…') call to identify the project`);
	return match[1];
}

/**
 * Route markup → Markdown. Components are resolved or dropped first, so what
 * reaches htmlToMarkdown is the same closed HTML grammar the DH descriptions
 * use; an unknown component raises rather than silently costing a paragraph.
 */
function proseToMarkdown(markup, file, refLink) {
	// Comments go first, so a commented-out component does not trip the unknown
	// component check below. Repeated to a fixed point: a single pass over
	// `<!--…-->` closes `<!<!--x-->-- y -->` up into a fresh comment.
	let text = replaceToFixedPoint(markup, /<!--[\s\S]*?-->/g);

	text = text.replace(/<ItemReference\b[\s\S]*?\/>/g, (tag) => {
		const id = tag.match(/id="([^"]+)"/)?.[1];
		return id ? refLink(id) : '';
	});
	for (const component of DROPPABLE) {
		text = text.replace(new RegExp(`<${component}\\b[\\s\\S]*?/>`, 'g'), '');
		text = text.replace(new RegExp(`<${component}\\b[\\s\\S]*?</${component}>`, 'g'), '');
	}

	const unknown = text.match(/<([A-Z]\w+)/);
	if (unknown) throw new Error(`${file}: unhandled component <${unknown[1]}> in the prose`);
	if (/\{#(if|each|await)/.test(text))
		throw new Error(`${file}: prose contains Svelte control flow, which this cannot read`);

	// A citation lands before the sentence's full stop, leaving " ." behind.
	return htmlToMarkdown(text, file).replace(/ +([.,;:])/g, '$1');
}

// ---- load the site's records ----------------------------------------------

const dhProjects = [];
for (const file of walkData(path.join(SITE_ROOT, 'src/lib/data/digital-humanities'))) {
	const record = await loadModule(file);
	if (record?.id) dhProjects.push(record);
}

const researchProjects = [];
for (const file of walkData(path.join(SITE_ROOT, 'src/lib/data/research'))) {
	const record = await loadModule(file);
	if (record?.id) researchProjects.push(record);
}

const proseBySlug = new Map();
for (const file of globSync('src/routes/research/*/+page.svelte', { cwd: SITE_ROOT }).sort()) {
	const source = readFileSync(path.join(SITE_ROOT, file), 'utf8');
	const children = layoutChildren(source, file);
	if (children === null) continue;
	proseBySlug.set(slugOf(source, file), { markup: children, file });
}

// Short citations for the items cited inline, so an <ItemReference> with no
// vault note behind it still reads as prose instead of vanishing — and reads as
// "(Madore, 2021)" rather than dropping a whole title mid-sentence.
const refById = new Map();
for (const [dir, section] of [
	['communications', 'communications'],
	['publications', 'publications']
]) {
	for (const file of walkData(path.join(SITE_ROOT, 'src/lib/data', dir))) {
		const record = await loadModule(file);
		if (!record?.id) continue;
		const surnames = (record.authors || [])
			.map((a) => String(a).trim().split(/\s+/).pop())
			.filter(Boolean);
		const who =
			surnames.length === 1
				? surnames[0]
				: surnames.length === 2
					? `${surnames[0]} and ${surnames[1]}`
					: surnames.length > 2
						? `${surnames[0]} et al.`
						: '';
		const year = record.year ?? String(record.date || '').match(/\d{4}/)?.[0];
		refById.set(record.id, {
			section,
			title: record.title,
			cite: who && year ? `${who}, ${year}` : null
		});
	}
}

// ---- vault side ------------------------------------------------------------

const bySlug = noteIndexByKey(PROJECTS_DIR, 'website_slug');
for (const [slug, rel] of Object.entries(NOTE_ALIASES)) {
	if (!bySlug.has(slug) && existsSync(path.join(VAULT, rel)))
		bySlug.set(slug, path.join(VAULT, rel));
}
const concepts = noteIndex(CONCEPTS_DIR);
// Communications carry the site id as `slug`; publication records carry the
// site path as `website_slug` once sync-publications-to-vault.mjs has run.
const itemNotes = new Map([
	...noteIndexByKey(path.join(VAULT, 'Université/Communications'), 'slug'),
	...[...noteIndexByKey(path.join(VAULT, 'Université/Publications'), 'website_slug')].map(
		([slug, file]) => [slug.replace(/^publications\//, ''), file]
	)
]);

const refLink = (id) => {
	const note = itemNotes.get(id);
	if (note) return `[[${path.basename(note, '.md')}]]`;
	const ref = refById.get(id);
	if (!ref) return '';
	const label = ref.cite ? `(${ref.cite})` : ref.title;
	return `[${label}](${SITE}/${ref.section}/${id})`;
};

const linkedConcepts = (terms) =>
	[...new Set(terms || [])]
		.map((t) => concepts.get(normKey(t)))
		.filter(Boolean)
		.map((hit) => `[[${hit}]]`);

// ---- rendering -------------------------------------------------------------

/** '2021-2024' / '2025-' / '2025' → [start, end]. */
function splitYears(years) {
	const m = String(years || '').match(/^(\d{4})\s*[-–]?\s*(\d{4})?/);
	if (!m) return [null, null];
	return [m[1], m[2] ?? null];
}

function renderDh(project) {
	const L = [BEGIN, `# ${project.title}`, ''];
	const info = [`> [!info] Digital humanities project · ${project.years}`];
	if (project.award) info.push(`> Award: ${project.award}`);
	for (const link of project.links || [])
		info.push(`> ${(link.type || 'site').replace(/^\w/, (c) => c.toUpperCase())}: ${link.url}`);
	if (project.linkUrl && !(project.links || []).some((l) => l.url === project.linkUrl))
		info.push(`> Site: ${project.linkUrl}`);
	L.push(...info, '');

	if (project.imageUrl) L.push(`![${project.title}](${SITE}${project.imageUrl})`, '');
	L.push(htmlToMarkdown(project.description, project.id), '');

	if (project.skills?.length) {
		L.push('## Skills', '', project.skills.map((s) => `- ${s}`).join('\n'), '');
	}
	if (project.publication) {
		L.push('## Publication', '', `[${project.publication.text}](${project.publication.url})`, '');
	}
	if (project.reviews?.length) {
		L.push('## Reviews', '');
		for (const r of project.reviews) {
			L.push(`- [${r.text}](${r.url})${r.quote ? ` — "${r.quote}"` : ''}`);
		}
		L.push('');
	}
	L.push(
		`*Generated from the website record (\`${project.id}\`). Edits below the marker are preserved on re-sync.*`,
		END
	);
	return L.join('\n');
}

function renderResearch(project) {
	const L = [BEGIN, `# ${project.title}`, ''];
	if (project.subtitle) L.push(`*${project.subtitle}*`, '');

	const info = [`> [!info] Research project · ${project.years}`];
	if (project.funder) info.push(`> Funder: ${project.funder}`);
	if (project.programme) info.push(`> Programme: ${project.programme}`);
	if (project.coDirectors?.length) info.push(`> Co-directors: ${project.coDirectors.join(', ')}`);
	if (project.regions?.length) info.push(`> Regions: ${project.regions.join(', ')}`);
	if (project.sourceLanguages?.length)
		info.push(`> Source languages: ${project.sourceLanguages.join(', ')}`);
	for (const cta of project.ctas || []) info.push(`> ${cta.label}: ${cta.href}`);
	L.push(...info, '');

	if (project.imageSrc)
		L.push(
			`![${project.imageAlt || project.title}](${SITE}/images/research/${project.imageSrc})`,
			''
		);

	const prose = proseBySlug.get(project.id);
	if (prose) L.push(proseToMarkdown(prose.markup, prose.file, refLink), '');
	else L.push(decodeEntities(project.shortDescription), '');

	L.push(
		`*Generated from the website record (\`${project.id}\`) and its route page. Edits below the marker are preserved on re-sync.*`,
		END
	);
	return L.join('\n');
}

/** Frontmatter for a note this script is creating from scratch. */
function seedFrontmatter(project, kind) {
	const [start, end] = splitYears(project.years);
	const url = `${SITE}/${sitePath(kind, project.id)}`;
	const github = (project.links || []).find((l) => l.type === 'code')?.url;
	const tags = (kind === 'dh' ? project.skills : project.regions) || [];

	const lines = ['---', 'type: project'];
	lines.push(`project_type: ${kind === 'dh' ? 'dh' : 'research'}`);
	lines.push(`title: ${yamlStr(project.title)}`);
	lines.push(`status: ${project.current === false ? 'completed' : 'active'}`);
	lines.push(`date_start: ${start ?? ''}`);
	lines.push(`date_end: ${end ?? ''}`);
	lines.push('collaborators: []');
	lines.push(`source: ${url}`);
	lines.push(`website_url: ${url}`);
	lines.push(`website_slug: ${sitePath(kind, project.id)}`);
	if (github) lines.push(`github: ${github}`);
	const hyphenated = tags.map(hyphenTag).filter(Boolean);
	if (hyphenated.length) lines.push(`tags: [${hyphenated.join(', ')}]`);
	lines.push('---');
	return lines.join('\n');
}

// ---- adoption --------------------------------------------------------------
// One-time bootstrap: the vault's project notes predate this script and were
// hand-copied from the site, so almost all of them already have a counterpart.
// Match them by title once and stamp the slug in; afterwards the slug is the
// only thing that matters.

const adopted = [];
if (ADOPT) {
	const byTitle = noteIndexByKey(PROJECTS_DIR, 'title');
	const byName = new Map();
	for (const file of globSync('**/*.md', { cwd: PROJECTS_DIR })) {
		byName.set(normKey(path.basename(file, '.md')), path.join(PROJECTS_DIR, file));
	}
	for (const [kind, list] of [
		['dh', dhProjects],
		['research', researchProjects]
	]) {
		for (const project of list) {
			const slug = sitePath(kind, project.id);
			if (bySlug.has(slug)) continue;
			const candidates = [
				project.title,
				project.shortTitle,
				project.cardTitle,
				project.projectName
			];
			let hit = null;
			for (const candidate of candidates) {
				if (!candidate) continue;
				hit = byTitle.get(candidate) || byName.get(normKey(candidate));
				if (hit) break;
			}
			if (!hit) continue;
			if (readFrontmatter(readFileSync(hit, 'utf8')).website_slug) continue;
			adopted.push({ id: slug, kind, note: path.relative(VAULT, hit) });
			bySlug.set(slug, hit);
			if (WRITE) {
				writeFileSync(
					hit,
					setFrontmatterKeys(readFileSync(hit, 'utf8'), { website_slug: slug }),
					'utf8'
				);
			}
		}
	}
}

// ---- main ------------------------------------------------------------------

const stats = { created: 0, adopted: 0, updated: 0, unchanged: 0 };
const drift = [];
const conceptHints = [];

for (const [kind, list] of [
	['dh', dhProjects],
	['research', researchProjects]
]) {
	for (const project of list) {
		const generated = kind === 'dh' ? renderDh(project) : renderResearch(project);
		const slug = sitePath(kind, project.id);
		const url = `${SITE}/${slug}`;
		const target = bySlug.get(slug);

		let full;
		let content;
		let action;

		if (target) {
			full = target;
			const existing = readFileSync(full, 'utf8');
			const spliced = spliceGenerated(existing, generated);
			if (spliced === null) {
				// First sync into a note written by hand. Its body is usually a stale
				// copy of the site's prose, but not only that — these notes carry
				// sections the site never had (`## Key findings`, `## Related`). So
				// the generated block goes on top and the old body is kept verbatim
				// underneath: the vault has no undo, and pruning the now-redundant
				// paragraphs is the user's call, not the script's.
				const { fm, body } = splitNote(existing);
				const head = fm === null ? '' : `---\n${fm}---\n\n`;
				content = `${head}${generated}\n\n## Notes (pre-sync)\n\n${body.trim()}\n`;
				action = 'adopted';
			} else {
				content = spliced;
				action = 'updated';
			}
			content = setFrontmatterKeys(content, {
				title: yamlStr(project.title),
				website_url: url,
				website_slug: slug
			});

			const fm = readFrontmatter(existing);
			const [start] = splitYears(project.years);
			if (fm.date_start && start && fm.date_start !== start)
				drift.push(`${path.basename(full)}: date_start ${fm.date_start} ≠ site ${start}`);

			if (content === existing) {
				action = 'unchanged';
				content = null;
			}
		} else {
			const dir = kind === 'dh' ? DH_DIR : PROJECTS_DIR;
			full = path.join(dir, `${sanitizeFilename(project.title)}.md`);
			content = `${seedFrontmatter(project, kind)}\n\n${generated}\n\n## My notes\n`;
			action = 'created';
		}

		stats[action] += 1;
		if (WRITE && content) {
			mkdirSync(path.dirname(full), { recursive: true });
			writeFileSync(full, content, 'utf8');
		}
		if (action !== 'unchanged') console.log(`${action.padEnd(9)} ${path.relative(VAULT, full)}`);

		const hits = linkedConcepts(kind === 'dh' ? project.skills : project.regions);
		if (hits.length) conceptHints.push(`${project.id}: ${hits.join(' · ')}`);
	}
}

// Vault notes that claim a slug the site no longer has — a renamed or retired record.
const knownIds = new Set([
	...dhProjects.map((p) => sitePath('dh', p.id)),
	...researchProjects.map((p) => sitePath('research', p.id))
]);
const orphans = [...bySlug.entries()]
	.filter(([id]) => !knownIds.has(id))
	.map(([id, file]) => `${path.relative(VAULT, file)} → website_slug: ${id}`);

console.log('\n--- summary ---');
console.log(`records: ${dhProjects.length} DH + ${researchProjects.length} research`);
console.log(
	`created: ${stats.created}  adopted: ${stats.adopted}  updated: ${stats.updated}  unchanged: ${stats.unchanged}`
);
if (adopted.length) {
	console.log(`\nadopted (title match → website_slug), review these:`);
	for (const a of adopted) console.log(`  ${a.id}  ←  ${a.note}`);
}
if (drift.length) {
	console.log('\ndrift in vault-owned fields (reported, not changed):');
	for (const d of drift) console.log(`  ${d}`);
}
if (orphans.length) {
	console.log('\nvault notes pointing at a slug the site no longer has:');
	for (const o of orphans) console.log(`  ${o}`);
}
if (conceptHints.length) {
	console.log('\nconcept notes matching project keywords (link them by hand if useful):');
	for (const c of conceptHints) console.log(`  ${c}`);
}
console.log(WRITE ? '\nWROTE to vault.' : '\nDRY RUN — re-run with --write to apply.');
