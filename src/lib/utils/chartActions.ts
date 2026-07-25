/**
 * Chart Actions Utilities
 *
 * Reusable utilities for chart actions:
 * - Download an ECharts chart as a PNG image
 * - Download an inline SVG chart as a PNG image
 * - Toggle decal patterns for accessibility
 */

import { base } from '$app/paths';
// Types come from the tree-shaken core (see echartsCore.ts) rather than the
// all-in-one 'echarts' entry, so nothing here can reintroduce the full build.
import type * as echarts from '$lib/utils/echartsCore';
import { getCSSVariableValueWithFallback, CHART_COLOR_FALLBACKS } from './chartColorUtils';

/**
 * Downloads an ECharts chart instance as a PNG image.
 * Uses the current theme's surface color as background for readability.
 *
 * @param chart - The ECharts instance
 * @param filename - The filename (without extension) for the downloaded image
 */
export function downloadChartAsImage(chart: echarts.ECharts, filename: string = 'chart'): void {
	if (!chart || chart.isDisposed()) return;

	const bgColor = getCSSVariableValueWithFallback('--color-surface', CHART_COLOR_FALLBACKS.surface);

	const url = chart.getDataURL({
		type: 'png',
		pixelRatio: 2,
		backgroundColor: bgColor,
		excludeComponents: ['toolbox']
	});

	const link = document.createElement('a');
	link.download = `${filename}.png`;
	link.href = url;
	link.click();
}

/** The data-voice font, inlined into exported SVGs so labels survive. */
const EXPORT_FONT_URL = `${base}/fonts/web/spline-sans-mono-normal-latin.woff2`;
let exportFontFace: string | null | undefined;

/**
 * Fetch the mono webfont once and return it as an `@font-face` rule with the
 * file inlined as a data URI. An SVG rasterised through an `Image` cannot
 * reach out for a font file, so without this the exported PNG falls back to
 * whatever generic monospace the platform has. Returns `null` (cached) if the
 * fetch fails — a fallback font is a far better outcome than no download.
 */
async function getExportFontFace(): Promise<string | null> {
	if (exportFontFace !== undefined) return exportFontFace;
	try {
		const response = await fetch(EXPORT_FONT_URL);
		if (!response.ok) throw new Error(`HTTP ${response.status}`);
		const buffer = await response.arrayBuffer();
		let binary = '';
		const bytes = new Uint8Array(buffer);
		for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]!);
		const encoded = btoa(binary);
		exportFontFace =
			`@font-face{font-family:'Spline Sans Mono';font-style:normal;font-weight:400 700;` +
			`src:url(data:font/woff2;base64,${encoded}) format('woff2');}`;
	} catch {
		exportFontFace = null;
	}
	return exportFontFace;
}

/**
 * Downloads an inline `<svg>` chart as a PNG, matching the ECharts export:
 * same 2× pixel ratio, same themed background.
 *
 * The SVG is cloned (so the live chart is untouched), given explicit pixel
 * dimensions, and rasterised through a blob URL — which keeps the canvas
 * untainted, unlike a cross-origin image source.
 *
 * @param svg - The live SVG element to export
 * @param filename - Filename without extension
 * @param backgroundColor - Resolved background colour; defaults to the theme surface
 */
export async function downloadSvgAsImage(
	svg: SVGSVGElement,
	filename: string = 'chart',
	backgroundColor?: string
): Promise<void> {
	const rect = svg.getBoundingClientRect();
	const width = Math.max(1, Math.round(rect.width));
	const height = Math.max(1, Math.round(rect.height));
	const pixelRatio = 2;
	const bgColor =
		backgroundColor ??
		getCSSVariableValueWithFallback('--color-surface', CHART_COLOR_FALLBACKS.surface);

	const clone = svg.cloneNode(true) as SVGSVGElement;
	clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
	clone.setAttribute('width', String(width));
	clone.setAttribute('height', String(height));

	const fontFace = await getExportFontFace();
	if (fontFace) {
		const style = document.createElementNS('http://www.w3.org/2000/svg', 'style');
		style.textContent = fontFace;
		clone.insertBefore(style, clone.firstChild);
	}

	const source = new XMLSerializer().serializeToString(clone);
	const url = URL.createObjectURL(new Blob([source], { type: 'image/svg+xml;charset=utf-8' }));

	try {
		const image = await new Promise<HTMLImageElement>((resolve, reject) => {
			const img = new Image();
			img.onload = () => resolve(img);
			img.onerror = () => reject(new Error('Failed to rasterise SVG'));
			img.src = url;
		});

		const canvas = document.createElement('canvas');
		canvas.width = width * pixelRatio;
		canvas.height = height * pixelRatio;
		const ctx = canvas.getContext('2d');
		if (!ctx) return;
		ctx.scale(pixelRatio, pixelRatio);
		ctx.fillStyle = bgColor;
		ctx.fillRect(0, 0, width, height);
		ctx.drawImage(image, 0, 0, width, height);

		const link = document.createElement('a');
		link.download = `${filename}.png`;
		link.href = canvas.toDataURL('image/png');
		link.click();
	} catch (error) {
		if (import.meta.env.DEV) console.error('Failed to export SVG chart:', error);
	} finally {
		URL.revokeObjectURL(url);
	}
}

/**
 * Creates an aria configuration object for ECharts.
 * Enables screen reader labels and optionally decal patterns.
 *
 * @param showDecal - Whether to show decal patterns
 * @param description - Optional data-derived description read to screen
 *   readers instead of ECharts' generic auto-generated label
 * @returns ECharts aria configuration object
 */
export function getAriaConfig(showDecal: boolean, description?: string): Record<string, unknown> {
	return {
		enabled: true,
		decal: {
			show: showDecal
		},
		...(description ? { label: { description } } : {})
	};
}
