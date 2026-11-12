/**
 * The browser half of the basemap repaint: resolve the design tokens the page
 * is printed in now and apply `basemapPaint.ts`'s plan to a loaded style.
 * Kept apart from `maplibre.ts` (the loader) so the hook can call it without
 * the loader's dynamic imports, and so the plan itself stays pure and tested.
 */

import type { Map as MapLibreMap } from 'maplibre-gl';
import { BASEMAP_TOKENS, planBasemapPaint, type BasemapPalette } from './basemapPaint.ts';

let colourProbe: CanvasRenderingContext2D | null | undefined;

/**
 * A token value as a colour MapLibre can parse. The tokens resolve to hex
 * today, but a token written as `color-mix()` or `oklch()` would reach the
 * style spec unparsed, so anything else is normalised through a 1px canvas.
 */
function concreteColour(value: string): string {
	if (/^(#[0-9a-f]{3,8}|rgba?\([^)]*\))$/i.test(value)) return value;
	colourProbe ??= document.createElement('canvas').getContext('2d', { willReadFrequently: true });
	if (!colourProbe) return value;
	colourProbe.clearRect(0, 0, 1, 1);
	colourProbe.fillStyle = value;
	colourProbe.fillRect(0, 0, 1, 1);
	const [r, g, b, a] = colourProbe.getImageData(0, 0, 1, 1).data;
	return `rgba(${r}, ${g}, ${b}, ${(a ?? 255) / 255})`;
}

/** The basemap palette for the theme the page is in now. */
export function resolveBasemapPalette(): BasemapPalette {
	const style = getComputedStyle(document.documentElement);
	return Object.fromEntries(
		Object.entries(BASEMAP_TOKENS).map(([role, token]) => [
			role,
			concreteColour(style.getPropertyValue(token).trim())
		])
	) as BasemapPalette;
}

/**
 * Repaint the loaded CARTO style from the design tokens (see `basemapPaint.ts`).
 * Call after every `load`/`style.load`: `setStyle` brings CARTO's own colours
 * back. It runs before `onStyleReady`, so the layers a component adds itself
 * (clusters, choropleth) are not yet in the style and keep their own paint.
 */
export function applyBasemapPaint(map: MapLibreMap): void {
	const layers = map.getStyle()?.layers ?? [];
	if (layers.length === 0 || typeof document === 'undefined') return;
	const ops = planBasemapPaint(layers, resolveBasemapPalette());
	for (const { layerId, property, value } of ops) {
		try {
			// Every planned property is a colour property taking a colour string;
			// the signature is keyed per property, so name one to satisfy it.
			map.setPaintProperty(layerId, property as 'background-color', value);
		} catch {
			// A layer CARTO renamed or retyped keeps its own colour; the map still works.
		}
	}
}
