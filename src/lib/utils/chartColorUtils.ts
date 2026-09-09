/**
 * Chart Color Utilities
 *
 * Centralized utilities for resolving CSS variables and colors in chart components.
 * Used by ECharts and D3 visualization components to ensure consistent theming.
 */

import { getTheme } from '$lib/stores/themeStore.svelte';
import { contrastRatio, pickContrastColor } from '$lib/utils/colorContrast';

/**
 * Gets the computed value of a CSS custom property from the document root.
 * Returns empty string during SSR or if variable is not found.
 *
 * @param variableName - CSS variable name (e.g., '--color-primary')
 * @returns The computed value of the CSS variable, or empty string
 */
export function getCSSVariableValue(variableName: string): string {
	if (typeof window === 'undefined') return '';
	const computedStyle = getComputedStyle(document.documentElement);
	const value = computedStyle.getPropertyValue(variableName).trim();
	return value;
}

/**
 * Gets the computed value of a CSS custom property with a fallback.
 *
 * @param variableName - CSS variable name (e.g., '--color-primary')
 * @param fallback - Fallback value if variable is not found
 * @returns The computed value of the CSS variable, or the fallback
 */
export function getCSSVariableValueWithFallback(variableName: string, fallback: string): string {
	const value = getCSSVariableValue(variableName);
	return value || fallback;
}

/**
 * Gets a CSS variable value as a pixel number.
 * Useful for spacing variables used in chart calculations.
 *
 * @param variableName - CSS variable name (e.g., '--space-2')
 * @param fallbackPx - Fallback pixel value
 * @returns The numeric pixel value
 */
export function getCSSPx(variableName: string, fallbackPx: number): number {
	if (typeof window === 'undefined') return fallbackPx;
	const computedStyle = getComputedStyle(document.documentElement);
	const value = computedStyle.getPropertyValue(variableName).trim();
	const match = value.match(/^([\d.]+)px$/);
	return match ? Number(match[1]) : fallbackPx;
}

/**
 * Resolves a color string, handling CSS variable references.
 * Supports:
 * - Plain colors (returned as-is)
 * - var(--variable-name) syntax
 * - rgba(var(--variable-name), opacity) syntax
 *
 * @param color - Color string to resolve
 * @returns The resolved color value
 */
export function resolveColor(color: string): string {
	// Handle var(--variable-name) syntax
	if (color.startsWith('var(')) {
		const varName = color.slice(4, -1).trim();
		const val = getCSSVariableValue(varName);
		return val || color; // Return original if var not found
	}

	// Handle rgba(var(--variable-name), opacity) syntax
	if (color.startsWith('rgba(var(')) {
		const rgbaMatch = color.match(/rgba\(var\(([^)]+)\),\s*([^)]+)\)/);
		if (rgbaMatch) {
			const rgbVarName = rgbaMatch[1]!;
			const opacity = rgbaMatch[2];
			const rgbValue = getCSSVariableValue(rgbVarName) || '0, 0, 0';
			return `rgba(${rgbValue}, ${opacity})`;
		}
	}

	return color;
}

/**
 * Resolves an array of colors, handling CSS variable references.
 *
 * @param colors - Array of color strings to resolve
 * @returns Array of resolved color values
 */
export function resolveColors(colors: string[]): string[] {
	return colors.map((color) => resolveColor(color));
}

/**
 * Checks if the user prefers reduced motion.
 * Useful for disabling chart animations.
 *
 * @returns True if user prefers reduced motion
 */
