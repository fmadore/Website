/**
 * Color contrast utilities — pure, framework-free, canvas-safe.
 *
 * Chart labels are drawn onto a `<canvas>` by ECharts, so they can't lean on
 * CSS to stay readable: the label colour has to be chosen against the tile's
 * actual fill. These helpers compute WCAG relative luminance / contrast for the
 * colour formats the design tokens actually resolve to — hex, `rgb()`/`rgba()`,
 * and `oklch()` (several `--sys-viz-*` tokens are authored in OKLCH, and
 * `getComputedStyle` hands those back verbatim rather than as rgb).
 *
 * No DOM, no Svelte, no theme store: importable from unit tests in a plain Node
 * environment (see `colorContrast.test.ts`).
 */

export interface RGB {
	/** 0–255 */ r: number;
	/** 0–255 */ g: number;
	/** 0–255 */ b: number;
}

/** Clamp to the inclusive [min, max] range. */
function clamp(value: number, min: number, max: number): number {
	return value < min ? min : value > max ? max : value;
}

/** Parse a component that may be a percentage (`50%`) or a bare number. */
function parseComponent(token: string, percentBasis: number): number {
	const t = token.trim();
	if (t === 'none' || t === '') return 0;
	if (t.endsWith('%')) return (parseFloat(t) / 100) * percentBasis;
	return parseFloat(t);
}

/** Parse `#rgb`, `#rgba`, `#rrggbb`, or `#rrggbbaa`. */
function parseHex(hex: string): RGB | null {
	let h = hex.slice(1);
	if (h.length === 3 || h.length === 4) {
		h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
	} else if (h.length === 8) {
		h = h.slice(0, 6);
	} else if (h.length !== 6) {
		return null;
	}
	const int = parseInt(h, 16);
	if (Number.isNaN(int)) return null;
	return { r: (int >> 16) & 255, g: (int >> 8) & 255, b: int & 255 };
}

/** Parse `rgb(...)` / `rgba(...)` in both comma and space syntaxes. */
function parseRgb(str: string): RGB | null {
	const inner = str.slice(str.indexOf('(') + 1, str.lastIndexOf(')'));
	// Split on commas, or on whitespace/slash for the modern space syntax.
	const parts = inner.includes(',') ? inner.split(',') : inner.split(/[\s/]+/);
	if (parts.length < 3) return null;
	const r = clamp(Math.round(parseComponent(parts[0], 255)), 0, 255);
	const g = clamp(Math.round(parseComponent(parts[1], 255)), 0, 255);
	const b = clamp(Math.round(parseComponent(parts[2], 255)), 0, 255);
	if ([r, g, b].some(Number.isNaN)) return null;
	return { r, g, b };
}

/** Encode a linear-light sRGB channel (0–1) to an 8-bit gamma value (0–255). */
function linearToSrgb8(channel: number): number {
	const c = clamp(channel, 0, 1);
	const encoded = c <= 0.0031308 ? 12.92 * c : 1.055 * Math.pow(c, 1 / 2.4) - 0.055;
	return Math.round(encoded * 255);
}

/**
 * Parse `oklch(L C H[ / A])` and convert to sRGB via OKLab (Ottosson's
 * matrices). L may be a number 0–1 or a percentage; C may be a number or a
 * percentage of the 0.4 reference chroma; H is in degrees.
 */
function parseOklch(str: string): RGB | null {
	const inner = str.slice(str.indexOf('(') + 1, str.lastIndexOf(')'));
	const parts = inner
		.split('/')[0]
		.trim()
		.split(/[\s,]+/);
	if (parts.length < 3) return null;

	const L = parseComponent(parts[0], 1);
	const C = parts[1].trim().endsWith('%')
		? (parseFloat(parts[1]) / 100) * 0.4
		: parseFloat(parts[1]);
	const hToken = parts[2].trim().replace(/deg$/, '');
	const H = hToken === 'none' ? 0 : parseFloat(hToken);
	if ([L, C, H].some(Number.isNaN)) return null;

	const hRad = (H * Math.PI) / 180;
	const a = C * Math.cos(hRad);
	const b = C * Math.sin(hRad);

	// OKLab → LMS' → LMS (cube) → linear sRGB.
	const l_ = L + 0.3963377774 * a + 0.2158037573 * b;
	const m_ = L - 0.1055613458 * a - 0.0638541728 * b;
	const s_ = L - 0.0894841775 * a - 1.291485548 * b;
	const l = l_ * l_ * l_;
	const m = m_ * m_ * m_;
	const s = s_ * s_ * s_;

	const rLin = 4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s;
	const gLin = -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s;
	const bLin = -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s;

	return { r: linearToSrgb8(rLin), g: linearToSrgb8(gLin), b: linearToSrgb8(bLin) };
}

/**
 * Parse any of the colour formats the chart tokens resolve to (hex, rgb/rgba,
 * oklch) into 8-bit sRGB. Returns null for unsupported input (e.g. `color-mix()`
 * or named colours) so callers can fall back gracefully.
 */
export function parseColor(color: string): RGB | null {
	if (!color) return null;
	const c = color.trim().toLowerCase();
	if (c.startsWith('#')) return parseHex(c);
	if (c.startsWith('rgb')) return parseRgb(c);
	if (c.startsWith('oklch')) return parseOklch(c);
	return null;
}

/** Linearise an 8-bit sRGB channel for luminance math. */
function srgb8ToLinear(channel8: number): number {
	const c = channel8 / 255;
	return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

/**
 * WCAG relative luminance (0 = black, 1 = white). Unparseable colours default
 * to 0 (treated as dark) so a missing token errs toward a light label.
 */
export function relativeLuminance(color: string): number {
	const rgb = parseColor(color);
	if (!rgb) return 0;
	return (
		0.2126 * srgb8ToLinear(rgb.r) + 0.7152 * srgb8ToLinear(rgb.g) + 0.0722 * srgb8ToLinear(rgb.b)
	);
}

/** WCAG contrast ratio between two colours (1 = identical, 21 = black/white). */
export function contrastRatio(a: string, b: string): number {
	const la = relativeLuminance(a);
	const lb = relativeLuminance(b);
	const lighter = Math.max(la, lb);
	const darker = Math.min(la, lb);
	return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Pick whichever of two candidate text colours contrasts better against
 * `background`. Returns the chosen colour and its contrast ratio so callers can
 * decide whether a fallback stroke is still needed.
 */
export function pickContrastColor(
	background: string,
	dark: string,
	light: string
): { color: string; ratio: number } {
	const darkRatio = contrastRatio(background, dark);
	const lightRatio = contrastRatio(background, light);
	return lightRatio > darkRatio
		? { color: light, ratio: lightRatio }
		: { color: dark, ratio: darkRatio };
}

/**
 * Normalise a colour to an `rgb(r, g, b)` string for consumers that can't parse
 * modern CSS colour syntax. MapLibre GL's style spec, in particular, rejects
 * `oklch()` (which several `--sys-viz-*` tokens resolve to) — so paint colours
 * must be converted first. Returns the input unchanged if it can't be parsed.
 */
export function toRgbString(color: string): string {
	const rgb = parseColor(color);
	return rgb ? `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})` : color;
}
