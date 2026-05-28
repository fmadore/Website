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

export interface FrequencyDatum {
	key: string;
	count: number;
}

/**
 * Tally how often each key appears across `items`. `getKeys` may return a single
 * string, an array (multi-valued fields like tags/languages), or nullish to skip
 * the item. Keys are trimmed; empty keys are ignored.
 *
 * Results are sorted by count descending by default, or by key ascending
 * (numeric-aware, e.g. for a year axis) when `sort: 'key-asc'` is passed.
 *
 * Replaces the hand-rolled `Record<string, number>` build-then-sort loop that
 * was duplicated across both viz pages (cited authors, languages, tags,
 * countries, citations-per-year, …).
 */
export function tallyBy<T>(
	items: T[],
	getKeys: (item: T) => string | string[] | null | undefined,
	options: { sort?: 'count-desc' | 'key-asc' } = {}
): FrequencyDatum[] {
	const counts: Record<string, number> = {};

	for (const item of items) {
		const raw = getKeys(item);
		if (raw == null) continue;
		const keys = Array.isArray(raw) ? raw : [raw];
		for (const value of keys) {
			const key = value?.trim();
			if (!key) continue;
			counts[key] = (counts[key] ?? 0) + 1;
		}
	}

	const entries = Object.entries(counts).map(([key, count]) => ({ key, count }));
	return options.sort === 'key-asc'
		? entries.sort((a, b) => a.key.localeCompare(b.key, undefined, { numeric: true }))
		: entries.sort((a, b) => b.count - a.count);
}

/**
 * Group items into a record keyed by a string accessor. Items whose key is
 * nullish or whitespace-only are skipped. Used to bucket publications by
 * `project` before feeding the treemap / timeline builders below.
 */
export function groupByKey<T>(
	items: T[],
	getKey: (item: T) => string | null | undefined
): Record<string, T[]> {
	const groups: Record<string, T[]> = {};
	for (const item of items) {
		const key = getKey(item)?.trim();
		if (!key) continue;
		(groups[key] ??= []).push(item);
	}
	return groups;
}

// Property name is `publications` to match the ECharts treemap / timeline
// component props; it holds the list of item titles shown in tooltips.
export interface TreemapChild {
	name: string;
	value: number;
	publications: string[];
}

export interface TreemapNode {
	name: string;
	children: TreemapChild[];
}

/**
 * Build a two-level treemap from pre-grouped items: each group becomes an outer
 * node, its items are bucketed by `getChildName`, and each bucket's value is the
 * item count (with item titles collected for the tooltip). Empty groups are
 * dropped; outer nodes and their children are sorted by descending value.
 */
export function buildGroupedTreemap<T>(
	groups: Record<string, T[]>,
	getChildName: (item: T) => string,
	getTitle: (item: T) => string
): TreemapNode[] {
	return Object.entries(groups)
		.map(([name, items]) => {
			const buckets: Record<string, { count: number; titles: string[] }> = {};
			for (const item of items) {
				const child = getChildName(item);
				(buckets[child] ??= { count: 0, titles: [] }).count++;
				buckets[child].titles.push(getTitle(item));
			}
			const children = Object.entries(buckets)
				.map(([childName, data]) => ({
					name: childName,
					value: data.count,
					publications: data.titles
				}))
				.sort((a, b) => b.value - a.value);
			return { name, children };
		})
		.filter((node) => node.children.length > 0)
		.sort(
			(a, b) =>
				b.children.reduce((sum, child) => sum + child.value, 0) -
				a.children.reduce((sum, child) => sum + child.value, 0)
		);
}

export interface ProjectTimelineItem {
	title: string;
	year: number;
	type: string;
}

export interface ProjectTimelineEntry {
	name: string;
	startYear: number;
	endYear: number;
	publications: ProjectTimelineItem[];
}

/**
 * Build project-span timeline entries from pre-grouped items. Each group yields
 * one entry spanning its min→max year, with its items sorted chronologically.
 * Entries are sorted by start year ascending.
 */
export function buildProjectTimeline<T>(
	groups: Record<string, T[]>,
	toItem: (item: T) => ProjectTimelineItem
): ProjectTimelineEntry[] {
	return Object.entries(groups)
		.map(([name, items]) => {
			const mapped = items.map(toItem).sort((a, b) => a.year - b.year);
			const years = mapped.map((entry) => entry.year);
			return {
				name,
				startYear: Math.min(...years),
				endYear: Math.max(...years),
				publications: mapped
			};
		})
		.sort((a, b) => a.startYear - b.startYear);
}
