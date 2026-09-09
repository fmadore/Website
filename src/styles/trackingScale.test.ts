import { describe, it, expect } from 'vitest';
import { readFileSync, globSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

/**
 * The tracking scale guard.
 *
 * Tracking is a role scale keyed to size, not a free numeric field. Eight
 * roles, three voices:
 *
 *   display-lg / display / display-sm   Archivo, tightening as it grows
 *   title                               Newsreader titles — one hair of tightening
 *   eyebrow / label / caps              mono caps, loosening as they shrink
 *   figures                             mixed-case mono at any size
 *
 * Serif prose sets no tracking at all, and the floor is -0.02em.
 *
 * The rule exists because the previous arrangement was a free field and it
 * behaved like one: 125 hardcoded `em` values spread over eleven distinct
 * steps, several of them a thousandth apart and none of them decidable by
 * looking at a page, plus three vestigial `--letter-spacing-*` aliases that
 * matched nothing in use. Nothing caught it — a raw value is valid CSS, lint
 * has no opinion, and the browser renders it happily. A single new `0.09em`
 * silently re-introduces an eleventh step and the scale is a field again.
 *
 * So this test reads the real stylesheets and components rather than restating
 * the rule: every authored `letter-spacing` must be one of the eight roles (or
 * `normal`/`inherit`), and the role list itself must stay exactly as large as
 * its use — no token declared that nothing references, which is precisely how
 * the vestigial aliases survived.
 *
 * See: DESIGN.md § The Tracked Size Rule, /style-guide § 2 "Tracking — keyed
 * to size", and the token block in `base/variables.css`.
 */

const root = fileURLToPath(new URL('..', import.meta.url));

/** The one file allowed to state a raw value: the scale is declared there. */
const TOKEN_SOURCE = 'styles/base/variables.css';

/** Every authored style source: global CSS plus component/route `<style>`. */
function styleSources(): { file: string; source: string }[] {
	const files = globSync('**/*.{css,svelte}', { cwd: root })
		.filter((f) => !f.includes('node_modules'))
		.map((f) => f.replace(/\\/g, '/'));
	return files.map((file) => ({
		file,
		// Strip comments so a value quoted in prose is not read as code.
		source: readFileSync(`${root}/${file}`, 'utf8').replace(/\/\*[\s\S]*?\*\//g, '')
	}));
}

const sources = styleSources();

/** The eight roles, and the two keywords that opt out of tracking entirely. */
const ALLOWED =
	/^(normal|inherit|var\(--tracking-(display-lg|display|display-sm|title|eyebrow|label|caps|figures)\))$/;

/**
 * A `letter-spacing:` declaration, in CSS or in a `style="…"` attribute. The
 * value stops at the first `;`, `}` or quote so an attribute holding several
 * declarations yields each one cleanly.
 */
const DECLARATION = /letter-spacing\s*:\s*([^;}"'\n]+)/g;

/**
 * Svelte's `style:letter-spacing="…"` directive — the same declaration written
 * as markup, and the only place a value may be interpolated: the style guide
 * sets each specimen from the very token list it documents, so `var({token})`
 * there resolves to one of the eight by construction.
 */
const DIRECTIVE = /style:letter-spacing=(?:"([^"]*)"|\{([^}]*)\})/g;
const INTERPOLATED = /^var\(\{[^}]+\}\)$/;

describe('the tracking scale', () => {
	it('reads a representative sample of style sources', () => {
		// Guards the glob itself: if this collapses to nothing, every assertion
		// below passes vacuously and the guard is worthless.
		expect(sources.length).toBeGreaterThan(50);
		expect(sources.some((s) => s.file === TOKEN_SOURCE)).toBe(true);
		expect(sources.some((s) => s.file.endsWith('components/ink-signal.css'))).toBe(true);
	});

	it('no authored style sets a raw letter-spacing value', () => {
		const raw: string[] = [];

		for (const { file, source } of sources) {
			if (file === TOKEN_SOURCE) continue;
			source.split('\n').forEach((line, i) => {
				for (const m of line.matchAll(DECLARATION)) {
					const value = m[1]!.trim();
					if (!ALLOWED.test(value)) raw.push(`${file}:${i + 1} — letter-spacing: ${value}`);
				}
				for (const m of line.matchAll(DIRECTIVE)) {
					const value = (m[1] ?? m[2] ?? '').trim();
					if (!ALLOWED.test(value) && !INTERPOLATED.test(value)) {
						raw.push(`${file}:${i + 1} — style:letter-spacing="${value}"`);
					}
				}
			});
		}

		expect(raw).toEqual([]);
	});

	it('every tracking token referenced exists in variables.css, and every one declared is used', () => {
		const variables = sources.find((s) => s.file === TOKEN_SOURCE)!.source;

		const declared = new Set(
			[...variables.matchAll(/^\s*(--tracking-[\w-]+)\s*:/gm)].map((m) => m[1]!)
		);

		const referenced = new Set<string>();
		for (const { file, source } of sources) {
			if (file === TOKEN_SOURCE) continue;
			for (const m of source.matchAll(/var\(\s*(--tracking-[\w-]+)\s*[,)]/g)) {
				referenced.add(m[1]!);
			}
		}

		// No reference to a token that was renamed or never existed.
		expect([...referenced].filter((t) => !declared.has(t)).sort()).toEqual([]);

		// And no token kept alive by its own declaration alone. Three
		// `--letter-spacing-*` aliases sat in the file that way for months.
		expect([...declared].filter((t) => !referenced.has(t)).sort()).toEqual([]);

		// The scale is eight roles. A ninth is a design decision, not a patch:
		// document it in DESIGN.md and on /style-guide before widening this.
		expect(declared.size).toBe(8);
	});
});
