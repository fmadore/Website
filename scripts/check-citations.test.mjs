import { spawnSync } from 'node:child_process';
import { mkdtempSync, readdirSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { beforeAll, describe, expect, it } from 'vitest';
import { hadjCoteDIvoire } from '../src/lib/data/publications/articles/hadj-cote-divoire-2018.ts';

const ROOT = fileURLToPath(new URL('../', import.meta.url));
const HADJ_FILE = 'src/lib/data/publications/articles/hadj-cote-divoire-2018.ts';
const recorded = hadjCoteDIvoire.citedBy.find((citation) =>
	citation.url?.startsWith('https://doi.org/')
);

/**
 * Every `openAlexId` the real data files record. The CLI looks each one up, so
 * a clean run has to find each under the author; otherwise the fixture would
 * fail the day an id is committed.
 */
const PUBLICATIONS_DIR = join(ROOT, 'src/lib/data/publications');
const recordedIds = readdirSync(PUBLICATIONS_DIR, { recursive: true })
	.filter((file) => String(file).endsWith('.ts'))
	.flatMap((file) => [
		...readFileSync(join(PUBLICATIONS_DIR, String(file)), 'utf8').matchAll(
			/^\topenAlexId: '(W\d+)'/gm
		)
	])
	.map((match) => match[1]);
const pinnedWorks = recordedIds.map((id) => ({
	id: `https://openalex.org/${id}`,
	doi: null,
	title: `Fixture record ${id}`,
	type: 'other',
	publication_year: 2020,
	cited_by_count: 0
}));

const hadjWork = (citedByCount) => ({
	id: 'https://openalex.org/W123',
	doi: `https://doi.org/${hadjCoteDIvoire.doi}`,
	title: hadjCoteDIvoire.title,
	type: 'article',
	publication_year: hadjCoteDIvoire.year,
	cited_by_count: citedByCount,
	authorships: [{ author: { id: 'https://openalex.org/A999', display_name: 'Someone Else' } }]
});

/**
 * Run the real CLI with only HTTP stubbed. It loads the committed TypeScript
 * records without Vite, a site build or installed app dependencies.
 *
 * `orcid` and `author` answer the two author routes; `indexed` is every work
 * OpenAlex holds, which the DOI and id lookups search; `cites` answers each
 * `cites:` query.
 */
function runWatcher({ orcid, author, indexed, cites }) {
	const directory = mkdtempSync(join(tmpdir(), 'citation-watch-'));
	const reportPath = join(directory, 'report.md');
	const fixture = { orcid, author, indexed, cites };
	const preload = `
		const fixture = ${JSON.stringify(fixture)};
		const answer = (filter) => {
			if (filter === 'author.orcid:0000-0003-0959-2092') return fixture.orcid;
			if (filter === 'author.id:A5000010243') return fixture.author;
			const colon = filter.indexOf(':');
			const attribute = filter.slice(0, colon);
			const values = filter.slice(colon + 1).toLowerCase().split('|');
			if (attribute === 'doi') {
				return fixture.indexed.filter((w) => w.doi && values.includes(w.doi.toLowerCase()));
			}
			if (attribute === 'ids.openalex') {
				return fixture.indexed.filter((w) => values.includes(w.id.split('/').pop().toLowerCase()));
			}
			return fixture.cites[filter];
		};
		globalThis.fetch = async (input) => {
			const url = new URL(input);
			const results = answer(url.searchParams.get('filter') ?? '');
			if (url.origin !== 'https://api.openalex.org' || url.pathname !== '/works' || !results) {
				throw new Error('Unexpected request: ' + url);
			}
			return Response.json({ results, meta: { next_cursor: null } });
		};
	`;
	try {
		const result = spawnSync(
			process.execPath,
			[
				'--import',
				`data:text/javascript,${encodeURIComponent(preload)}`,
				'scripts/check-citations.mjs',
				'--skip-discovery',
				`--report=${reportPath}`
			],
			{ cwd: ROOT, encoding: 'utf8', timeout: 10_000 }
		);
		expect(result.error).toBeUndefined();
		expect(result.status, result.stderr).toBe(0);
		expect(result.stderr).not.toMatch(/could not fetch|OpenAlex unreachable|lookup failed/);
		return { stdout: result.stdout, report: readFileSync(reportPath, 'utf8') };
	} finally {
		rmSync(directory, { recursive: true, force: true });
	}
}

const citingFixtures = (includeNew) => {
	const citing = [
		{
			doi: recorded.url,
			title: 'Already recorded citation with an alternate indexed title',
			type: 'article',
			publication_year: recorded.year
		}
	];
	if (includeNew) {
		citing.push({
			doi: 'https://doi.org/10.9999/citation-watch-regression',
			title: 'New citation regression fixture',
			type: 'article',
			publication_year: 2026
		});
	}
	return citing;
};

it.each([false, true])(
	'runs the citation CLI under plain Node with the real publication files (new citation: %s)',
	(includeNew) => {
		const citing = citingFixtures(includeNew);
		const own = [hadjWork(citing.length), ...pinnedWorks];
		const { stdout, report } = runWatcher({
			orcid: own,
			author: own,
			indexed: own,
			cites: { 'cites:W123': citing }
		});
		expect(stdout).toMatch(
			new RegExp(
				`[1-9]\\d* local publications; OpenAlex: ${own.length} works under ORCID .*, ` +
					`1 of [1-9]\\d* DOIs, ${recordedIds.length} of ${recordedIds.length} recorded ids`
			)
		);
		expect(report).toContain(`<!-- citation-watch: ${includeNew ? 'findings' : 'clean'} -->`);
		expect(report).not.toContain('Already recorded citation');
		expect(report).not.toContain('works not on the site');
		expect(report).not.toContain('does not file under the author');
		expect(report).not.toContain('no longer resolve');
		if (includeNew) {
			expect(report).toContain('## 1 new citation');
			expect(report).toContain('New citation regression fixture');
			expect(report).toContain(HADJ_FILE);
		} else {
			expect(report).toContain('Nothing new.');
		}
	}
);

describe('a work OpenAlex has detached from the author', () => {
	let report;
	beforeAll(() => {
		const citing = citingFixtures(true);
		({ report } = runWatcher({
			orcid: pinnedWorks,
			author: pinnedWorks,
			indexed: [hadjWork(citing.length), ...pinnedWorks],
			cites: { 'cites:W123': citing }
		}));
	});

	it('is still found through its DOI, and its citations still followed', () => {
		expect(report).toContain('## 1 new citation');
		expect(report).toContain('New citation regression fixture');
	});

	it('is reported as misattributed, with the record it is filed under', () => {
		expect(report).toContain('<!-- citation-watch: findings -->');
		expect(report).toContain('## 1 publication OpenAlex does not file under the author');
		expect(report).toContain(HADJ_FILE);
		expect(report).toContain('[W123](https://openalex.org/W123), filed under Someone Else (A999)');
	});
});
