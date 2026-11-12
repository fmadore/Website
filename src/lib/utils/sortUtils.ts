import type { Publication, PublicationSummary } from '#lib/types/publication.ts';
import type { Communication } from '#lib/types/communication.ts';
import { isForthcoming } from '#lib/utils/date-formatter.ts';

// Generic type for items that can be sorted (must have date and title)
// Use union type for items we know we'll sort
type SortableItem = Publication | PublicationSummary | Communication;

/** Citation tally: a summary carries the count, a full record the list. */
function citationCount(item: SortableItem): number {
	const asSummary = item as Partial<PublicationSummary>;
	if (typeof asSummary.citedByCount === 'number') return asSummary.citedByCount;
	return (item as Publication).citedBy?.length ?? 0;
}

/** The sort keys the index pages offer; `date` is every index's default. */
export type SortKey = 'date' | 'title' | 'citations';

/**
 * The index order: forthcoming work first (alphabetically, having no date to
 * compare), then newest first by `dateISO` (falling back to `date`), with
 * undated items last in their original order.
 */
function compareByDate(a: SortableItem, b: SortableItem): number {
	const aForthcoming = isForthcoming(a);
	const bForthcoming = isForthcoming(b);
	if (aForthcoming && !bForthcoming) return -1;
	if (!aForthcoming && bForthcoming) return 1;
	if (aForthcoming && bForthcoming) {
		return (a.title || '').localeCompare(b.title || '');
	}

	// Use dateISO for proper sorting (handles date ranges by using the first date)
	// Fall back to date field if dateISO is not available (for backward compatibility)
	const dateStrA = (a as Communication).dateISO || a.date;
	const dateStrB = (b as Communication).dateISO || b.date;

	// Handle potential missing dates, placing items without dates at the end
	const parsedA = dateStrA ? Date.parse(dateStrA) : Number.NaN;
	const parsedB = dateStrB ? Date.parse(dateStrB) : Number.NaN;
	const dateA = Number.isFinite(parsedA) ? parsedA : 0;
	const dateB = Number.isFinite(parsedB) ? parsedB : 0;

	if (dateA === 0 && dateB === 0) return 0; // Both dates missing, keep original order
	if (dateA === 0) return 1; // Put items without date A after B
	if (dateB === 0) return -1; // Put items without date B after A

	return dateB - dateA; // Descending order for dates
}

/**
 * Sorts items by date (newest first), title (A–Z) or citations (most cited
 * first, ties in date order, so the uncited majority still reads as a dated
 * list rather than in whatever order the dataset happened to load).
 * @returns A new sorted array; the input is never mutated.
 */
export function sortItems<T extends SortableItem>(items: T[], sortBy: SortKey): T[] {
	const sortedItems = [...items];
	if (sortBy === 'title') {
		sortedItems.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
	} else if (sortBy === 'citations') {
		sortedItems.sort((a, b) => citationCount(b) - citationCount(a) || compareByDate(a, b));
	} else {
		sortedItems.sort(compareByDate);
	}
	return sortedItems;
}
