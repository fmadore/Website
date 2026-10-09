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
 * `project` before feeding the timeline builder below.
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

export interface CrossTabRow {
	key: string;
	total: number;
	/** One count per column, in `columns` order; 0 where nothing falls. */
	cells: number[];
}

export interface CrossTab {
	rows: CrossTabRow[];
	columns: { key: string; total: number }[];
	/** The largest single cell: the top of the ink ramp. */
	maxCell: number;
	/** The largest row total: the full length of a row's total bar. */
	maxRowTotal: number;
	total: number;
}

/**
 * Tally items into a two-way table keyed by `getRow` and `getColumn`.
 *
 * Rows and columns are each ordered by their total, largest first, ties broken
 * on the key, so a rebuild never reshuffles the table. Items whose row or
 * column key is nullish or blank are not counted. Only keys that occur are
 * kept, so the table never carries an empty row or column.
 */
export function buildCrossTab<T>(
	items: readonly T[],
	getRow: (item: T) => string | null | undefined,
	getColumn: (item: T) => string | null | undefined
): CrossTab {
	const counts = new Map<string, Map<string, number>>();
	const columnTotals = new Map<string, number>();
	for (const item of items) {
		const row = getRow(item)?.trim();
		const column = getColumn(item)?.trim();
		if (!row || !column) continue;
		const cells = counts.get(row) ?? new Map<string, number>();
		cells.set(column, (cells.get(column) ?? 0) + 1);
		counts.set(row, cells);
		columnTotals.set(column, (columnTotals.get(column) ?? 0) + 1);
	}

	const byTotal = (a: { key: string; total: number }, b: { key: string; total: number }) =>
		b.total - a.total || a.key.localeCompare(b.key);
	const columns = [...columnTotals].map(([key, total]) => ({ key, total })).sort(byTotal);
	const rows = [...counts]
		.map(([key, cells]) => ({
			key,
			total: [...cells.values()].reduce((sum, n) => sum + n, 0),
			cells: columns.map((column) => cells.get(column.key) ?? 0)
		}))
		.sort(byTotal);

	return {
		rows,
		columns,
		maxCell: Math.max(0, ...rows.flatMap((row) => row.cells)),
		maxRowTotal: Math.max(0, ...rows.map((row) => row.total)),
		total: rows.reduce((sum, row) => sum + row.total, 0)
	};
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

/**
 * Build the rows of a "per year by type" stacked bar chart: one row per year
 * (ascending) with a column per type key, holding that year's count. Column
 * names go through `labelFor` so chart legends can show display labels while
 * counting on raw type keys. Items whose type is not in `typeKeys` are
 * ignored (they would have no column).
 */
export function buildStackedByYear<T>(
	items: T[],
	options: {
		getYear: (item: T) => number;
		getType: (item: T) => string;
		/** Raw type keys, in column order. */
		typeKeys: string[];
		/** Maps a raw type key to the column/legend label. Defaults to identity. */
		labelFor?: (type: string) => string;
	}
): Array<Record<string, number>> {
	const { getYear, getType, typeKeys, labelFor = (t) => t } = options;
	const yearly = new Map<number, Record<string, number>>();

	for (const item of items) {
		const year = getYear(item);
		let counts = yearly.get(year);
		if (!counts) {
			counts = {};
			typeKeys.forEach((t) => (counts![t] = 0));
			yearly.set(year, counts);
		}
		const type = getType(item);
		counts[type] = (counts[type] || 0) + 1;
	}

	return [...yearly.entries()]
		.map(([year, counts]) => {
			const row: Record<string, number> = { year };
			typeKeys.forEach((rawType) => {
				row[labelFor(rawType)] = counts[rawType] || 0;
			});
			return row;
		})
		.sort((a, b) => (a.year ?? 0) - (b.year ?? 0));
}
