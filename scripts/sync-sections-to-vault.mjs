// sync-sections-to-vault.mjs
// Mirror each section landing page's standfirst — the framing paragraph under
// the H1 at /digital-humanities, /publications — into the vault's hub note for
// that section, together with a complete index of the records it covers.
//
//   node scripts/sync-sections-to-vault.mjs           # dry run
//   node scripts/sync-sections-to-vault.mjs --write   # apply
//
// Requires OBSIDIAN_VAULT.
//
// Unlike the project and publication syncs, a hub note's body is *not* treated
// as a stale copy to be pruned: the vault's own hub groups projects thematically
// (Digital Archives, AI Pipelines, Conversational Interfaces…) in a way the site
// never has. So the generated block is inserted above whatever is already there
// and the rest of the note is left alone. What the block adds is the site's
// framing sentence and an index that cannot fall behind, since it is rebuilt
// from the data every run.
//
// Matching uses `website_section`, not `website_slug`, so these hub notes are
// invisible to sync-projects-to-vault.mjs and never look like orphaned records.

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import {
	BEGIN,
	END,
	vaultRoot,
	walkData,
	loadModule,
	noteIndexByKey,
	yamlStr,
	splitNote,
	setFrontmatterKeys,
	spliceGenerated,
	htmlToMarkdown
} from './vault-sync-lib.mjs';

const SITE_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const VAULT = vaultRoot();
const SITE = 'https://www.frederickmadore.com';
const WRITE = process.argv.includes('--write');

const TYPE_LABEL = {
	book: 'Books',
	article: 'Journal articles',
	chapter: 'Book chapters',
	'special-issue': 'Special issues',
	report: 'Reports',
	encyclopedia: 'Encyclopedia entries',
	blogpost: 'Blog posts',
	'phd-dissertation': 'PhD dissertations',
	'masters-thesis': "Master's theses",
	'conference-proceedings': 'Conference proceedings',
	'bulletin-article': 'Bulletin articles',
	'working-paper': 'Working papers'
};

const SECTIONS = [
	{
		id: 'digital-humanities',
		title: 'Digital Humanities',
		page: 'src/routes/digital-humanities/+page.svelte',
		data: 'src/lib/data/digital-humanities',
		note: 'Tâches et projets/Projects/DH/Digital Humanities.md',
		// A full roster: the hand-made thematic index below the marker is
		// curated, and curation falls behind. This one cannot.
		index: (records, linkFor) => {
			const lines = ['## All projects on the site', ''];
			for (const r of [...records].sort((a, b) => a.title.localeCompare(b.title))) {
				const desc = r.shortDescription ? ` — ${r.shortDescription}` : '';
				lines.push(`- ${linkFor(`digital-humanities/${r.id}`, r.title)}${desc}`);
			}
			return lines;
		}
	},
	{
		id: 'publications',
		title: 'Publications',
		page: 'src/routes/publications/+page.svelte',
		data: 'src/lib/data/publications',
		note: 'Université/Publications/Publications.md',
		// 44 records would only restate Publications.base, so count by type and
		// send the reader to the base for the list itself.
		index: (records) => {
			const freq = new Map();
			for (const r of records) freq.set(r.type, (freq.get(r.type) ?? 0) + 1);
			const lines = [
				'## Browse',
				'',
				'- [[Publications.base|Publications — filterable]] — by year, type, project, reception',
				'',
				'## By type',
				''
			];
			for (const [type, n] of [...freq].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])))
				lines.push(`- **${TYPE_LABEL[type] || type}** — ${n}`);
			return lines;
		}
	}
];

/** The framing paragraph under the H1, as Markdown. */
function standfirst(file) {
	const source = readFileSync(path.join(SITE_ROOT, file), 'utf8');
	const m = source.match(/<p class="standfirst">([\s\S]*?)<\/p\s*>/);
	if (!m) return null;
	// A Svelte expression here would silently become literal braces in the note.
	if (/[{}]/.test(m[1])) throw new Error(`${file}: standfirst contains a Svelte expression`);
	return htmlToMarkdown(`<p>${m[1]}</p>`, file);
}

const recordNotes = new Map([
	...noteIndexByKey(path.join(VAULT, 'Tâches et projets/Projects'), 'website_slug'),
	...noteIndexByKey(path.join(VAULT, 'Université/Publications'), 'website_slug')
]);
const linkFor = (slug, fallback) => {
	const note = recordNotes.get(slug);
	return note ? `[[${path.basename(note, '.md')}]]` : `[${fallback}](${SITE}/${slug})`;
};

const bySection = new Map([
	...noteIndexByKey(path.join(VAULT, 'Tâches et projets/Projects'), 'website_section'),
	...noteIndexByKey(path.join(VAULT, 'Université'), 'website_section')
]);

const stats = { created: 0, adopted: 0, updated: 0, unchanged: 0 };

for (const section of SECTIONS) {
	const lead = standfirst(section.page);
	if (!lead) {
		console.log(`skipped   ${section.id} — no <p class="standfirst"> on the landing page`);
		continue;
	}

	const records = [];
	for (const file of walkData(path.join(SITE_ROOT, section.data))) {
		const record = await loadModule(file);
		if (record?.id) records.push(record);
	}

	const url = `${SITE}/${section.id}`;
	const generated = [
		BEGIN,
		`# ${section.title}`,
		'',
		lead,
		'',
		`[${url}](${url}) · ${records.length} records`,
		'',
		...section.index(records, linkFor),
		'',
		`*Generated from the ${section.id} landing page. Everything below the marker is hand-maintained and left untouched.*`,
		END
	].join('\n');

	const target = bySection.get(section.id) ?? path.join(VAULT, section.note);
	let existing = null;
	try {
		existing = readFileSync(target, 'utf8');
	} catch (err) {
		if (err.code !== 'ENOENT') throw err;
	}

	let content;
	let action;
	if (existing === null) {
		const fm = [
			'---',
			'type: index',
			`title: ${yamlStr(section.title)}`,
			`website_section: ${section.id}`,
			`website_url: ${url}`,
			'tags: [index]',
			'---'
		].join('\n');
		content = `${fm}\n\n${generated}\n`;
		action = 'created';
	} else {
		const spliced = spliceGenerated(existing, generated);
		if (spliced === null) {
			// First run against a hand-written hub: the block goes on top, the
			// curated index underneath, verbatim and unlabelled.
			const { fm, body } = splitNote(existing);
			const head = fm === null ? '' : `---\n${fm}---\n\n`;
			content = `${head}${generated}\n\n${body.trim()}\n`;
			action = 'adopted';
		} else {
			content = spliced;
			action = 'updated';
		}
		content = setFrontmatterKeys(content, {
			website_section: section.id,
			website_url: url
		});
		if (content === existing) {
			action = 'unchanged';
			content = null;
		}
	}

	stats[action] += 1;
	if (WRITE && content) {
		mkdirSync(path.dirname(target), { recursive: true });
		writeFileSync(target, content, 'utf8');
	}
	console.log(`${action.padEnd(9)} ${path.relative(VAULT, target)}  (${records.length} records)`);
}

console.log('\n--- summary ---');
console.log(
	`created: ${stats.created}  adopted: ${stats.adopted}  updated: ${stats.updated}  unchanged: ${stats.unchanged}`
);
console.log(WRITE ? '\nWROTE to vault.' : '\nDRY RUN — re-run with --write to apply.');
