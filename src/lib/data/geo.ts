// Shared geographic data used by map-based visualisations.
//
// Country coordinates are approximate centres / capital cities — precise
// enough for a country-level marker on a world map.
//
// Only include countries that actually appear in the site's data. Add new
// entries when a new country is introduced via a publication's
// `publisherLocation` or an activity's `location.country`. Unmapped countries
// are silently dropped from the map with a visible "N not shown" note.

export type CountryCoordinates = { lat: number; lng: number };

export const COUNTRY_COORDINATES: Record<string, CountryCoordinates> = {
	// Publications — publisher locations
	Belgium: { lat: 50.8503, lng: 4.3517 },
	Canada: { lat: 45.4215, lng: -75.6972 },
	France: { lat: 48.8566, lng: 2.3522 },
	Germany: { lat: 52.52, lng: 13.405 },
	Netherlands: { lat: 52.3676, lng: 4.9041 },
	Senegal: { lat: 14.7167, lng: -17.4677 },
	Switzerland: { lat: 46.9481, lng: 7.4474 },
	'United Kingdom': { lat: 51.5074, lng: -0.1278 },
	'United States': { lat: 38.9072, lng: -77.0369 },

	// Activities — presentation / workshop locations
	'South Africa': { lat: -25.7479, lng: 28.2293 },
	Sweden: { lat: 59.3293, lng: 18.0686 }
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
