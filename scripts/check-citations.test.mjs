import { spawnSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { expect, it } from 'vitest';
import { hadjCoteDIvoire } from '../src/lib/data/publications/articles/hadj-cote-divoire-2018.ts';

const ROOT = fileURLToPath(new URL('../', import.meta.url));
const recorded = hadjCoteDIvoire.citedBy.find((citation) =>
	citation.url?.startsWith('https://doi.org/')
);

it.each([false, true])(
	'runs the citation CLI under plain Node with the real publication files (new citation: %s)',
	(includeNew) => {
		const directory = mkdtempSync(join(tmpdir(), 'citation-watch-'));
		const reportPath = join(directory, 'report.md');
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
		const responses = {
			'author.orcid:0000-0003-0959-2092': [
				{
					id: 'https://openalex.org/W123',
					doi: `https://doi.org/${hadjCoteDIvoire.doi}`,
					title: hadjCoteDIvoire.title,
					type: 'article',
					publication_year: hadjCoteDIvoire.year,
					cited_by_count: citing.length
				}
			],
			'cites:W123': citing
		};
		// Only HTTP is stubbed. The actual CLI loads the committed TypeScript
		// records without Vite, a site build or installed app dependencies.
		const preload = `
			const responses = ${JSON.stringify(responses)};
			globalThis.fetch = async (input) => {
				const url = new URL(input);
				const results = responses[url.searchParams.get('filter')];
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
			expect(result.stderr).not.toMatch(/could not fetch|OpenAlex unreachable/);
			expect(result.stdout).toMatch(/[1-9]\d* local publications, 1 OpenAlex works/);
			const report = readFileSync(reportPath, 'utf8');
			expect(report).toContain(`<!-- citation-watch: ${includeNew ? 'findings' : 'clean'} -->`);
			expect(report).not.toContain('Already recorded citation');
			expect(report).not.toContain('works not on the site');
			if (includeNew) {
				expect(report).toContain('## 1 new citation');
				expect(report).toContain('New citation regression fixture');
				expect(report).toContain('src/lib/data/publications/articles/hadj-cote-divoire-2018.ts');
			} else {
				expect(report).toContain('Nothing new.');
			}
		} finally {
			rmSync(directory, { recursive: true, force: true });
		}
	}
);
