// sync-projects-to-vault.mjs
// Generate Obsidian notes for every research project and digital-humanities
// project from the site's typed data, mirroring what sync-talks-to-vault.mjs
// does for communications.
//
//   node scripts/vault/sync-projects-to-vault.mjs            # dry run (prints plan)
//   node scripts/vault/sync-projects-to-vault.mjs --adopt    # dry run + slug matches
//   node scripts/vault/sync-projects-to-vault.mjs --write    # apply
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
//   owned  — `title`, `website_url`, `website_slug`, `website_group` (a DH
//            record's group on the site: `project`, or `software` for an
//            application), and the marked block
//   seeded — everything else, written once at creation and never again
// Drift in seeded fields is reported at the end, not silently corrected.

import { readFileSync, writeFileSync, globSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { getContributorNames } from '../../src/lib/utils/contributor.ts';
import { applicationSummary, projectGroup } from '../../src/lib/utils/projectGroups.ts';
import {
	BEGIN,
	END,
	vaultRoot,
	walkData,
	loadModule,
	normKey,
	noteIndex,
	hyphenTag,
	yamlStr,
	readFrontmatter,
	setFrontmatterKeys,
	spliceGenerated,
	splitNote,
	htmlToMarkdown,
	decodeEntities,
	replaceToFixedPoint,
	createNote
} from '../lib/vault-sync-lib.mjs';
import {
	loadProjects,
	loadPublications,
	loadTalks,
	planProjectNotes,
	planPublicationNotes,
	planTalkNotes,
	projectSitePath,
	noteName
} from '../lib/vault-notes.mjs';

const SITE_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const VAULT = vaultRoot();
const CONCEPTS_DIR = path.join(VAULT, 'Zotero/Concepts');
const SITE = 'https://www.frederickmadore.com';

const WRITE = process.argv.includes('--write');
const ADOPT = process.argv.includes('--adopt') || WRITE;

// A project's `website_slug` is its site path (projectSitePath), and the notes
// that live outside Projects/ are PROJECT_NOTE_ALIASES, both in vault-notes.
const sitePath = projectSitePath;

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

const { dh: dhProjects, research: researchProjects } = await loadProjects(SITE_ROOT);

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
/** projectName → the publications and talks that name it, newest first. */
const membersByProject = new Map();
const addMember = (projectName, section, record) => {
	if (!projectName) return;
	if (!membersByProject.has(projectName))
		membersByProject.set(projectName, { publications: [], communications: [] });
	membersByProject.get(projectName)[section].push(record);
};
for (const [dir, section] of [
	['communications', 'communications'],
	['publications', 'publications']
]) {
	for (const file of walkData(path.join(SITE_ROOT, 'src/lib/data', dir))) {
		const record = await loadModule(file);
		if (!record?.id) continue;
		// Credits may be linked to the people registry ({ name, personId }); read the name.
		const surnames = getContributorNames(record.authors)
			.map((a) => a.trim().split(/\s+/).pop())
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
		addMember(record.project, section, record);
	}
}
for (const members of membersByProject.values())
	for (const list of Object.values(members))
		list.sort((a, b) => String(b.dateISO || '').localeCompare(String(a.dateISO || '')));

// Grants and fieldwork carry the same `project` label; neither has a vault note.
const grantsByProject = new Map();
for (const file of walkData(path.join(SITE_ROOT, 'src/lib/data/grants'))) {
	const grant = await loadModule(file);
	if (!grant?.project) continue;
	if (!grantsByProject.has(grant.project)) grantsByProject.set(grant.project, []);
	grantsByProject.get(grant.project).push(grant);
}
const fieldworkByProject = new Map();
for (const file of walkData(path.join(SITE_ROOT, 'src/lib/data/fieldworks'))) {
	const fieldwork = await loadModule(file);
	if (!fieldwork?.project) continue;
	if (!fieldworkByProject.has(fieldwork.project)) fieldworkByProject.set(fieldwork.project, []);
	fieldworkByProject.get(fieldwork.project).push(fieldwork);
}

// ---- vault side ------------------------------------------------------------

// Which note is each project's (by `website_slug`, a vault alias, a title match
// to adopt, or a new one), and which note each talk and publication has or
// will have once its own sync runs: planned, not looked up, so one full sync
// draws every link although the talks sync runs after this one (vault-notes).
const { notes: projectNotes, bySlug } = planProjectNotes(
	VAULT,
	{ dh: dhProjects, research: researchProjects },
	{ adopt: ADOPT }
);
const concepts = noteIndex(CONCEPTS_DIR);
const itemNotes = new Map(
	[
		...planTalkNotes(VAULT, await loadTalks(SITE_ROOT)).notes,
		...planPublicationNotes(VAULT, await loadPublications(SITE_ROOT)).notes
	].flatMap(([id, entry]) => {
		const name = noteName(entry);
		return name ? [[id, name]] : [];
	})
);

const refLink = (id) => {
	const note = itemNotes.get(id);
	if (note) return `[[${note}]]`;
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
	const app = project.application;
	// The site files a record carrying an `application` block under Software &
	// applications (projectGroup); the note says the same.
	const info = [
		`> [!info] ${app ? 'Application' : 'Digital humanities project'} · ${project.years}`
	];
	if (app) {
		info.push(`> ${applicationSummary(app)}`);
		if (app.interfaceLanguages?.length)
			info.push(`> Interface: ${app.interfaceLanguages.join(', ')}`);
	}
	if (project.award) info.push(`> Award: ${project.award}`);
	for (const link of project.links || [])
		info.push(`> ${(link.type || 'site').replace(/^\w/, (c) => c.toUpperCase())}: ${link.url}`);
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

	// What belongs to the project, joined on its `projectName` as the site and
	// the JSON API join it.
	const members = membersByProject.get(project.projectName);
	const dated = (record) => (record.year ? `${record.year} · ` : '');
	if (members?.publications.length) {
		L.push(`## Publications (${members.publications.length})`, '');
		for (const pub of members.publications)
			L.push(
				`- ${dated(pub)}${itemNotes.has(pub.id) ? refLink(pub.id) : `[${pub.title}](${SITE}/publications/${pub.id})`}`
			);
		L.push('');
	}
	if (members?.communications.length) {
		L.push(`## Talks (${members.communications.length})`, '');
		for (const talk of members.communications)
			L.push(
				`- ${dated(talk)}${itemNotes.has(talk.id) ? refLink(talk.id) : `[${talk.title}](${SITE}/communications/${talk.id})`}`
			);
		L.push('');
	}
	const grants = grantsByProject.get(project.projectName) ?? [];
	if (grants.length) {
		L.push(`## Grants (${grants.length})`, '');
		for (const grant of [...grants].sort((a, b) => b.startYear - a.startYear)) {
			const amount = grant.amount
				? `, ${grant.amount.toLocaleString('en-GB')} ${grant.currency ?? ''}`.trimEnd()
				: '';
			L.push(`- ${grant.dateRangeString} · ${grant.funder}: ${grant.title}${amount}`);
		}
		L.push('');
	}
	const fieldwork = fieldworkByProject.get(project.projectName) ?? [];
	if (fieldwork.length) {
		L.push(`## Fieldwork (${fieldwork.length})`, '');
		for (const trip of [...fieldwork].sort((a, b) => b.year - a.year))
			L.push(`- ${trip.date} · ${trip.city}, ${trip.country}`);
		L.push('');
	}

	L.push(
		`*Generated from the website record (\`${project.id}\`) and its route page. Edits below the marker are preserved on re-sync.*`,
		END
	);
	return L.join('\n');
}

/**
 * 'active' or 'completed', as the site reads `current`: a record that omits it
 * is a past project (`pastResearchProjects` filters on `!project.current`).
 */
const researchStatus = (project) => (project.current ? 'active' : 'completed');

/** Frontmatter for a note this script is creating from scratch. */
function seedFrontmatter(project, kind) {
	const [start, end] = splitYears(project.years);
	const url = `${SITE}/${sitePath(kind, project.id)}`;
	const github = (project.links || []).find((l) => l.type === 'code')?.url;
	const tags = (kind === 'dh' ? project.skills : project.regions) || [];

	const lines = ['---', 'type: project'];
	lines.push(`project_type: ${kind === 'dh' ? 'dh' : 'research'}`);
	if (kind === 'dh') lines.push(`website_group: ${projectGroup(project)}`);
	lines.push(`title: ${yamlStr(project.title)}`);
	// Only research projects carry `current`; a DH record has no such flag, so
	// its note is seeded active, as it always was, and its status is the user's.
	lines.push(`status: ${kind === 'research' ? researchStatus(project) : 'active'}`);
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
// Match them by title once (planProjectNotes, under ADOPT) and stamp the slug
// in, with the rest of the owned keys; afterwards the slug is the only thing
// that matters.

const adopted = [...projectNotes]
	.filter(([, entry]) => entry.status === 'adopted')
	.map(([slug, entry]) => ({ id: slug, note: path.relative(VAULT, entry.file) }));

// ---- main ------------------------------------------------------------------

const stats = { created: 0, adopted: 0, updated: 0, unchanged: 0, conflict: 0 };
const conflicts = [];
const drift = [];
const conceptHints = [];

for (const [kind, list] of [
	['dh', dhProjects],
	['research', researchProjects]
]) {
	for (const project of list) {
		const generated = kind === 'dh' ? renderDh(project) : renderResearch(project);
		const slug = projectSitePath(kind, project.id);
		const url = `${SITE}/${slug}`;
		const note = projectNotes.get(slug);
		const full = note.file;

		let content;
		let action;

		if (note.status === 'existing' || note.status === 'adopted') {
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
				website_slug: slug,
				...(kind === 'dh' ? { website_group: projectGroup(project) } : {})
			});

			const fm = readFrontmatter(existing);
			const [start, end] = splitYears(project.years);
			if (fm.date_start && start && fm.date_start !== start)
				drift.push(`${path.basename(full)}: date_start ${fm.date_start} ≠ site ${start}`);
			// An empty end on either side counts: a project the site has since closed
			// (or reopened) is exactly the change worth reporting. A note with no
			// `date_end` key at all is hand-made, and is not compared.
			if (fm.date_end !== undefined && fm.date_end !== (end ?? ''))
				drift.push(
					`${path.basename(full)}: date_end ${fm.date_end || '(open)'} ≠ site ${end ?? '(open)'}`
				);
			// A research project the site has concluded (or reopened) since the note was written.
			if (kind === 'research' && fm.status) {
				const siteStatus = researchStatus(project);
				if (['active', 'completed'].includes(fm.status) && fm.status !== siteStatus)
					drift.push(`${path.basename(full)}: status ${fm.status} ≠ site ${siteStatus}`);
			}

			if (content === existing) {
				action = 'unchanged';
				content = null;
			}
		} else {
			content = `${seedFrontmatter(project, kind)}\n\n${generated}\n\n## My notes\n`;
			// Never on top of a note already at that path (#234): adoption skips a
			// note that carries another slug, and a dry run without --adopt does
			// not adopt at all (see planProjectNotes).
			action = note.status === 'new' ? 'created' : 'conflict';
		}

		if (WRITE && action === 'created') {
			if (!createNote(full, content)) action = 'conflict';
		} else if (WRITE && content && action !== 'conflict') {
			writeFileSync(full, content, 'utf8');
		}
		if (action === 'conflict')
			conflicts.push(`${path.relative(VAULT, full)} ← website_slug: ${slug}`);

		stats[action] += 1;
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
	`created: ${stats.created}  adopted: ${stats.adopted}  updated: ${stats.updated}  unchanged: ${stats.unchanged}  conflict: ${stats.conflict}`
);
if (conflicts.length) {
	console.log(
		'\nnot created, a note already sits at the path (left untouched; add the' +
			' website_slug to it to adopt it, or rename it' +
			(ADOPT ? '' : '; --adopt previews title matches') +
			'):'
	);
	for (const c of conflicts) console.log(`  ${c}`);
}
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
