import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import {
	BASEMAP_TOKENS,
	planBasemapPaint,
	unpaintedLayers,
	type BasemapLayer,
	type BasemapPalette,
	type BasemapRole
} from './basemapPaint.ts';
import { contrastRatio } from './colorContrast.ts';

/**
 * The layer ids and types of CARTO's Positron and Dark Matter GL styles
 * (identical sets, 95 layers), as served on 2026-11-12. A new layer CARTO adds
 * would be left in its own palette: `unpaintedLayers` names it, and the map
 * keeps working either way.
 */
const CARTO_LAYERS: BasemapLayer[] = (
	[
		['background', 'background'],
		['landcover', 'fill'],
		['park_national_park', 'fill'],
		['park_nature_reserve', 'fill'],
		['landuse_residential', 'fill'],
		['landuse', 'fill'],
		['waterway', 'line'],
		['boundary_county', 'line'],
		['boundary_state', 'line'],
		['water', 'fill'],
		['water_shadow', 'fill'],
		['aeroway-runway', 'line'],
		['aeroway-taxiway', 'line'],
		['waterway_label', 'symbol'],
		['tunnel_service_case', 'line'],
		['tunnel_minor_case', 'line'],
		['tunnel_sec_case', 'line'],
		['tunnel_pri_case', 'line'],
		['tunnel_trunk_case', 'line'],
		['tunnel_mot_case', 'line'],
		['tunnel_path', 'line'],
		['tunnel_service_fill', 'line'],
		['tunnel_minor_fill', 'line'],
		['tunnel_sec_fill', 'line'],
		['tunnel_pri_fill', 'line'],
		['tunnel_trunk_fill', 'line'],
		['tunnel_mot_fill', 'line'],
		['tunnel_rail', 'line'],
		['tunnel_rail_dash', 'line'],
		['road_service_case', 'line'],
		['road_minor_case', 'line'],
		['road_pri_case_ramp', 'line'],
		['road_trunk_case_ramp', 'line'],
		['road_mot_case_ramp', 'line'],
		['road_sec_case_noramp', 'line'],
		['road_pri_case_noramp', 'line'],
		['road_trunk_case_noramp', 'line'],
		['road_mot_case_noramp', 'line'],
		['road_path', 'line'],
		['road_path_areas', 'line'],
		['road_service_fill', 'line'],
		['road_minor_fill', 'line'],
		['road_pri_fill_ramp', 'line'],
		['road_trunk_fill_ramp', 'line'],
		['road_mot_fill_ramp', 'line'],
		['road_sec_fill_noramp', 'line'],
		['road_pri_fill_noramp', 'line'],
		['road_trunk_fill_noramp', 'line'],
		['road_mot_fill_noramp', 'line'],
		['rail', 'line'],
		['rail_dash', 'line'],
		['bridge_service_case', 'line'],
		['bridge_minor_case', 'line'],
		['bridge_sec_case', 'line'],
		['bridge_pri_case', 'line'],
		['bridge_trunk_case', 'line'],
		['bridge_mot_case', 'line'],
		['bridge_path', 'line'],
		['bridge_service_fill', 'line'],
		['bridge_minor_fill', 'line'],
		['bridge_sec_fill', 'line'],
		['bridge_pri_fill', 'line'],
		['bridge_trunk_fill', 'line'],
		['bridge_mot_fill', 'line'],
		['building', 'fill'],
		['building-top', 'fill'],
		['boundary_country_outline', 'line'],
		['boundary_country_inner', 'line'],
		['watername_ocean', 'symbol'],
		['watername_sea', 'symbol'],
		['watername_lake', 'symbol'],
		['watername_lake_pois', 'symbol'],
		['watername_lake_line', 'symbol'],
		['place_hamlet', 'symbol'],
		['place_suburbs', 'symbol'],
		['place_villages', 'symbol'],
		['place_town', 'symbol'],
		['place_country_2', 'symbol'],
		['place_country_1', 'symbol'],
		['place_state', 'symbol'],
		['place_continent', 'symbol'],
		['place_city_r6', 'symbol'],
		['place_city_r5', 'symbol'],
		['place_city_dot_r7', 'symbol'],
		['place_city_dot_r4', 'symbol'],
		['place_city_dot_r2', 'symbol'],
		['place_city_dot_z7', 'symbol'],
		['place_capital_dot_z7', 'symbol'],
		['poi_stadium', 'symbol'],
		['poi_park', 'symbol'],
		['roadname_minor', 'symbol'],
		['roadname_sec', 'symbol'],
		['roadname_pri', 'symbol'],
		['roadname_major', 'symbol'],
		['housenumber', 'symbol']
	] as [string, string][]
).map(([id, type]) => ({ id, type }));

