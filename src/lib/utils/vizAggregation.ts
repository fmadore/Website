/**
 * Pure data builders shared by the visualisations pages
 * (publications/visualisations and conference-activity/visualisations).
 *
 * Each helper takes the raw item array plus accessor callbacks; it owns the
 * group-then-sort algorithm so the two viz pages no longer hand-roll it.
 */
import type { LocationDatum } from '$lib/data/geo';

/**
 * Group items by a country/location key, collect per-item metadata, and sort
 * countries by item count descending. Used by both viz pages to feed
 * `<LocationMap>` from their respective entity arrays.
 *
 * Items whose country accessor returns falsy or whitespace-only are skipped.
 *
 * @param items - The source array (publications, communications, …).
 * @param getCountry - Returns the country string for grouping. Trimmed; falsy → skipped.
 * @param toItem - Builds the per-item payload that lands in the popup.
 */
export function buildLocationData<T>(
	items: T[],
	getCountry: (item: T) => string | undefined,
	toItem: (item: T) => { id: string; title: string; subtitle?: string; type?: string }
): LocationDatum[] {
	const byCountry: Record<string, { count: number; items: LocationDatum['items'] }> = {};

	for (const item of items) {
		const country = getCountry(item)?.trim();
		if (!country) continue;
		if (!byCountry[country]) byCountry[country] = { count: 0, items: [] };
		byCountry[country].count++;
		byCountry[country].items.push(toItem(item));
	}

	return Object.entries(byCountry)
		.map(([country, data]) => ({ country, count: data.count, items: data.items }))
		.sort((a, b) => b.count - a.count);
}
