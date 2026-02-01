/**
 * Chart Color Utilities
 *
 * Centralized utilities for resolving CSS variables and colors in chart components.
 * Used by ECharts and D3 visualization components to ensure consistent theming.
 */

import { getTheme } from '$lib/stores/themeStore.svelte';

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
			const rgbVarName = rgbaMatch[1];
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
 * Base chart colors from the design system.
 * These are fallback values matching design system v2.0 (warm earth tones).
 */
export const CHART_COLOR_FALLBACKS = {
	primary: '#9a4419',
	primaryDark: '#7a3516',
	text: '#2d2820',
	textLight: '#7a7267',
	border: '#e8e4df',
	surface: '#faf9f7',
	surfaceRgb: '250, 249, 247',
	accent: '#c4a35a',
	highlight: '#f59e0b',
	success: '#10b981',
	secondary: '#6b7280',
	fontFamily: 'system-ui, sans-serif'
} as const;

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
	surfaceRgb: string;
	accent: string;
	highlight: string;
	success: string;
	secondary: string;
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
	return {
		primary: getCSSVariableValueWithFallback('--color-primary', CHART_COLOR_FALLBACKS.primary),
		primaryDark: getCSSVariableValueWithFallback(
			'--color-primary-dark',
			CHART_COLOR_FALLBACKS.primaryDark
		),
		text: getCSSVariableValueWithFallback('--color-text', CHART_COLOR_FALLBACKS.text),
		textLight: getCSSVariableValueWithFallback(
			'--color-text-light',
			CHART_COLOR_FALLBACKS.textLight
		),
		border: getCSSVariableValueWithFallback('--color-border', CHART_COLOR_FALLBACKS.border),
		surface: getCSSVariableValueWithFallback('--color-surface', CHART_COLOR_FALLBACKS.surface),
		surfaceRgb: getCSSVariableValueWithFallback(
			'--color-surface-rgb',
			CHART_COLOR_FALLBACKS.surfaceRgb
		),
		accent: getCSSVariableValueWithFallback('--color-accent', CHART_COLOR_FALLBACKS.accent),
		highlight: getCSSVariableValueWithFallback(
			'--color-highlight',
			CHART_COLOR_FALLBACKS.highlight
		),
		success: getCSSVariableValueWithFallback('--color-success', CHART_COLOR_FALLBACKS.success),
		secondary: getCSSVariableValueWithFallback(
			'--color-secondary',
			CHART_COLOR_FALLBACKS.secondary
		),
		fontFamily: getCSSVariableValueWithFallback(
			'--font-family-sans',
			CHART_COLOR_FALLBACKS.fontFamily
		),
		// Include theme to make $derived reactive to theme changes
		currentTheme: getTheme()
	};
}

/**
 * Common tooltip styles for ECharts components.
 * Returns style configuration object for consistent tooltip appearance.
 *
 * @param colors - Resolved chart colors
 * @returns ECharts tooltip configuration object
 */
export function getEChartsTooltipStyle(colors: ResolvedChartColors) {
	return {
		backgroundColor: `color-mix(in srgb, ${colors.surface} 90%, transparent)`,
		textStyle: {
			color: colors.text,
			fontSize: 12,
			fontFamily: colors.fontFamily
		},
		borderRadius: 8,
		borderColor: colors.border,
		borderWidth: 1,
		padding: [10, 14],
		extraCssText:
			'backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px); box-shadow: var(--shadow-lg);'
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
			type: 'dashed' as const
		}
	};
}
