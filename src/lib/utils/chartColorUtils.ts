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
			hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
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

/** Shared gradient return type for ECharts linear gradients */
type EChartsLinearGradient = {
	type: 'linear';
	x: number;
	y: number;
	x2: number;
	y2: number;
	colorStops: { offset: number; color: string }[];
};

/**
 * Creates a vertical ECharts linear gradient (top-to-bottom).
 * Useful for vertical bar charts.
 *
 * @param color - The base color (fully resolved, not a CSS variable)
 * @param opacity - Opacity for the bottom of the gradient (0-1)
 */
export function getBarGradient(color: string, opacity: number = 0.6): EChartsLinearGradient {
	return {
		type: 'linear',
		x: 0,
		y: 0,
		x2: 0,
		y2: 1,
		colorStops: [
			{ offset: 0, color },
			{ offset: 1, color: colorWithOpacity(color, opacity) }
		]
	};
}

/**
 * Creates a horizontal ECharts linear gradient (left-to-right).
 * Useful for horizontal bar charts.
 *
 * @param color - The base color (fully resolved, not a CSS variable)
 * @param startOpacity - Opacity at the start (left) of the gradient
 */
export function getHorizontalBarGradient(
	color: string,
	startOpacity: number = 0.6
): EChartsLinearGradient {
	return {
		type: 'linear',
		x: 0,
		y: 0,
		x2: 1,
		y2: 0,
		colorStops: [
			{ offset: 0, color: colorWithOpacity(color, startOpacity) },
			{ offset: 1, color }
		]
	};
}

/**
 * Returns animation config respecting reduced-motion preferences.
 *
 * @param duration - Base animation duration in ms
 * @param easing - ECharts easing function name
 * @returns Animation configuration object
 */
export function getAnimationConfig(
	duration: number = 1000,
	easing: string = 'cubicOut'
): { animationDuration: number; animationEasing: string } {
	const noMotion = prefersReducedMotion();
	return {
		animationDuration: noMotion ? 0 : duration,
		animationEasing: easing
	};
}

/**
 * Base chart colors from the design system.
 * These are fallback values matching the teal/amber design system.
 */
export const CHART_COLOR_FALLBACKS = {
	primary: '#0f766e',
	primaryDark: '#115e59',
	text: '#1f2937',
	textLight: '#6b7280',
	border: '#e5e7eb',
	surface: '#f9fafb',
	surfaceRgb: '249, 250, 251',
	black: '#000000',
	white: '#ffffff',
	accent: '#f59e0b',
	highlight: '#f59e0b',
	success: '#10b981',
	secondary: '#6b7280',
	purple: '#8b5cf6',
	purpleLight: '#a78bfa',
	pink: '#ec4899',
	pinkLight: '#f472b6',
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
	black: string;
	white: string;
	accent: string;
	highlight: string;
	success: string;
	secondary: string;
	purple: string;
	purpleLight: string;
	pink: string;
	pinkLight: string;
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
		black: getCSSVariableValueWithFallback('--color-black', CHART_COLOR_FALLBACKS.black),
		white: getCSSVariableValueWithFallback('--color-white', CHART_COLOR_FALLBACKS.white),
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
		purple: getCSSVariableValueWithFallback('--sys-color-purple-500', CHART_COLOR_FALLBACKS.purple),
		purpleLight: getCSSVariableValueWithFallback(
			'--sys-color-purple-400',
			CHART_COLOR_FALLBACKS.purpleLight
		),
		pink: getCSSVariableValueWithFallback('--sys-color-pink-500', CHART_COLOR_FALLBACKS.pink),
		pinkLight: getCSSVariableValueWithFallback(
			'--sys-color-pink-400',
			CHART_COLOR_FALLBACKS.pinkLight
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
		transitionDuration: 0.15,
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
