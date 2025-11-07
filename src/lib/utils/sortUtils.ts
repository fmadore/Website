import type { Publication } from '$lib/types/publication';
import type { Communication } from '$lib/types/communication';

// Generic type for items that can be sorted (must have date and title)
// Use union type for items we know we'll sort
type SortableItem = Publication | Communication;

/**
 * Sorts an array of items either by date (descending) or title (ascending).
 * @param items The array of items to sort.
 * @param sortBy The criteria to sort by ('date' or 'title').
 * @returns A new sorted array.
 */
export function sortItems<T extends SortableItem>(
	items: T[],
	sortBy: 'date' | 'title' | 'citations'
): T[] {
	const sortedItems = [...items]; // Create a shallow copy to avoid mutating the original array

	if (sortBy === 'title') {
		sortedItems.sort((a, b) => {
			// Ensure titles exist and handle potential undefined values
			const titleA = a.title || '';
			const titleB = b.title || '';
			return titleA.localeCompare(titleB);
		});
	} else if (sortBy === 'citations') {
		sortedItems.sort((a, b) => {
			// Safely access citedBy length, defaulting to 0 if undefined
			const citationsA = (a as Publication).citedBy?.length || 0;
			const citationsB = (b as Publication).citedBy?.length || 0;
			return citationsB - citationsA; // Descending order
		});
	} else {
		// Default to sorting by date (descending)
		sortedItems.sort((a, b) => {
			// Use dateISO for proper sorting (handles date ranges by using the first date)
			// Fall back to date field if dateISO is not available (for backward compatibility)
			const dateStrA = (a as Communication).dateISO || a.date;
			const dateStrB = (b as Communication).dateISO || b.date;

			// Handle potential missing dates, placing items without dates at the end
			const dateA = dateStrA ? new Date(dateStrA).getTime() : 0;
			const dateB = dateStrB ? new Date(dateStrB).getTime() : 0;

			if (dateA === 0 && dateB === 0) return 0; // Both dates missing, keep original order
			if (dateA === 0) return 1; // Put items without date A after B
			if (dateB === 0) return -1; // Put items without date B after A

			return dateB - dateA; // Descending order for dates
		});
	}

	return sortedItems;
}
