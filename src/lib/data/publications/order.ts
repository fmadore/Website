/**
 * The order every publication list prints: newest first, with forthcoming
 * works (dated "Forthcoming" or "À paraître") floated above everything
 * already out. Shared by the full index, the summaries and the CV view. Lives
 * here rather than in dataAggregation so that module stays free of
 * date-formatter for the pages that sort other records.
 */
import { isForthcoming } from '$lib/utils/date-formatter';
import { sortByDate } from '$lib/utils/dataAggregation';

export function sortPublicationsByDate<T extends { date?: string; dateISO?: string }>(
	items: T[]
): T[] {
	const sorted = sortByDate(items);
	return [...sorted.filter(isForthcoming), ...sorted.filter((item) => !isForthcoming(item))];
}
