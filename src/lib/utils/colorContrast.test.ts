import { describe, it, expect } from 'vitest';
import {
	parseColor,
	relativeLuminance,
	contrastRatio,
	pickContrastColor,
	toRgbString
} from './colorContrast';

describe('parseColor', () => {
	it('parses 6-digit hex', () => {
		expect(parseColor('#1e6a56')).toEqual({ r: 30, g: 106, b: 86 });
	});

	it('parses shorthand hex', () => {
		expect(parseColor('#fff')).toEqual({ r: 255, g: 255, b: 255 });
	});

	it('parses hex with alpha by dropping the alpha channel', () => {
		expect(parseColor('#191509ff')).toEqual({ r: 25, g: 21, b: 9 });
	});

	it('parses rgb() and rgba() in comma syntax', () => {
		expect(parseColor('rgb(250, 247, 239)')).toEqual({ r: 250, g: 247, b: 239 });
		expect(parseColor('rgba(0, 0, 0, 0.5)')).toEqual({ r: 0, g: 0, b: 0 });
	});

	it('parses rgb() in modern space syntax', () => {
		expect(parseColor('rgb(30 106 86)')).toEqual({ r: 30, g: 106, b: 86 });
	});

	it('parses oklch() into a plausible sRGB triple', () => {
		// --sys-viz-4 ochre: oklch(0.66 0.09 72) → a warm mid-tone gold.
		const rgb = parseColor('oklch(0.66 0.09 72)');
		expect(rgb).not.toBeNull();
		// Warm ochre: red channel dominant, blue lowest.
		expect(rgb!.r).toBeGreaterThan(rgb!.g);
		expect(rgb!.g).toBeGreaterThan(rgb!.b);
	});

	it('round-trips oklch white/black near the sRGB extremes', () => {
		const white = parseColor('oklch(1 0 0)')!;
		expect(white.r).toBeGreaterThanOrEqual(254);
		const black = parseColor('oklch(0 0 0)')!;
		expect(black.r).toBeLessThanOrEqual(1);
	});

	it('returns null for unsupported formats', () => {
		expect(parseColor('color-mix(in srgb, red, blue)')).toBeNull();
		expect(parseColor('rebeccapurple')).toBeNull();
		expect(parseColor('')).toBeNull();
	});
});

describe('relativeLuminance', () => {
	it('is 0 for black and 1 for white', () => {
		expect(relativeLuminance('#000000')).toBeCloseTo(0, 5);
		expect(relativeLuminance('#ffffff')).toBeCloseTo(1, 5);
	});

	it('orders mid-tones by lightness', () => {
		// Warm paper is far lighter than warm ink.
		expect(relativeLuminance('#faf7ef')).toBeGreaterThan(relativeLuminance('#191509'));
	});
});

describe('contrastRatio', () => {
	it('matches the known 21:1 black-on-white ratio', () => {
		expect(contrastRatio('#000000', '#ffffff')).toBeCloseTo(21, 1);
	});

	it('is symmetric', () => {
		expect(contrastRatio('#1e6a56', '#faf7ef')).toBeCloseTo(
			contrastRatio('#faf7ef', '#1e6a56'),
			10
		);
	});
});

describe('pickContrastColor', () => {
	const INK = '#191509';
	const PAPER = '#faf7ef';

	it('chooses paper (light) text on the dark pine tile', () => {
		expect(pickContrastColor('#1e6a56', INK, PAPER).color).toBe(PAPER);
	});

	it('chooses ink (dark) text on a light ochre tile', () => {
		// A light gold fill should take dark ink for readability.
		expect(pickContrastColor('#e8c27a', INK, PAPER).color).toBe(INK);
	});

	it('reports a ratio at least as good as either single candidate', () => {
		const { ratio } = pickContrastColor('oklch(0.58 0.07 128)', INK, PAPER);
		expect(ratio).toBeGreaterThanOrEqual(contrastRatio('oklch(0.58 0.07 128)', INK));
	});
});

describe('toRgbString', () => {
	it('converts oklch() to an rgb() string MapLibre can parse', () => {
		expect(toRgbString('oklch(0.58 0.07 128)')).toMatch(/^rgb\(\d+, \d+, \d+\)$/);
	});

	it('normalises hex to rgb()', () => {
		expect(toRgbString('#1e6a56')).toBe('rgb(30, 106, 86)');
	});

	it('returns unparseable input unchanged', () => {
		expect(toRgbString('color-mix(in srgb, red, blue)')).toBe('color-mix(in srgb, red, blue)');
	});
});
