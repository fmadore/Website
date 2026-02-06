/**
 * Shared data aggregation utilities for sorting, grouping, and
 * extracting unique values from data collections.
 *
 * Used by index.ts files across src/lib/data/ categories to eliminate
 * duplicated sorting/grouping/extraction boilerplate.
 */

/**
 * Sort items by an ISO date field in descending order (newest first).
 * Handles missing date values by pushing them to the end.
 */
export function sortByDate<T>(items: T[], field: keyof T = 'dateISO' as keyof T): T[] {
	return [...items].sort((a, b) => {
		const dateA = a[field];
		const dateB = b[field];
		if (!dateA && !dateB) return 0;
		if (!dateA) return 1;
		if (!dateB) return -1;
		return new Date(String(dateB)).getTime() - new Date(String(dateA)).getTime();
	});
}

/**
 * Sort items by a numeric year field in descending order (newest first).
 */
export function sortByYear<T extends { year: number }>(items: T[]): T[] {
	return [...items].sort((a, b) => b.year - a.year);
}

/**
 * Group items by a numeric year field.
 * Returns a record mapping year numbers to arrays of items.
 */
export function groupByYear<T extends { year: number }>(items: T[]): Record<number, T[]> {
	return items.reduce<Record<number, T[]>>((acc, item) => {
		if (!acc[item.year]) acc[item.year] = [];
		acc[item.year].push(item);
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
