import { describe, it, expect } from 'vitest';
import { readFileSync, globSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

/**
 * The hairline pairing guard.
 *
 * A rule and a box edge share a 1px width and nothing else. They are two jobs
 * and they take two tokens:
 *
 *   a rule (separates)   → var(--rule-hairline) solid var(--color-hairline)
 *   a box edge (encloses) → var(--border-width-thin) solid var(--color-border)
 *
 * Crossing the pair fails *silently*. A separator drawn in `--color-border`
 * does not look broken — it looks like a plate edge, one step too dark, and
 * nothing in lint, type-check or the browser complains. That is exactly how
 * `.ledger-row` (the universal record idiom), the bibliography separators and
 * the facet rules all sat one step off the documented ramp while the CV and
 * the panels drew the identical role correctly: 39 declarations one way, 25
 * the other, both introduced in the same commit.
 *
 * This test is the thing that was missing. It reads the real stylesheets and
 * components rather than restating the rule, so crossing the pair fails loudly.
 *
 * See: DESIGN.md § The Hairline Pairing Rule, and /style-guide § 3.
 */

const root = fileURLToPath(new URL('..', import.meta.url));

/** Every authored style source: global CSS plus component/route `<style>`. */
function styleSources(): { file: string; source: string }[] {
	const files = globSync('**/*.{css,svelte}', { cwd: root })
		.filter((f) => !f.includes('node_modules'))
		.map((f) => f.replace(/\\/g, '/'));
	return files.map((file) => ({
		file,
		// Strip comments so a declaration quoted in prose is not read as code.
		source: readFileSync(`${root}/${file}`, 'utf8').replace(/\/\*[\s\S]*?\*\//g, '')
	}));
}

const sources = styleSources();

/** `file:line — declaration` for every match, so a failure names the site. */
function findDeclarations(pattern: RegExp): string[] {
	const hits: string[] = [];
	for (const { file, source } of sources) {
		source.split('\n').forEach((line, i) => {
			if (pattern.test(line)) hits.push(`${file}:${i + 1} — ${line.trim()}`);
		});
	}
	return hits;
}

describe('the hairline pairing', () => {
	it('reads a representative sample of style sources', () => {
		// Guards the glob itself: if this collapses to nothing, every assertion
		// below passes vacuously and the guard is worthless.
		expect(sources.length).toBeGreaterThan(50);
		expect(sources.some((s) => s.file.endsWith('components/ink-signal.css'))).toBe(true);
	});

	it('draws every rule in --color-hairline', () => {
		/**
		 * The one sanctioned exception, recorded in DESIGN.md: `.bib-item--lead`
		 * marks the featured entry with a deliberately heavier rule. Listed by
		 * exact site so a second, unconsidered exception cannot hide behind it.
		 */
		const sanctioned = [
			'styles/components/entity-index.css — .bib-item--lead border-bottom --color-border-dark'
		];

		const crossed = findDeclarations(
			/var\(--rule-hairline\)\s+solid\s+var\(--color-(?!hairline\))/
		);

		// Resolve each hit against the allowlist by file + colour token.
		const unsanctioned = crossed.filter(
			(hit) => !sanctioned.some((s) => hit.includes(s.split(' — ')[0]!))
		);

		expect(unsanctioned).toEqual([]);
		// And the exception itself must still exist — if it is removed or
		// renamed, drop it from `sanctioned` rather than leaving dead cover.
		expect(crossed).toHaveLength(sanctioned.length);
	});

	it('never draws a box edge in the rule colour', () => {
		// A full `border:` shorthand is an edge, never a rule.
		const crossed = findDeclarations(/border:\s*var\(--rule-[\w-]+\)/);
		expect(crossed).toEqual([]);
	});

	it('never draws an enclosing border in --color-hairline', () => {
		const crossed = findDeclarations(
			/border:\s*var\(--border-width-\w+\)\s+solid\s+var\(--color-hairline\)/
		);
		expect(crossed).toEqual([]);
	});

	it('gives every ruled module the same rule → content interval', () => {
		// A heavy rule followed within four lines by a padding-top that is not
		// --rule-gap: the interval has drifted and hierarchy is being carried by
		// spacing instead of by the rule's weight.
		const drifted: string[] = [];
		for (const { file, source } of sources) {
			const lines = source.split('\n');
			lines.forEach((line, i) => {
				if (!/border-top:\s*var\(--rule-(section|masthead|nameplate)\)/.test(line)) return;
				for (let j = i + 1; j <= Math.min(i + 4, lines.length - 1); j++) {
					const next = lines[j] ?? '';
					if (!/padding-top:/.test(next)) continue;
					if (!/var\(--rule-gap\)/.test(next)) {
						drifted.push(`${file}:${j + 1} — ${next.trim()}`);
					}
					break;
				}
			});
		}
		expect(drifted).toEqual([]);
	});
});
