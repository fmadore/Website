/**
 * Shared helper functions for filter section components.
 * Eliminates duplication of count/label/clear logic across
 * FilterSectionCheckbox, Buttons, Chips, and Dropdown.
 */

type CountsMap = { [key: string]: number | undefined } | undefined;
type LabelsMap = { [key: string]: string } | undefined;

/** Safely get count for a filter item, defaulting to 0 */
export function getFilterCount(counts: CountsMap, item: string): number {
	return counts?.[item] ?? 0;
}

/** Resolve display label for a filter item, falling back to the raw item */
export function getFilterLabel(labels: LabelsMap, item: string): string {
	return labels?.[item] ?? item;
}

/** Clear all active items by toggling each one off */
export function clearFilterSelection(
	activeItems: string[],
	toggleItem: (item: string) => void
): void {
	activeItems.forEach((item) => toggleItem(item));
}
