// Shared geographic data used by map-based visualisations.
//
// Country coordinates are approximate centres / capital cities — precise
// enough for a country-level marker on a world map.
//
// Only include countries that actually appear in the site's data. Add new
// entries when a new country is introduced via a publication's
// `publisherLocation` or an activity's `location.country`. Unmapped countries
// are silently dropped from the map with a visible "N not shown" note.

export type CountryCoordinates = { lat: number; lng: number; iso3: string };

export const COUNTRY_COORDINATES: Record<string, CountryCoordinates> = {
	// Publications — publisher locations
	Belgium: { lat: 50.8503, lng: 4.3517, iso3: 'BEL' },
	Canada: { lat: 45.4215, lng: -75.6972, iso3: 'CAN' },
	France: { lat: 48.8566, lng: 2.3522, iso3: 'FRA' },
	Germany: { lat: 52.52, lng: 13.405, iso3: 'DEU' },
	Netherlands: { lat: 52.3676, lng: 4.9041, iso3: 'NLD' },
	Senegal: { lat: 14.7167, lng: -17.4677, iso3: 'SEN' },
	Switzerland: { lat: 46.9481, lng: 7.4474, iso3: 'CHE' },
	'United Kingdom': { lat: 51.5074, lng: -0.1278, iso3: 'GBR' },
	'United States': { lat: 38.9072, lng: -77.0369, iso3: 'USA' },

	// Activities — presentation / workshop locations
	'South Africa': { lat: -25.7479, lng: 28.2293, iso3: 'ZAF' },
	Sweden: { lat: 59.3293, lng: 18.0686, iso3: 'SWE' },
	Benin: { lat: 6.3703, lng: 2.3912, iso3: 'BEN' },
	'Burkina Faso': { lat: 12.3714, lng: -1.5197, iso3: 'BFA' },
	Cameroon: { lat: 3.848, lng: 11.5021, iso3: 'CMR' },
	"Côte d'Ivoire": { lat: 5.36, lng: -4.0083, iso3: 'CIV' },
	'Czech Republic': { lat: 50.0755, lng: 14.4378, iso3: 'CZE' },
	Italy: { lat: 41.9028, lng: 12.4964, iso3: 'ITA' },
	Luxembourg: { lat: 49.6116, lng: 6.1319, iso3: 'LUX' },
	Mali: { lat: 12.6392, lng: -8.0029, iso3: 'MLI' },
	Niger: { lat: 13.5116, lng: 2.1254, iso3: 'NER' },
	Poland: { lat: 52.2297, lng: 21.0122, iso3: 'POL' },
	// Natural Earth has a United Kingdom boundary rather than a separate
	// Scotland feature, so the choropleth joins Scotland to GBR while its marker
	// remains anchored in Edinburgh.
	Scotland: { lat: 55.9533, lng: -3.1883, iso3: 'GBR' }
};

/**
 * Generic per-country datum used by the shared location map component.
 * Each entry is a country with a count and a list of items to list in the
 * map popup. Consumers aggregate their own data into this shape before
 * passing it to the map.
 */
export type LocationMapItem = {
	id: string;
	title: string;
	/** Optional secondary line (e.g. publisher name, venue). */
	subtitle?: string;
	/** Optional type (e.g. publication type, activity type). */
	type?: string;
};

export type LocationDatum = {
	country: string;
	count: number;
	items: LocationMapItem[];
};
