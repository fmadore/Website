/**
 * Basemap paint plan: the CARTO vector styles repainted from design tokens.
 *
 * Positron and Dark Matter ship their own palettes: a cool grey paper beside
 * the warm `#FAF7EF` ground, and in midnight a slate ocean on pure-black land,
 * which breaks the microfilm negative. Rather than fork the styles (and own
 * 95 layers of road casing), the map keeps CARTO's geometry and labels and
 * repaints every colour property from the page's own tokens once a style has
 * loaded, in either theme.
 *
 * This module is the pure half: which layer takes which token, as an ordered
 * list of rules matched against the layer id (first match wins). The browser
 * half (`applyBasemapPaint` in `maplibre.ts`) resolves the tokens with
 * `getComputedStyle` at runtime, so there is no literal colour here and a
 * token change reaches the map with no edit.
 *
 * The plan is a negative-safe ramp by construction: every role names a
 * semantic token that `dark.css` redefines, so midnight inherits the film
 * family (ground, the lighter film step for water, film hairlines, cream-faint
 * labels) without a second table.
 */

/** The basemap roles, each bound to one semantic token. */
export const BASEMAP_TOKENS = Object.freeze({
	/** Land and the page behind it: the map is printed on the page ground. */
	ground: '--color-background',
	/** Water: one step off the ground (darker paper; the lighter film step). */
	water: '--color-background-muted',
	/** Buildings, the one land feature kept as a tone at street zoom. */
	detail: '--color-surface',
	/** Roads, rails and minor boundaries: the 1px rule tier. */
	hairline: '--color-hairline',
	/** Country boundaries: the box-edge step, one weight up from a rule. */
	border: '--color-border',
	/** Place, water and road labels: faint ink, ≥4.5:1 on every ground. */
	label: '--color-text-muted',
	/** Country and continent names: muted ink, a step stronger. */
	labelStrong: '--color-text-light'
} as const);

export type BasemapRole = keyof typeof BASEMAP_TOKENS;

/** A role-to-colour table, resolved by the caller (concrete CSS colours). */
export type BasemapPalette = Record<BasemapRole, string>;

export interface BasemapLayer {
	id: string;
	type: string;
}

export interface BasemapPaintOp {
	layerId: string;
	property: string;
	value: string;
}

interface PaintRule {
	/** Layer-id pattern; `type` narrows it further when set. */
	match: RegExp;
	type?: string;
	/** Paint property → role. An empty object leaves the layer as it is. */
	paint: Partial<Record<string, BasemapRole>>;
}

/**
 * Ordered rules: the first whose pattern (and type) fits a layer decides it.
 * A layer no rule names is left as CARTO drew it, which the tests hold to
 * zero for both shipped styles.
 */
const RULES: readonly PaintRule[] = [
	// Deliberately transparent in both styles: a shadow fill and the house
	// numbers. Repainting them would draw what CARTO hid.
	{ match: /^(water_shadow|housenumber)$/, paint: {} },
	{ match: /^background$/, paint: { 'background-color': 'ground' } },
	{ match: /^water$/, paint: { 'fill-color': 'water' } },
	{ match: /^waterway$/, type: 'line', paint: { 'line-color': 'water' } },
	// Land cover, parks and land use are flattened into the ground: on a data
	// map they are noise, and in midnight a lighter patch reads as water.
	{ match: /^(landcover|landuse|park_)/, paint: { 'fill-color': 'ground' } },
	{
		match: /^building/,
		paint: { 'fill-color': 'detail', 'fill-outline-color': 'hairline' }
	},
	// The outline is CARTO's halo under the inner line; it takes the ground so
	// the boundary reads as one line, not a doubled one.
	{ match: /^boundary_country_outline$/, paint: { 'line-color': 'ground' } },
	{ match: /^boundary_country/, paint: { 'line-color': 'border' } },
	{ match: /^boundary_/, paint: { 'line-color': 'hairline' } },
	// Rail dashes are drawn over the rail in the ground colour.
	{ match: /rail_dash$/, paint: { 'line-color': 'ground' } },
	{
		match: /^(aeroway|tunnel|road|bridge|rail)/,
		type: 'line',
		paint: { 'line-color': 'hairline' }
	},
	{
		match: /^(place_country|place_continent)/,
		type: 'symbol',
		paint: { 'text-color': 'labelStrong', 'text-halo-color': 'ground' }
	},
	{
		match: /./,
		type: 'symbol',
		paint: { 'text-color': 'label', 'text-halo-color': 'ground', 'icon-color': 'label' }
	}
];

/** The rule a layer falls under, or `undefined` when none names it. */
function ruleFor(layer: BasemapLayer): PaintRule | undefined {
	return RULES.find(
		(rule) => rule.match.test(layer.id) && (!rule.type || rule.type === layer.type)
	);
}

/** Layers no rule covers: the tests hold this empty for both CARTO styles. */
export function unpaintedLayers(layers: readonly BasemapLayer[]): string[] {
	return layers.filter((layer) => !ruleFor(layer)).map((layer) => layer.id);
}

/**
 * Every `setPaintProperty` call needed to print the basemap in the given
 * palette, in layer order. Properties a layer type does not have are never
 * emitted (`icon-color` only where the rule names it, on symbols).
 */
export function planBasemapPaint(
	layers: readonly BasemapLayer[],
	palette: BasemapPalette
): BasemapPaintOp[] {
	const ops: BasemapPaintOp[] = [];
	for (const layer of layers) {
		const rule = ruleFor(layer);
		if (!rule) continue;
		for (const [property, role] of Object.entries(rule.paint)) {
			if (!role) continue;
			ops.push({ layerId: layer.id, property, value: palette[role] });
		}
	}
	return ops;
}
