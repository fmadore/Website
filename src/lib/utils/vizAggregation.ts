/**
 * Pure data builders shared by the visualisations pages
 * (publications/visualisations and conference-activity/visualisations).
 *
 * Each helper takes the raw item array plus accessor callbacks; it owns the
 * group-then-sort algorithm so the two viz pages no longer hand-roll it.
 */
import type { LocationDatum } from '#lib/data/geo.ts';

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

/** A project's recorded period, as `parseProjectPeriod` returns it. */
export interface ProjectTimelinePeriod {
	startYear: number;
	endYear: number;
	/** Open-ended in the record; `endYear` is then the build year. */
	ongoing: boolean;
}

export interface ProjectTimelineEntry {
	name: string;
	/**
	 * The period the project ran, from its research record — what the bar
	 * draws. `null` when no record names the project: the plate then draws its
	 * markers with no bar, because a span inferred from the outputs would claim
	 * a period nobody recorded.
	 */
	period: ProjectTimelinePeriod | null;
	/** The first and last years an output carries (the marker span). */
	firstItemYear: number;
	lastItemYear: number;
	/** Outputs, oldest first. */
	items: ProjectTimelineItem[];
	/** How many outputs fall before the period starts or after it ends. */
	outsidePeriod: number;
}

/**
 * Build project timeline entries from pre-grouped items. Each group yields one
 * entry: its recorded period (from `periodOf`, keyed by the group name), and
 * its outputs sorted chronologically. Outputs keep their own years, so work
 * published before a project was funded or after it closed falls outside its
 * bar rather than stretching it. Entries are ordered by the period's start, or
 * the first output where there is no period, then by name.
 */
export function buildProjectTimeline<T>(
	groups: Record<string, T[]>,
	toItem: (item: T) => ProjectTimelineItem,
	periodOf: (name: string) => ProjectTimelinePeriod | null | undefined = () => null
): ProjectTimelineEntry[] {
	return Object.entries(groups)
		.map(([name, group]) => {
			const items = group.map(toItem).sort((a, b) => a.year - b.year);
			const years = items.map((entry) => entry.year);
			const period = periodOf(name) ?? null;
			return {
				name,
				period,
				firstItemYear: Math.min(...years),
				lastItemYear: Math.max(...years),
				items,
				outsidePeriod: period
					? items.filter((i) => i.year < period.startYear || i.year > period.endYear).length
					: 0
			};
		})
		.sort(
			(a, b) =>
				(a.period?.startYear ?? a.firstItemYear) - (b.period?.startYear ?? b.firstItemYear) ||
				a.name.localeCompare(b.name)
		);
}

/**
 * Every year from the smallest to the largest in `years`, ascending. A year
 * axis built from the years that carry data skips the empty ones, so a bar
 * chart would set 2014 and 2016 side by side; this is the axis instead.
 */
export function yearRange(years: Iterable<number>): number[] {
	let min = Infinity;
	let max = -Infinity;
	for (const year of years) {
		if (!Number.isFinite(year)) continue;
		if (year < min) min = year;
		if (year > max) max = year;
	}
	if (min > max) return [];
	return Array.from({ length: max - min + 1 }, (_, i) => min + i);
}

/**
 * Per-year values with the empty years put back: one row per year from the
 * first to the last, `value` 0 where `values` has none. The year tallies on
 * the visualisation pages go through this, so their axes run without a gap
 * as the home chart and the index year strips do.
 */
export function fillYearSeries(values: ReadonlyMap<number, number>): Array<{
	year: number;
	value: number;
}> {
	return yearRange(values.keys()).map((year) => ({ year, value: values.get(year) ?? 0 }));
}

/**
 * Build the rows of a "per year by type" stacked bar chart: one row per year
 * from the first to the last (ascending, empty years included as zeros) with a
 * column per type key, holding that year's count. Column
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

	return yearRange(yearly.keys()).map((year) => {
		const counts = yearly.get(year);
		const row: Record<string, number> = { year };
		typeKeys.forEach((rawType) => {
			row[labelFor(rawType)] = counts?.[rawType] || 0;
		});
		return row;
	});
}

/**
 * The data table behind a stacked plate: one row per year, a cell per column
 * in `keys` order, and the year's total. Built from the rows the chart draws,
 * so the table carries the stack as well as its totals.
 */
export function stackedTableRows(
	rows: ReadonlyArray<Record<string, number>>,
	keys: readonly string[]
): Array<{ label: string; value: number; cells: number[] }> {
	return rows.map((row) => {
		const cells = keys.map((key) => row[key] ?? 0);
		return {
			label: String(row.year ?? ''),
			value: cells.reduce((sum, n) => sum + n, 0),
			cells
		};
	});
}