/** Every `--token: value;` in a sheet, comments stripped, last wins. */
function parseTokens(path: string): Map<string, string> {
	const source = readFileSync(fileURLToPath(new URL(path, import.meta.url)), 'utf8').replace(
		/\/\*[\s\S]*?\*\//g,
		''
	);
	const tokens = new Map<string, string>();
	for (const [, name, value] of source.matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)) {
		if (name && value) tokens.set(name, value.trim());
	}
	return tokens;
}

const daylight = parseTokens('../../styles/base/variables.css');
const midnight = new Map([...daylight, ...parseTokens('../../styles/base/dark.css')]);

function resolve(table: Map<string, string>, name: string, depth = 0): string {
	const value = table.get(name) ?? '';
	const ref = value.match(/^var\((--[\w-]+)\)$/);
	return ref && depth < 10 ? resolve(table, ref[1]!, depth + 1) : value;
}

function paletteFor(table: Map<string, string>): BasemapPalette {
	return Object.fromEntries(
		Object.entries(BASEMAP_TOKENS).map(([role, token]) => [role, resolve(table, token)])
	) as BasemapPalette;
}

describe('basemap paint plan', () => {
	it('covers every layer of both CARTO styles', () => {
		expect(CARTO_LAYERS).toHaveLength(95);
		expect(unpaintedLayers(CARTO_LAYERS)).toEqual([]);
	});

	it('leaves the layers CARTO hid transparent', () => {
		const ops = planBasemapPaint(CARTO_LAYERS, paletteFor(daylight));
		expect(ops.filter((op) => op.layerId === 'housenumber')).toEqual([]);
		expect(ops.filter((op) => op.layerId === 'water_shadow')).toEqual([]);
	});

	it('maps the structural layers to their roles', () => {
		const palette = Object.fromEntries(
			Object.keys(BASEMAP_TOKENS).map((role) => [role, role])
		) as Record<BasemapRole, string>;
		const ops = planBasemapPaint(CARTO_LAYERS, palette);
		const role = (layerId: string, property: string) =>
			ops.find((op) => op.layerId === layerId && op.property === property)?.value;
		expect(role('background', 'background-color')).toBe('ground');
		expect(role('water', 'fill-color')).toBe('water');
		expect(role('landcover', 'fill-color')).toBe('ground');
		expect(role('boundary_country_inner', 'line-color')).toBe('border');
		expect(role('boundary_country_outline', 'line-color')).toBe('ground');
		expect(role('boundary_state', 'line-color')).toBe('hairline');
		expect(role('road_mot_fill_noramp', 'line-color')).toBe('hairline');
		expect(role('rail_dash', 'line-color')).toBe('ground');
		expect(role('place_country_1', 'text-color')).toBe('labelStrong');
		expect(role('place_city_r5', 'text-color')).toBe('label');
		expect(role('watername_ocean', 'text-halo-color')).toBe('ground');
		// A line layer never receives a symbol property, and vice versa.
		expect(
			ops.some((op) => op.layerId === 'road_minor_fill' && op.property.startsWith('text'))
		).toBe(false);
	});

	it('emits only token-resolved colours, never a CARTO literal', () => {
		for (const table of [daylight, midnight]) {
			const palette = paletteFor(table);
			const allowed = new Set(Object.values(palette));
			for (const op of planBasemapPaint(CARTO_LAYERS, palette)) {
				expect(allowed.has(op.value)).toBe(true);
			}
		}
	});

	it.each([
		['daylight', daylight],
		['midnight', midnight]
	])('reads in %s: labels clear 4.5:1, water and boundaries are visible', (_, table) => {
		const p = paletteFor(table);
		for (const value of Object.values(p)) expect(value).toMatch(/^#[0-9a-f]{6}$/i);
		expect(contrastRatio(p.label, p.ground)).toBeGreaterThanOrEqual(4.5);
		expect(contrastRatio(p.label, p.water)).toBeGreaterThanOrEqual(4.5);
		expect(contrastRatio(p.labelStrong, p.ground)).toBeGreaterThanOrEqual(4.5);
		expect(p.water).not.toBe(p.ground);
		expect(p.border).not.toBe(p.ground);
	});

	it('prints midnight on the film family, not slate or black', () => {
		const p = paletteFor(midnight);
		expect(p.ground.toLowerCase()).toBe(resolve(midnight, '--sys-color-film-ground').toLowerCase());
		expect(p.water.toLowerCase()).toBe(resolve(midnight, '--sys-color-film-200').toLowerCase());
	});
});
