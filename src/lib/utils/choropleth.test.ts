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
		expect(buildChoroplethPalette('#ffffff', '#000000', 3)).toEqual([
			'rgb(173, 173, 173)',
			'rgb(87, 87, 87)',
			'rgb(0, 0, 0)'
		]);
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
