import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

/**
 * The midnight weight guard.
 *
 * Light type on a dark ground optically bolds: the bright glyph spreads into
 * the ground, so an identical weight reads heavier in midnight than in
 * daylight. The spread is a fixed optical quantity, so it costs the most where
 * strokes are thinnest and closest together — the mono data voice at 10–14px —
 * is mild on a 24px serif title, and is negligible on the display heads at
 * 40px and above. Midnight therefore steps the three shared weight tokens down
 * by 40 and does nothing else:
 *
 *   --font-weight-medium    500 → 460
 *   --font-weight-semibold  600 → 560
 *   --font-weight-bold      700 → 660
 *
 * An A/B at -30, -40 and -50 settled the step: -50 over-corrected, dropping the
 * 24px serif title below its own daylight weight, while -40 returned the small
 * mono to daylight weight with the title at parity.
 *
 * `--font-weight-normal` is deliberately absent from midnight. The served
 * Newsreader and Spline Sans Mono subsets are instanced to wght 400–700, so a
 * value below 400 does not lighten anything — it clamps silently back to 400.
 * That silence is the whole reason this file exists: a wrong weight here is
 * valid CSS, renders without complaint, and shows up only in a side-by-side
 * capture. So the third assertion reads the real `@font-face` descriptor ranges
 * out of `app.html` and checks every compensated value against them. Regenerate
 * the subsets with a narrower axis, or push the compensation below the floor,
 * and this fails loudly instead of clamping.
 *
 * See: DESIGN.md § The Microfilm Weight Rule, and the commented block at the
 * end of `base/dark.css`.
 */

const root = fileURLToPath(new URL('..', import.meta.url));

const variables = readFileSync(`${root}/styles/base/variables.css`, 'utf8');
const dark = readFileSync(`${root}/styles/base/dark.css`, 'utf8');
const appHtml = readFileSync(`${root}/app.html`, 'utf8');

/** Strip comments so a value quoted in prose is never read as a declaration. */
const stripComments = (source: string) => source.replace(/\/\*[\s\S]*?\*\//g, '');

/** Every `--font-weight-*: N` declared in a source, as a name → number map. */
function weightTokens(source: string): Map<string, number> {
	const found = new Map<string, number>();
	for (const m of stripComments(source).matchAll(/(--font-weight-[\w-]+)\s*:\s*(\d+)\s*;/g)) {
		found.set(m[1]!, Number(m[2]!));
	}
	return found;
}

/** The `html.dark { … }` block alone — midnight declares nothing outside it. */
function midnightBlock(source: string): string {
	const stripped = stripComments(source);
	const start = stripped.indexOf('html.dark');
	expect(start).toBeGreaterThanOrEqual(0);
	const open = stripped.indexOf('{', start);
	const close = stripped.indexOf('}', open);
	return stripped.slice(open + 1, close);
}

/**
 * The `font-weight: A B` descriptor range of a family's `@font-face` blocks.
 * The site self-hosts one woff2 per family/style/script-subset, so a family has
 * several blocks; they are instanced to one axis range and must agree.
 */
function servedAxis(family: string): { min: number; max: number } {
	const blocks = [...appHtml.matchAll(/@font-face\s*\{([^}]*)\}/g)].map((m) => m[1]!);
	const ranges = blocks
		.filter((b) => new RegExp(`font-family:\\s*'${family}'\\s*;`).test(b))
		.map((b) => /font-weight:\s*(\d+)\s+(\d+)\s*;/.exec(b))
		.filter((m): m is RegExpExecArray => m !== null)
		.map((m) => ({ min: Number(m[1]!), max: Number(m[2]!) }));

	// Guards the parse: no blocks found means every assertion below is vacuous.
	expect(ranges.length).toBeGreaterThan(0);
	for (const r of ranges) expect(r).toEqual(ranges[0]);
	return ranges[0]!;
}

const DAYLIGHT = {
	'--font-weight-normal': 400,
	'--font-weight-medium': 500,
	'--font-weight-semibold': 600,
	'--font-weight-bold': 700
} as const;

/** The step, in weight units. One number, applied to three tokens. */
const COMPENSATION = 40;

/** The three tokens midnight moves. `normal` is at the subset floor already. */
const COMPENSATED = [
	'--font-weight-medium',
	'--font-weight-semibold',
	'--font-weight-bold'
] as const;

describe('the midnight weight compensation', () => {
	it('declares the daylight weight scale in variables.css', () => {
		const declared = weightTokens(variables);
		expect(Object.fromEntries([...declared])).toEqual(DAYLIGHT);
	});

	it('steps medium, semibold and bold down by exactly 40 in midnight', () => {
		const midnight = weightTokens(midnightBlock(dark));

		expect([...midnight.keys()].sort()).toEqual([...COMPENSATED].sort());
		for (const token of COMPENSATED) {
			expect(midnight.get(token)).toBe(DAYLIGHT[token] - COMPENSATION);
		}
	});

	it('never redeclares --font-weight-normal, which sits on the subset floor', () => {
		// Below 400 the instanced subsets clamp rather than lighten, so body
		// prose cannot be compensated without regenerating the fonts.
		expect(midnightBlock(dark)).not.toContain('--font-weight-normal');
	});

	it('keeps every midnight weight inside the served axis range', () => {
		const midnight = weightTokens(midnightBlock(dark));

		for (const family of ['Newsreader', 'Spline Sans Mono']) {
			const axis = servedAxis(family);
			for (const [token, value] of midnight) {
				expect(
					value >= axis.min && value <= axis.max,
					`${token}: ${value} is outside ${family}'s served wght ${axis.min}–${axis.max}`
				).toBe(true);
			}
		}
	});
});
