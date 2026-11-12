import { describe, expect, it } from 'vitest';
import { globSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

/**
 * The hardcoded-author-name ratchet.
 *
 * CLAUDE.md § Author/Affiliation Data: author information comes from
 * `#lib/data/siteConfig.ts` (`author.name`), never a literal. The rule was
 * written for JSON-LD and SEO metadata and had about thirty exceptions by the
 * November 2026 audit (6 #13): SEO `description`/`keywords` props, the
 * masthead, the mobile menu, the PDF CV. None of them is wrong today; each is
 * a place a change of name, accent or credential would miss.
 *
 * So this is a ratchet, not a ban. The offenders that exist are listed with
 * their counts. The test fails when a file not listed starts spelling the name,
 * when a listed file spells it more often, and when a listed file spells it
 * less often or not at all, so the list is lowered in the same commit as the
 * fix and can only shrink.
 *
 * Scope: site code (`src/routes`, `src/lib`) minus the data modules, where the
 * name is content (author lists, bylines), tests and `siteConfig` itself.
 * Comments are ignored: prose that quotes a title format is not a literal.
 */

const root = fileURLToPath(new URL('../..', import.meta.url));
const NAME = /Fr[ée]d[ée]rick[\s_]?Madore/g;

/** Current offenders, file → occurrences. Lower a count when you fix one. */
const RATCHET: Record<string, number> = {
	'lib/SEO.svelte': 1,
	'lib/components/menu/Header.svelte': 1,
	'lib/components/menu/MobileMenu.svelte': 1,
	'lib/utils/pdfCvGenerator.ts': 2,
	'lib/utils/pdfCvLayout.ts': 1,
	// The Academia.edu profile URL in the Person `sameAs`: a slug, not prose,
	// but a profile that belongs in siteConfig's `socialLinks` with the others.
	'lib/utils/jsonLdSchemas.ts': 1,
	'routes/+page.svelte': 3,
	'routes/activities/+page.svelte': 2,
	'routes/conference-activity/+page.svelte': 2,
	'routes/conference-activity/slides/+page.svelte': 2,
	'routes/conference-activity/visualisations/+page.svelte': 1,
	'routes/cv/+page.svelte': 1,
	'routes/digital-humanities/+page.svelte': 2,
	'routes/digital-humanities/[id]/+page.svelte': 1,
	'routes/publications/+page.svelte': 2,
	'routes/publications/citations/+page.svelte': 2,
	'routes/publications/visualisations/+page.svelte': 1,
	'routes/research/+page.svelte': 2,
	'routes/style-guide/+page.svelte': 2,
	'routes/teaching/+page.svelte': 2,
	'routes/teaching/guest-lectures/+page.svelte': 2
};

function stripComments(text: string): string {
	return text
		.replace(/<!--[\s\S]*?-->/g, '')
		.replace(/\/\*[\s\S]*?\*\//g, '')
		.replace(/(^|[^:\\])\/\/.*$/gm, '$1');
}

function scan(): Record<string, number> {
	const found: Record<string, number> = {};
	const files = globSync('{routes,lib}/**/*.{ts,js,svelte}', { cwd: root })
		.map((f) => f.replace(/\\/g, '/'))
		.filter(
			(f) =>
				!f.startsWith('lib/data/') &&
				!f.startsWith('lib/test-support/') &&
				!/\.(test|spec)\.ts$|\.d\.ts$/.test(f)
		);
	for (const file of files) {
		const count = (stripComments(readFileSync(`${root}/${file}`, 'utf8')).match(NAME) ?? []).length;
		if (count > 0) found[file] = count;
	}
	return found;
}

describe('the author’s name comes from siteConfig', () => {
	const found = scan();

	it('scans site code', () => {
		// A collapsed glob would make every assertion below pass vacuously.
		expect(Object.keys(found).length).toBeGreaterThan(0);
	});

	it('appears in no file outside the ratchet', () => {
		const added = Object.keys(found).filter((f) => !(f in RATCHET));
		expect(
			added,
			'Spell the name as `author.name` from #lib/data/siteConfig.ts, not as a literal.'
		).toEqual([]);
	});

	it('only ever shrinks: every listed count is exact', () => {
		const drift = Object.entries(RATCHET)
			.filter(([file, count]) => (found[file] ?? 0) !== count)
			.map(([file, count]) => `${file}: listed ${count}, found ${found[file] ?? 0}`);
		expect(
			drift,
			'A count went up: use `author.name`. A count went down: lower it here (drop the entry at 0).'
		).toEqual([]);
	});
});
