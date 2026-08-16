import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { COLORS } from './pdfDesignTokens';
import { CHART_COLOR_FALLBACKS } from './chartColorUtils';

/**
 * Token parity guard.
 *
 * `variables.css` owns the palette, but two modules cannot read CSS custom
 * properties at the moment they need them and so hand-copy the values:
 *
 *   - `pdfDesignTokens.ts` — jsPDF takes RGB triples, and the CV is generated
 *     with no document to read computed styles from.
 *   - `chartColorUtils.ts` — ECharts and MapLibre cannot parse `color-mix()`
 *     or `oklch()`, so the fallbacks must be literal hex.
 *
 * Both are legitimate duplicates, and both have silently fallen behind before:
 * `--sys-color-ink-faint` was darkened to meet 4.5:1 and the copies kept the
 * old `#93896f`, which shipped a 3.24:1 label colour in the downloadable CV.
 * Nothing bound them to the source, so nothing caught it.
 *
 * This test is that binding. It parses the real stylesheet rather than
 * restating the hexes, so editing a token here fails loudly instead of
 * drifting quietly.
 */

const cssPath = fileURLToPath(new URL('../../styles/base/variables.css', import.meta.url));
const css = readFileSync(cssPath, 'utf8');

/** Every `--token: value;` declaration in the file, last wins. */
function parseTokens(source: string): Map<string, string> {
	const tokens = new Map<string, string>();
	// Strip comments so a hex inside a comment cannot be read as a value.
	const withoutComments = source.replace(/\/\*[\s\S]*?\*\//g, '');
	for (const match of withoutComments.matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)) {
		const [, name, value] = match;
		if (name && value) tokens.set(name, value.trim());
	}
	return tokens;
}

const tokens = parseTokens(css);

/** Resolve `var(--a)` chains down to a literal value. */
function resolve(name: string, depth = 0): string {
	const value = tokens.get(name);
	if (value === undefined) throw new Error(`token ${name} is not defined in variables.css`);
	if (depth > 10) throw new Error(`token ${name} has a circular var() chain`);
	const ref = value.match(/^var\((--[\w-]+)\)$/)?.[1];
	return ref ? resolve(ref, depth + 1) : value;
}

const hexToRgb = (hex: string): [number, number, number] => {
	const n = parseInt(hex.replace('#', ''), 16);
	return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};

describe('variables.css parsing', () => {
	it('finds the palette anchors', () => {
		expect(resolve('--sys-color-ink')).toBe('#191509');
		expect(resolve('--sys-color-paper')).toBe('#faf7ef');
	});

	it('resolves semantic tokens through their var() chain', () => {
		// --color-primary -> var(--sys-color-ink) -> #191509
		expect(resolve('--color-primary')).toBe('#191509');
		expect(resolve('--color-accent')).toBe('#1e6a56');
	});
});

describe('PDF CV tokens match variables.css', () => {
	// Each PDF constant and the token it claims to mirror.
	const mapping: [keyof typeof COLORS, string][] = [
		['PRIMARY', '--color-primary'],
		['PRIMARY_DARK', '--color-primary-dark'],
		['ACCENT', '--color-accent'],
		['TEXT_EMPHASIS', '--color-text-emphasis'],
		['TEXT_LIGHT', '--sys-color-ink-muted'],
		['TEXT_MUTED', '--sys-color-ink-faint'],
		['BORDER', '--color-border'],
		['HAIRLINE', '--color-border-light'],
		['BACKGROUND_LIGHT', '--sys-color-paper']
	];

	for (const [constant, token] of mapping) {
		it(`${constant} equals ${token}`, () => {
			expect(COLORS[constant]).toEqual(hexToRgb(resolve(token)));
		});
	}

	/**
	 * `TEXT` (#3a352a) is the one value that traces to no token: it is a
	 * deliberate print-only softening sitting between --color-text (#191509)
	 * and --color-text-soft (#5c5442). Pinned here so it stays a recorded
	 * decision rather than becoming another silent drift.
	 */
	it('TEXT is the documented print-only body ink', () => {
		expect(COLORS.TEXT).toEqual([58, 53, 42]);
	});
});

describe('chart colour fallbacks match variables.css', () => {
	// Only the fallbacks that mirror a literal-hex token. The viz series
	// (plum, mauve, sage, slateBlue, ochre, umber) are hex approximations of
	// OKLCH tokens and cannot be compared without a colour-space conversion.
	const mapping: [keyof typeof CHART_COLOR_FALLBACKS, string][] = [
		['primary', '--color-primary'],
		['primaryDark', '--color-primary-dark'],
		['text', '--color-text'],
		['textLight', '--color-text-light'],
		['border', '--color-border'],
		['surface', '--color-surface'],
		['accent', '--color-accent'],
		['highlight', '--color-highlight'],
		['success', '--color-success'],
		['secondary', '--color-secondary']
	];

	for (const [key, token] of mapping) {
		it(`${key} equals ${token}`, () => {
			expect(CHART_COLOR_FALLBACKS[key]).toBe(resolve(token));
		});
	}

	it('surfaceRgb is the warm paper ground as an rgb triple', () => {
		const [r, g, b] = hexToRgb(resolve('--sys-color-paper'));
		expect(CHART_COLOR_FALLBACKS.surfaceRgb).toBe(`${r}, ${g}, ${b}`);
	});
});

describe('palette contrast promises hold', () => {
	const luminance = (hex: string) => {
		const channel = (c: number) => {
			const s = c / 255;
			return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
		};
		const [r, g, b] = hexToRgb(hex);
		return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
	};
	const ratio = (a: string, b: string) => {
		const [la, lb] = [luminance(a), luminance(b)];
		return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
	};

	// variables.css states that faint ink clears 4.5:1 on *all* paper surfaces.
	// That promise is what the stale #93896f copies broke.
	const paperGrounds = ['--sys-color-paper', '--sys-color-paper-raised', '--color-surface'];

	for (const ground of paperGrounds) {
		it(`faint ink clears 4.5:1 on ${ground}`, () => {
			expect(ratio(resolve('--sys-color-ink-faint'), resolve(ground))).toBeGreaterThanOrEqual(4.5);
		});
	}

	it('faint cream clears 4.5:1 on the film ground', () => {
		expect(
			ratio(resolve('--sys-color-cream-faint'), resolve('--sys-color-film-ground'))
		).toBeGreaterThanOrEqual(4.5);
	});

	/**
	 * The accent button inverts its label with --color-text-inverted, which is
	 * paper on daylight and the film ground on midnight. Both pairings must
	 * clear AA — midnight is the one that regressed to 2.2:1 when the label was
	 * hardcoded to raw paper.
	 */
	it('accent button labels clear 4.5:1 in both themes', () => {
		expect(ratio(resolve('--sys-color-paper'), resolve('--sys-color-pine'))).toBeGreaterThanOrEqual(
			4.5
		);
		expect(
			ratio(resolve('--sys-color-film-ground'), resolve('--sys-color-pine-bright'))
		).toBeGreaterThanOrEqual(4.5);
	});
});
