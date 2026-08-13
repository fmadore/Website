import type { CountryCoordinates, LocationDatum } from '$lib/data/geo';
import { parseColor } from '$lib/utils/colorContrast';
import type { ExpressionSpecification } from 'maplibre-gl';

export type CountryBoundaryProperties = Record<string, unknown> & {
	name?: string;
	iso3?: string;
	country?: string;
	count?: number;
	hasData?: boolean;
};

export type CountryBoundaryCollection = GeoJSON.FeatureCollection<
	GeoJSON.Polygon | GeoJSON.MultiPolygon,
	CountryBoundaryProperties
>;

export type ChoroplethBin = {
	min: number;
	max: number;
	color: string;
	label: string;
};

/** Blend two design-token colours into an sRGB colour MapLibre can parse. */
export function mixRgbColors(background: string, foreground: string, ratio: number): string {
	const from = parseColor(background);
	const to = parseColor(foreground);
	if (!from || !to) return foreground;
	const amount = Math.max(0, Math.min(1, ratio));
	const mix = (start: number, end: number) => Math.round(start + (end - start) * amount);
	return `rgb(${mix(from.r, to.r)}, ${mix(from.g, to.g)}, ${mix(from.b, to.b)})`;
}

/** A five-step sequential ramp derived from the current surface and accent tokens. */
export function buildChoroplethPalette(surface: string, accent: string, steps = 5): string[] {
	if (steps <= 0) return [];
	if (steps === 1) return [mixRgbColors(surface, accent, 1)];
	return Array.from({ length: steps }, (_, index) => {
		const ratio = 0.32 + (index / (steps - 1)) * 0.68;
		return mixRgbColors(surface, accent, ratio);
	});
}

/**
 * Build contiguous equal-interval bins from the observed positive counts.
 * The number of bins contracts for very small ranges so MapLibre's `step`
 * expression never receives duplicate stop values.
 */
export function buildChoroplethBins(counts: number[], palette: string[]): ChoroplethBin[] {
	const values = counts
		.filter((count) => Number.isFinite(count) && count > 0)
		.map((count) => Math.floor(count));
	if (values.length === 0 || palette.length === 0) return [];

	const min = Math.min(...values);
	const max = Math.max(...values);
	const range = max - min + 1;
	const binCount = Math.min(palette.length, range);

	return Array.from({ length: binCount }, (_, index) => {
		const binMin = min + Math.floor((index * range) / binCount);
		const binMax = min + Math.floor(((index + 1) * range) / binCount) - 1;
		const paletteIndex =
			binCount === 1
				? palette.length - 1
				: Math.round((index * (palette.length - 1)) / (binCount - 1));
		return {
			min: binMin,
			max: binMax,
			color: palette[paletteIndex]!,
			label: binMin === binMax ? String(binMin) : `${binMin}\u2013${binMax}`
		};
	});
}

/** MapLibre v6 discrete fill expression, with zero/no-data countries left neutral. */
export function buildChoroplethFillExpression(
	bins: ChoroplethBin[],
	noDataColor: string
): ExpressionSpecification {
	const expression: unknown[] = ['step', ['to-number', ['get', 'count'], 0], noDataColor];
	for (const bin of bins) expression.push(bin.min, bin.color);
	return expression as ExpressionSpecification;
}

/** Attach current data to a reusable Natural Earth boundary collection by ISO alpha-3. */
export function enrichCountryBoundaries(
	boundaries: CountryBoundaryCollection,
	data: LocationDatum[],
	coordinates: Record<string, CountryCoordinates>
): CountryBoundaryCollection {
	const datumByIso3 = new Map<string, LocationDatum>();
	for (const datum of data) {
		const iso3 = coordinates[datum.country]?.iso3;
		if (iso3) datumByIso3.set(iso3, datum);
	}

	return {
		...boundaries,
		features: boundaries.features.map((feature) => {
			const iso3 = String(feature.id ?? feature.properties?.iso3 ?? '');
			const datum = datumByIso3.get(iso3);
			return {
				...feature,
				properties: {
					...feature.properties,
					iso3,
					country: datum?.country ?? feature.properties?.name ?? iso3,
					count: datum?.count ?? 0,
					hasData: Boolean(datum)
				}
			};
		})
	};
}
