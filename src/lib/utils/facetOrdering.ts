/** Frequency ordering for the fixed facet vocabularies. */
export function countOccurrences(lists: readonly (readonly string[])[]): Map<string, number> {
	const counts = new Map<string, number>();
	for (const list of lists)
		for (const value of list) counts.set(value, (counts.get(value) ?? 0) + 1);
	return counts;
}
export function byFrequencyThenAlpha(
	values: readonly string[],
	counts: ReadonlyMap<string, number>
): string[] {
	return [...values].sort(
		(a, b) => (counts.get(b) ?? 0) - (counts.get(a) ?? 0) || a.localeCompare(b)
	);
}
