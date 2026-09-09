import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { COUNTRY_COORDINATES, type LocationDatum } from '$lib/data/geo';
import {
	buildChoroplethBins,
	buildChoroplethFillExpression,
	buildChoroplethPalette,
	enrichCountryBoundaries,
	type CountryBoundaryCollection
} from './choropleth';

describe('choropleth helpers', () => {
	it('builds five contiguous bins from the observed minimum and maximum', () => {
		const bins = buildChoroplethBins([3, 11, 17], ['a', 'b', 'c', 'd', 'e']);
		expect(bins).toEqual([
			{ min: 3, max: 5, color: 'a', label: '3\u20135' },
			{ min: 6, max: 8, color: 'b', label: '6\u20138' },
			{ min: 9, max: 11, color: 'c', label: '9\u201311' },
			{ min: 12, max: 14, color: 'd', label: '12\u201314' },
			{ min: 15, max: 17, color: 'e', label: '15\u201317' }
		]);
	});

	it('contracts the legend when the count range has fewer than five values', () => {
		const bins = buildChoroplethBins([1, 2], ['a', 'b', 'c', 'd', 'e']);
		expect(bins).toEqual([
			{ min: 1, max: 1, color: 'a', label: '1' },
			{ min: 2, max: 2, color: 'e', label: '2' }
		]);
	});

	it('creates a strictly ascending MapLibre step expression', () => {
		const bins = buildChoroplethBins([1, 7], ['low', 'mid', 'high']);
		expect(buildChoroplethFillExpression(bins, 'none')).toEqual([
			'step',
			['to-number', ['get', 'count'], 0],
			'none',
			1,
			'low',
			3,
			'mid',
			5,
			'high'
		]);
	});

	it('enriches country polygons by ISO alpha-3 without mutating the source', () => {
		const source: CountryBoundaryCollection = {
			type: 'FeatureCollection',
			features: [
				{
					type: 'Feature',
					id: 'CAN',
					properties: { name: 'Canada' },
					geometry: { type: 'Polygon', coordinates: [] }
				}
			]
		};
		const data: LocationDatum[] = [{ country: 'Canada', count: 11, items: [] }];
		const enriched = enrichCountryBoundaries(source, data, COUNTRY_COORDINATES);

		expect(enriched.features[0]?.properties).toMatchObject({
			iso3: 'CAN',
			country: 'Canada',
			count: 11,
			hasData: true
		});
		expect(source.features[0]?.properties).toEqual({ name: 'Canada' });
	});

	it('uses theme colours to create a monotonic sequential ramp', () => {
		// Starts at CHOROPLETH_RAMP_START, not at the surface: the lightest bin
		// has to stay visible against the ground it sits on.
		expect(buildChoroplethPalette('#ffffff', '#000000', 3)).toEqual([
			'rgb(140, 140, 140)',
			'rgb(70, 70, 70)',
			'rgb(0, 0, 0)'
		]);
	});

	it('keeps the lightest bin off the ground it is drawn on', () => {
		// The floor the dataviz validator sets for the end of an ordinal ramp.
		const contrast = (a: string, b: string) => {
			const lum = (rgb: string) => {
				const [r, g, bl] = rgb.match(/\d+/g)!.map(Number) as [number, number, number];
				const channel = (c: number) => {
					const v = c / 255;
					return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
				};
				return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(bl);
			};
			const [hi, lo] = [lum(a), lum(b)].sort((x, y) => y - x) as [number, number];
			return (hi + 0.05) / (lo + 0.05);
		};
		const daylight = buildChoroplethPalette('#f3eee0', '#1e6a56');
		const midnight = buildChoroplethPalette('#1f1a14', '#4fbb99');
		expect(contrast(daylight[0]!, 'rgb(250, 247, 239)')).toBeGreaterThanOrEqual(2);
		expect(contrast(midnight[0]!, 'rgb(23, 19, 16)')).toBeGreaterThanOrEqual(2);
	});

	it('includes a boundary for every country currently supported by LocationMap', () => {
		const file = new URL('../../../static/data/world-countries-110m.geojson', import.meta.url);
		const boundaries = JSON.parse(readFileSync(file, 'utf8')) as CountryBoundaryCollection;
		const boundaryIds = new Set(boundaries.features.map((feature) => String(feature.id)));
		for (const { iso3 } of Object.values(COUNTRY_COORDINATES)) {
			expect(boundaryIds.has(iso3), `missing boundary for ${iso3}`).toBe(true);
		}
	});
});