export function prefersReducedMotion(): boolean {
	if (typeof window === 'undefined') return false;
	return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Converts a resolved color (hex or rgb) to rgba with the given opacity.
 * Use this instead of CSS color-mix() for ECharts canvas-rendered options,
 * since canvas does not support CSS color functions.
 *
 * @param color - Hex (#rgb, #rrggbb) or rgb(r, g, b) color string
 * @param opacity - Opacity value (0-1)
 * @returns rgba color string usable in canvas contexts
 */
export function colorWithOpacity(color: string, opacity: number): string {
	if (color.startsWith('#')) {
		let hex = color.slice(1);
		if (hex.length === 3) {
			const [c1 = '', c2 = '', c3 = ''] = hex;
			hex = c1 + c1 + c2 + c2 + c3 + c3;
		}
		const r = parseInt(hex.slice(0, 2), 16);
		const g = parseInt(hex.slice(2, 4), 16);
		const b = parseInt(hex.slice(4, 6), 16);
		return `rgba(${r}, ${g}, ${b}, ${opacity})`;
	}
	const rgbMatch = color.match(/^rgb\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)$/);
	if (rgbMatch) {
		return `rgba(${rgbMatch[1]}, ${rgbMatch[2]}, ${rgbMatch[3]}, ${opacity})`;
	}
	return color;
}

/** The three presets in the visualization motion policy. */
export type ChartMotionPreset = 'none' | 'quick' | 'settle';

/** Object shape ECharts reads at the top level of a chart option. */
export interface ChartMotionConfig {
	animation: boolean;
	animationDuration: number;
	animationDurationUpdate: number;
	animationEasing: string;
	animationEasingUpdate: string;
}

/**
 * The site's single visualization motion policy (Ink + Signal — print register,
 * near-zero motion). One set of presets, all easing on `cubicOut` — never
 * `elasticOut`/`bounce`, which read as app-like on an archival page:
 *
 * - `none`   — purely analytical charts; no entrance animation.
 * - `quick`  — 240 ms; the default for simple charts and all data updates.
 * - `settle` — 420 ms; a single calm settle for the first paint of a complex
 *   chart (network graph, treemap, doughnut).
 *
 * Collapses to no animation under `prefers-reduced-motion`. Spread at the **top
 * level** of the chart option (not inside `series`) so `animation: false` and
 * the update timings apply to every series.
 */
export function getChartMotion(preset: ChartMotionPreset = 'quick'): ChartMotionConfig {
	if (preset === 'none' || prefersReducedMotion()) {
		return {
			animation: false,
			animationDuration: 0,
			animationDurationUpdate: 0,
			animationEasing: 'linear',
			animationEasingUpdate: 'linear'
		};
	}
	const duration = preset === 'settle' ? 420 : 240;
	return {
		animation: true,
		animationDuration: duration,
		// Updates (theme swap, data change) always use the shorter, calmer timing.
		animationDurationUpdate: 240,
		animationEasing: 'cubicOut',
		animationEasingUpdate: 'cubicOut'
	};
}

/** Size payload ECharts passes to a tooltip `position` callback. */
export interface EChartsTooltipSize {
	contentSize: [number, number];
	viewSize: [number, number];
}

/**
 * Factory for an ECharts tooltip `position` callback that keeps the tooltip
 * fully inside the chart's view box on both desktop and mobile. Extracted from
 * the network graph so every chart with a custom position shares one bounded
 * implementation instead of reimplementing the clamps.
 *
 * Desktop: placed beside the cursor, flipping to the other side / clamping
 * vertically when it would overflow. Mobile: centred horizontally and lifted
 * above the point (dropping below only when there isn't room above).
 *
 * @param isMobile - Use the mobile placement strategy.
 * @param gap - Pixel gap between cursor and tooltip / view edges.
 */
export function getBoundedTooltipPosition(isMobile: boolean = false, gap: number = 12) {
	return function boundedPosition(
		point: [number, number],
		_params: unknown,
		_dom: HTMLElement,
		_rect: unknown,
		size: EChartsTooltipSize
	): [number, number] {
		const [tooltipWidth, tooltipHeight] = size.contentSize;
		const [viewWidth, viewHeight] = size.viewSize;

		if (isMobile) {
			const x = Math.max(
				gap,
				Math.min(viewWidth - tooltipWidth - gap, point[0] - tooltipWidth / 2)
			);
			let y = point[1] - tooltipHeight - gap;
			if (y < gap) {
				y = point[1] + gap;
				if (y + tooltipHeight > viewHeight) {
					y = Math.max(gap, viewHeight - tooltipHeight - gap);
				}
			}
			return [x, y];
		}

		let x = point[0] + gap;
		if (x + tooltipWidth > viewWidth) {
			x = point[0] - tooltipWidth - gap;
		}
		x = Math.max(gap, Math.min(x, viewWidth - tooltipWidth - gap));

		let y = point[1] - tooltipHeight / 2;
		y = Math.max(gap, Math.min(y, viewHeight - tooltipHeight - gap));

		return [x, y];
	};
}

/**
 * Warm Ink + Signal label anchors for canvas-drawn chart labels. They contrast
 * the *tile fill*, not the page ground, so they stay fixed across themes: ink
 * for light tiles, paper for dark tiles (the brief's two inks).
 */
const LABEL_INK = '#191509';
const LABEL_PAPER = '#faf7ef';

/** Contrast-aware label style for a canvas-rendered fill. */
export interface ContrastLabelStyle {
	color: string;
	textBorderColor: string;
	textBorderWidth: number;
}

/**
 * Choose a readable label colour for text drawn on top of an arbitrary chart
 * `fill` (treemap tiles, pie slices, …). Picks warm ink or warm paper by WCAG
 * contrast, and only adds a minimal hairline stroke of the opposite tone when
 * neither pure colour clears the contrast `target` — so labels read as the data
 * voice rather than glowing/stroked overlay text.
 *
 * @param fill - Resolved fill colour (hex / rgb / oklch — not a CSS variable).
 * @param target - WCAG contrast target below which a fallback stroke is added.
 */
export function getContrastLabelStyle(fill: string, target: number = 4.5): ContrastLabelStyle {
	const { color, ratio } = pickContrastColor(fill, LABEL_INK, LABEL_PAPER);
	const needsStroke = ratio < target;
	return {
		color,
		textBorderColor: needsStroke
			? colorWithOpacity(color === LABEL_INK ? LABEL_PAPER : LABEL_INK, 0.55)
			: 'transparent',
		textBorderWidth: needsStroke ? 2 : 0
	};
}

/** Contrast ratio between two resolved colours (re-exported for chart code). */
export { contrastRatio };

/**
 * Base chart colors from the design system.
 * Fallbacks match the Ink + Signal palette in variables.css: warm paper +
 * ink, one pine (warm teal) accent. `accent`/`highlight` resolve to the
 * pine so the "current / emphasised" series reads as the signal colour.
 */
export const CHART_COLOR_FALLBACKS = {
	primary: '#191509', // ink (--color-primary) — dominant structural series colour
	primaryDark: '#0e0b04', // ink-deep (--color-primary-dark)
	text: '#191509', // ink (--color-text)
	textLight: '#6b634e', // faint ink (--color-text-light) — ≥4.5:1 on every paper surface
	border: '#c9c0aa', // border (--color-border)
	surface: '#f3eee0', // paper-100 (--color-surface)
	surfaceRgb: '250, 247, 239', // warm paper #faf7ef (--color-surface-rgb is unset, so this fallback renders)
	black: '#000000',
	white: '#ffffff',
	accent: '#1e6a56', // pine — the signal accent (--color-accent)
	highlight: '#1e6a56', // pine (--color-highlight)
	success: '#5c6b3a', // muted olive (--color-success)
	secondary: '#5c5442', // muted ink (--color-secondary)
	// The --sys-viz-* series, resolved from OKLCH to literal hex. Keep in step
	// with variables.css; designTokenParity.test.ts converts the tokens and
	// fails if these drift.
	plum: '#9c81bc', // --sys-viz-6 oklch(0.65 0.09 305)
	mauve: '#824d67', // --sys-viz-5 oklch(0.49 0.08 350)
	sage: '#566c38', // --sys-viz-3 oklch(0.5 0.08 128)
	slateBlue: '#5584b4', // --sys-viz-2 oklch(0.6 0.09 250)
	ochre: '#b1864f', // --sys-viz-4 oklch(0.65 0.09 72)
	umber: '#714a43', // --sys-viz-7 oklch(0.45 0.055 30)
	fontFamily: "'Spline Sans Mono', 'SF Mono', 'Consolas', monospace"
} as const;

/**
 * Midnight fallbacks — the `html.dark` half of the same table.
 *
 * Only the values midnight actually redefines are listed; everything else
 * falls through to the daylight record above. The viz series is the reason
 * this exists: `dark.css` re-steps `--sys-viz-*` for the film ground, and a
 * renderer that missed the computed value would otherwise paint the daylight
 * seven on warm near-black — the exact regression the midnight step fixes.
 */
export const CHART_COLOR_FALLBACKS_DARK: Partial<
	Record<keyof typeof CHART_COLOR_FALLBACKS, string>
> = {
	primary: '#efe7d6', // cream (--color-primary → --sys-color-cream)
	primaryDark: '#fffdf7', // paper-raised (--color-primary-dark)
	text: '#efe7d6', // cream (--color-text)
	textLight: '#b3a88d', // muted cream (--color-text-light)
	border: '#453d2f', // film border (--color-border)
	surface: '#1f1a14', // film-100 (--color-surface)
	surfaceRgb: '23, 19, 16', // film ground #171310
	accent: '#4fbb99', // pine-bright (--color-accent)
	highlight: '#4fbb99', // pine-bright (--color-highlight)
	success: '#8a9a5b', // success-bright (--color-success)
	secondary: '#b3a88d', // muted cream (--color-secondary)
	plum: '#a185c3', // --sys-viz-6 oklch(0.665 0.095 305)
	mauve: '#8e516f', // --sys-viz-5 oklch(0.515 0.09 350)
	sage: '#536d2e', // --sys-viz-3 oklch(0.5 0.095 128)
	slateBlue: '#5587ba', // --sys-viz-2 oklch(0.61 0.095 250)
	ochre: '#b68b53', // --sys-viz-4 oklch(0.665 0.09 72)
	umber: '#965449' // --sys-viz-7 oklch(0.52 0.09 30)
};

/**
 * Ink + Signal categorical palette — the default series palette for every
 * chart. Derived from the OKLCH-anchored `--sys-viz-*` tokens: earthy hues
 * harmonised with warm paper that also hold up on the dark microfilm ground.
 * Entry 1 is the pine signal; the rest are muted slate, olive,
 * ochre, mauve, teal and umber. Longer category lists reuse the ramp.
 *
 * Pass to `resolveColors()` before handing to canvas renderers.
 */
export const CHART_CATEGORICAL_COLORS: string[] = [
	'var(--sys-viz-1)', // pine (signal)
	'var(--sys-viz-2)', // muted slate-blue
	'var(--sys-viz-3)', // muted olive
	'var(--sys-viz-4)', // ochre / gold
	'var(--sys-viz-5)', // mauve
	'var(--sys-viz-6)', // muted plum
	'var(--sys-viz-7)' // umber / deep clay
	// NOTE: keep every entry a bare `var(--x)` token so resolveColor() returns a
	// concrete colour for ECharts' canvas renderer (canvas cannot parse
	// color-mix()). Consumers cycle this list with `index % length`, so seven
	// distinct hues suffice; do not append color-mix() variants here.
];

/**
 * Type for resolved chart colors
 */
export interface ResolvedChartColors {
	primary: string;
	primaryDark: string;
	text: string;
	textLight: string;
	border: string;
	surface: string;
	surfaceElevated: string;
	surfaceRgb: string;
	black: string;
	white: string;
	accent: string;
	highlight: string;
	success: string;
	secondary: string;
	plum: string;
	mauve: string;
	sage: string;
	slateBlue: string;
	ochre: string;
	umber: string;
	fontFamily: string;
	currentTheme: string;
}

/**
 * Creates a reactive object of resolved chart colors.
 * Call this within a $derived to make it reactive to theme changes.
 *
 * @returns Object with resolved color values
 */
export function getResolvedChartColors(): ResolvedChartColors {
	// Theme first: the fallbacks are the *values midnight would compute to*, so
	// picking the wrong record is worse than having none. Everything midnight
	// does not redefine falls through to the daylight record.
	const theme = getTheme();
	const fb: Record<keyof typeof CHART_COLOR_FALLBACKS, string> =
		theme === 'dark'
			? { ...CHART_COLOR_FALLBACKS, ...CHART_COLOR_FALLBACKS_DARK }
			: CHART_COLOR_FALLBACKS;
	return {
		primary: getCSSVariableValueWithFallback('--color-primary', fb.primary),
		primaryDark: getCSSVariableValueWithFallback('--color-primary-dark', fb.primaryDark),
		text: getCSSVariableValueWithFallback('--color-text', fb.text),
		textLight: getCSSVariableValueWithFallback('--color-text-light', fb.textLight),
		border: getCSSVariableValueWithFallback('--color-border', fb.border),
		surface: getCSSVariableValueWithFallback('--color-surface', fb.surface),
		surfaceElevated: getCSSVariableValueWithFallback('--color-surface-elevated', fb.surface),
		surfaceRgb: getCSSVariableValueWithFallback('--color-surface-rgb', fb.surfaceRgb),
		black: getCSSVariableValueWithFallback('--color-black', fb.black),
		white: getCSSVariableValueWithFallback('--color-white', fb.white),
		accent: getCSSVariableValueWithFallback('--color-accent', fb.accent),
		highlight: getCSSVariableValueWithFallback('--color-highlight', fb.highlight),
		success: getCSSVariableValueWithFallback('--color-success', fb.success),
		secondary: getCSSVariableValueWithFallback('--color-secondary', fb.secondary),
		// Ink + Signal viz companions, read from the OKLCH-anchored --sys-viz-*
		// tokens so charts recolour with the theme instead of the retired
		// plum/mauve/sage/slate-blue system hues.
		plum: getCSSVariableValueWithFallback('--sys-viz-6', fb.plum),
		mauve: getCSSVariableValueWithFallback('--sys-viz-5', fb.mauve),
		sage: getCSSVariableValueWithFallback('--sys-viz-3', fb.sage),
		slateBlue: getCSSVariableValueWithFallback('--sys-viz-2', fb.slateBlue),
		ochre: getCSSVariableValueWithFallback('--sys-viz-4', fb.ochre),
		umber: getCSSVariableValueWithFallback('--sys-viz-7', fb.umber),
		// Chart chrome speaks the data voice: Spline Sans Mono.
		fontFamily: getCSSVariableValueWithFallback('--font-family-mono', fb.fontFamily),
		// Include theme to make $derived reactive to theme changes
		currentTheme: theme
	};
}

/**
 * The curated 7-hue timeline palette — use as a default categorical series
 * palette on visualization pages when a balanced, coordinated set of hues
 * is preferred over the broader brand palette.
 *
 * Returns resolved hex values (canvas-safe) for ECharts/D3 consumption.
 */
export function getTimelinePalette(): string[] {
	// The timeline tokens alias --sys-viz-*, in both themes, so the fallbacks
	// are the same records the rest of this module uses rather than a third
	// hand-copied set. (They were exactly that, and went stale.)
	const fb: Record<keyof typeof CHART_COLOR_FALLBACKS, string> =
		getTheme() === 'dark'
			? { ...CHART_COLOR_FALLBACKS, ...CHART_COLOR_FALLBACKS_DARK }
			: CHART_COLOR_FALLBACKS;
	return [
		getCSSVariableValueWithFallback('--color-timeline-positions', fb.accent), // viz-1 pine
		getCSSVariableValueWithFallback('--color-timeline-education', fb.sage), // viz-3 olive
		getCSSVariableValueWithFallback('--color-timeline-grants', fb.ochre), // viz-4 ochre
		getCSSVariableValueWithFallback('--color-timeline-publications', fb.slateBlue), // viz-2 slate
		getCSSVariableValueWithFallback('--color-timeline-presentations', fb.mauve), // viz-5 mauve
		getCSSVariableValueWithFallback('--color-timeline-awards', fb.umber), // viz-7 umber
		getCSSVariableValueWithFallback('--color-timeline-fieldwork', fb.plum) // viz-6 plum
	];
}

/**
 * Common tooltip styles for ECharts components.
 * Returns style configuration object for consistent tooltip appearance.
 *
 * @param colors - Resolved chart colors
 * @returns ECharts tooltip configuration object
 */
export function getEChartsTooltipStyle(colors: ResolvedChartColors) {
	// Ink + Signal: flat archival tooltip. Square corners, hairline border,
	// solid elevated paper — no glass blur, no shadow, no radius. Text speaks
	// the data voice (Spline Sans Mono via colors.fontFamily).
	return {
		backgroundColor: colors.surfaceElevated || colors.surface,
		textStyle: {
			color: colors.text,
			fontSize: 12,
			fontFamily: colors.fontFamily
		},
		borderRadius: 0,
		borderColor: colors.border,
		borderWidth: 1,
		padding: [8, 12],
		transitionDuration: 0.12,
		extraCssText: 'box-shadow: none;'
	};
}

/**
 * Common axis line styles for ECharts components.
 *
 * @param colors - Resolved chart colors
 * @returns ECharts axis line style configuration
 */
export function getEChartsAxisLineStyle(colors: ResolvedChartColors) {
	return {
		lineStyle: {
			color: colors.border
		}
	};
}

/**
 * Common split line styles for ECharts components.
 *
 * @param colors - Resolved chart colors
 * @returns ECharts split line style configuration
 */
export function getEChartsSplitLineStyle(colors: ResolvedChartColors) {
	return {
		lineStyle: {
			color: colors.border,
			opacity: 0.3,
			// Solid, not dashed: the brief draws hierarchy in rules, and a rule
			// is a rule. The gridline recedes on opacity, not on being broken up.
			type: 'solid' as const
		}
	};
}
