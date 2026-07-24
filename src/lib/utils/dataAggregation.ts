/**
 * Shared data aggregation utilities for sorting, grouping, and
 * extracting unique values from data collections.
 *
 * Used by index.ts files across src/lib/data/ categories to eliminate
 * duplicated sorting/grouping/extraction boilerplate.
 */

/**
 * Sort items by an ISO date field in descending order (newest first).
 * Missing OR unparseable date values are pushed to the end.
 */
export function sortByDate<T>(items: T[], field: keyof T = 'dateISO' as keyof T): T[] {
	return [...items].sort((a, b) => {
		// Parse to timestamps, treating missing OR unparseable dates (e.g. a
		// placeholder like 'YYYY-MM-DD') as "no date". This guarantees the
		// comparator never returns NaN — a NaN result violates the total-order
		// contract and silently corrupts Array.sort in an engine-dependent way.
		const timeA = a[field] ? new Date(String(a[field])).getTime() : NaN;
		const timeB = b[field] ? new Date(String(b[field])).getTime() : NaN;
		const validA = !Number.isNaN(timeA);
		const validB = !Number.isNaN(timeB);
		if (!validA && !validB) return 0;
		if (!validA) return 1; // a has no usable date → sorts after b
		if (!validB) return -1; // b has no usable date → sorts after a
		return timeB - timeA; // most recent first
	});
}

/**
 * Sort date-ranged items (grants, editorial memberships, …) by start date
 * descending, with ongoing entries (null endYear) floated above finished
 * ones that share the same start date, then broken by end date descending.
 */
export function sortByStartDate<
	T extends {
		dateISOStart: string;
		endYear?: number | null;
		dateISOEnd?: string | null;
	}
>(items: T[]): T[] {
	return [...items].sort((a, b) => {
		const dateComparison = new Date(b.dateISOStart).getTime() - new Date(a.dateISOStart).getTime();
		if (dateComparison !== 0) {
			return dateComparison;
		}
		if (a.endYear === null && b.endYear !== null) return -1;
		if (a.endYear !== null && b.endYear === null) return 1;
		if (a.dateISOEnd && b.dateISOEnd) {
			return new Date(b.dateISOEnd).getTime() - new Date(a.dateISOEnd).getTime();
		}
		return 0;
	});
}

/**
 * Sort items by a numeric year field in descending order (newest first).
 */
export function sortByYear<T extends { year: number }>(items: T[]): T[] {
	return [...items].sort((a, b) => b.year - a.year);
}

/**
 * Sort year-ranged items (appointments, …) most-recent first: ongoing entries
 * (null endYear) float above finished ones (ordered among themselves by start
 * year descending); finished entries order by end year descending, then start
 * year descending. The year-field sibling of {@link sortByStartDate}.
 */
export function sortByYearRange<T extends { startYear: number; endYear?: number | null }>(
	items: T[]
): T[] {
	return [...items].sort((a, b) => {
		if (a.endYear === null && b.endYear !== null) return -1;
		if (a.endYear !== null && b.endYear === null) return 1;
		if (a.endYear !== b.endYear) {
			return (b.endYear || 0) - (a.endYear || 0);
		}
		return b.startYear - a.startYear;
	});
}

/**
 * Group items by a numeric year field.
 * Returns a record mapping year numbers to arrays of items.
 */
export function groupByYear<T extends { year: number }>(items: T[]): Record<number, T[]> {
	return items.reduce<Record<number, T[]>>((acc, item) => {
		(acc[item.year] ??= []).push(item);
		return acc;
	}, {});
}

/**
 * Group items by a string field value.
 * Skips items where the field is falsy (null, undefined, empty string).
 */
export function groupByField<T>(items: T[], field: keyof T): Record<string, T[]> {
	return items.reduce<Record<string, T[]>>((acc, item) => {
		const value = item[field];
		if (value) {
			const key = String(value);
			if (!acc[key]) acc[key] = [];
			acc[key].push(item);
		}
		return acc;
	}, {});
}

/**
 * Extract unique values from a single-value string field.
 * Filters out falsy values and returns sorted unique strings.
 */
export function extractUnique<T>(items: T[], field: keyof T): string[] {
	return Array.from(
		new Set(
			items
				.map((item) => item[field])
				.filter((val): val is string & T[keyof T] => Boolean(val))
				.map(String)
		)
	).sort();
}

/**
 * Extract unique values from an array field (e.g., tags).
 * Flattens the arrays and returns sorted unique strings.
 */
export function extractUniqueTags<T>(items: T[], field: keyof T): string[] {
	return Array.from(
		new Set(
			items.flatMap((item) => {
				const val = item[field];
				return Array.isArray(val) ? val : [];
			})
		)
	).sort();
}

/**
 * Extract unique values from a string field that contains delimited values.
 * Splits each value by the delimiter, trims, and returns sorted unique strings.
 */
export function extractUniqueDelimited<T>(
	items: T[],
	field: keyof T,
	delimiter: string = ','
): string[] {
	return Array.from(
		new Set(
			items.flatMap((item) => {
				const val = item[field];
				if (typeof val === 'string') {
					return val.split(delimiter).map((s) => s.trim());
				}
				return [];
			})
		)
	).sort();
}
