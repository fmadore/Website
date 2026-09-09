import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { COLORS } from './pdfDesignTokens';
import { CHART_COLOR_FALLBACKS, CHART_COLOR_FALLBACKS_DARK } from './chartColorUtils';

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
const darkCssPath = fileURLToPath(new URL('../../styles/base/dark.css', import.meta.url));
const darkCss = readFileSync(darkCssPath, 'utf8');

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
/**
 * The midnight sheet, read on top of the daylight one. `html.dark` only
 * redeclares what it changes, so a token it does not mention resolves to its
 * daylight value — exactly how the cascade sees it.
 */
const darkTokens = new Map([...tokens, ...parseTokens(darkCss)]);

/** Resolve `var(--a)` chains down to a literal value. */
function resolveIn(table: Map<string, string>, name: string, depth = 0): string {
	const value = table.get(name);
	if (value === undefined) throw new Error(`token ${name} is not defined in the stylesheet`);
	if (depth > 10) throw new Error(`token ${name} has a circular var() chain`);
	const ref = value.match(/^var\((--[\w-]+)\)$/)?.[1];
	return ref ? resolveIn(table, ref, depth + 1) : value;
}

const resolve = (name: string) => resolveIn(tokens, name);
const resolveDark = (name: string) => resolveIn(darkTokens, name);

/**
 * OKLCH → sRGB hex, so the `--sys-viz-*` tokens can be compared with the hand-
 * copied hexes in `chartColorUtils.ts` instead of merely being trusted. The
 * conversion is the CSS Color 4 one (OKLab → linear sRGB → sRGB); nothing in
 * the palette is out of gamut, so no clipping path is needed here.
 */
function oklchToHex(spec: string): string {
	const [, l, c, h] = spec.match(/^oklch\(\s*([\d.]+)\s+([\d.]+)\s+([\d.]+)\s*\)$/) ?? [];
	if (!l || !c || !h) throw new Error(`not an oklch() literal: ${spec}`);
	const [L, C, H] = [Number(l), Number(c), (Number(h) * Math.PI) / 180];
	const [a, b] = [C * Math.cos(H), C * Math.sin(H)];
	const cube = (x: number) => x * x * x;
	const lm = cube(L + 0.3963377774 * a + 0.2158037573 * b);
	const mm = cube(L - 0.1055613458 * a - 0.0638541728 * b);
	const sm = cube(L - 0.0894841775 * a - 1.291485548 * b);
	const linear = [
		4.0767416621 * lm - 3.3077115913 * mm + 0.2309699292 * sm,
		-1.2684380046 * lm + 2.6097574011 * mm - 0.3413193965 * sm,
		-0.0041960863 * lm - 0.7034186147 * mm + 1.707614701 * sm
	];
	return (
		'#' +
		linear
			.map((v) => {
				const encoded = v <= 0.0031308 ? 12.92 * v : 1.055 * Math.pow(v, 1 / 2.4) - 0.055;
				return Math.max(0, Math.min(255, Math.round(encoded * 255)))
					.toString(16)
					.padStart(2, '0');
			})
			.join('')
	);
}

/** A token's literal hex, whether it is written as hex or as `oklch()`. */
const hexOf = (value: string) => (value.startsWith('oklch(') ? oklchToHex(value) : value);

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
		['TEXT', '--color-text'],
		['TEXT_LIGHT', '--sys-color-ink-muted'],
		['TEXT_MUTED', '--sys-color-ink-faint'],
		['BORDER', '--color-border'],
		['HAIRLINE', '--color-hairline'],
		['BACKGROUND_LIGHT', '--sys-color-paper']
	];

	for (const [constant, token] of mapping) {
		it(`${constant} equals ${token}`, () => {
			expect(COLORS[constant]).toEqual(hexToRgb(resolve(token)));
		});
	}

	/**
	 * There are no exceptions left. `TEXT` was one: `#3a352a`, a warm grey that
	 * traced to no token, defined only in `pdfDesignTokens.ts` and pinned here
	 * by the 2026-08 audit pending a decision. The decision (roadmap 2.4) was to
	 * retire it — the system owns three ink steps, the exported CV is the same
	 * document as the web CV, and the web CV sets its body in `--color-text`.
	 * The mapping above now covers every entry in COLORS, and this test asserts
	 * that it keeps doing so: a new hand-copied constant has to be bound to a
	 * token or deliberately listed, not merely added.
	 */
	it('binds every PDF colour constant to a token', () => {
		const mapped = new Set(mapping.map(([constant]) => constant));
		const unbound = Object.keys(COLORS).filter((key) => !mapped.has(key as keyof typeof COLORS));
		expect(unbound).toEqual([]);
	});
});

describe('chart colour fallbacks match variables.css', () => {
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

	/**
	 * The viz series used to be exempt here: the tokens are written in
	 * `oklch()` and the fallbacks in hex, so the two sides were never compared
	 * and the 2026-09 re-step could have shipped with half the palette stale.
	 * With the conversion above they are comparable, so they are compared.
	 */
	const vizMapping: [keyof typeof CHART_COLOR_FALLBACKS, string][] = [
		['slateBlue', '--sys-viz-2'],
		['sage', '--sys-viz-3'],
		['ochre', '--sys-viz-4'],
		['mauve', '--sys-viz-5'],
		['plum', '--sys-viz-6'],
		['umber', '--sys-viz-7']
	];

	for (const [key, token] of vizMapping) {
		it(`${key} equals ${token}`, () => {
			expect(CHART_COLOR_FALLBACKS[key]).toBe(hexOf(resolve(token)));
		});
	}

	it('the signal series is the accent', () => {
		expect(resolve('--sys-viz-1')).toBe(resolve('--color-accent'));
		expect(resolveDark('--sys-viz-1')).toBe(resolveDark('--color-accent'));
	});
});

describe('midnight chart fallbacks match dark.css', () => {
	/**
	 * `dark.css` re-steps the viz series for the film ground, so the fallbacks
	 * fork too. Both halves are hand-copied and both are bound here: editing
	 * one side of either theme without the other fails.
	 */
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
		['secondary', '--color-secondary'],
		['slateBlue', '--sys-viz-2'],
		['sage', '--sys-viz-3'],
		['ochre', '--sys-viz-4'],
		['mauve', '--sys-viz-5'],
		['plum', '--sys-viz-6'],
		['umber', '--sys-viz-7']
	];

	for (const [key, token] of mapping) {
		it(`${key} equals ${token} under html.dark`, () => {
			expect(CHART_COLOR_FALLBACKS_DARK[key]).toBe(hexOf(resolveDark(token)));
		});
	}

	it('surfaceRgb is the film ground as an rgb triple', () => {
		const [r, g, b] = hexToRgb(resolveDark('--sys-color-film-ground'));
		expect(CHART_COLOR_FALLBACKS_DARK.surfaceRgb).toBe(`${r}, ${g}, ${b}`);
	});

	it('overrides only keys the daylight record already defines', () => {
		for (const key of Object.keys(CHART_COLOR_FALLBACKS_DARK)) {
			expect(CHART_COLOR_FALLBACKS).toHaveProperty(key);
		}
	});

	it('binds every midnight override to a token', () => {
		const mapped = new Set(mapping.map(([key]) => key));
		mapped.add('surfaceRgb');
		expect(Object.keys(CHART_COLOR_FALLBACKS_DARK).filter((k) => !mapped.has(k as never))).toEqual(
			[]
		);
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
