/**
 * Formats an ISO date string (YYYY-MM-DD) to a display format (e.g., "21 March 2025")
 * @param isoDate Date string in ISO format (YYYY-MM-DD)
 * @returns Formatted date string for display
 */
export function formatDisplayDate(isoDate: string): string {
	if (!isoDate || !isoDate.match(/^\d{4}-\d{2}-\d{2}$/)) {
		return isoDate; // Return as is if not in ISO format
	}

	const date = new Date(isoDate);

	// Format the date as "DD Month YYYY"
	return date.toLocaleDateString('en-GB', {
		day: 'numeric',
		month: 'long',
		year: 'numeric'
	});
}

/**
 * Formats an ISO date string (YYYY-MM-DD) as day + month only (e.g. "21 March").
 * The CV sections use this where the year is already carried by the entry.
 * @param isoDate Date string in ISO format (YYYY-MM-DD)
 * @returns Formatted day-month string, or the input unchanged if not ISO
 */
export function formatDayMonth(isoDate: string): string {
	if (!isoDate || !isoDate.match(/^\d{4}-\d{2}-\d{2}$/)) {
		return isoDate; // Return as is if not in ISO format
	}

	return new Date(isoDate).toLocaleDateString('en-GB', {
		day: 'numeric',
		month: 'long'
	});
}

/**
 * Formats an ISO date string (YYYY-MM-DD) in the mono/data voice
 * (e.g. "3 JUN 2025") for datelines and "updated" labels.
 * @param isoDate Date string in ISO format (YYYY-MM-DD)
 * @returns Uppercase short-month date string, or '' if not ISO
 */
export function formatShortDateMono(isoDate: string): string {
	if (!isoDate || !isoDate.match(/^\d{4}-\d{2}-\d{2}$/)) {
		return '';
	}

	// Pure string mapping — no Date construction, so the result can't shift a
	// day across timezones when computed in the browser.
	const MONTHS_MONO = [
		'JAN',
		'FEB',
		'MAR',
		'APR',
		'MAY',
		'JUN',
		'JUL',
		'AUG',
		'SEP',
		'OCT',
		'NOV',
		'DEC'
	] as const;
	const [y, m, d] = isoDate.split('-');
	return `${parseInt(d, 10)} ${MONTHS_MONO[parseInt(m, 10) - 1]} ${y}`;
}

/**
 * Extracts the year from an ISO date string
 * @param isoDate Date string in ISO format (YYYY-MM-DD)
 * @returns Year as number
 */
export function getYearFromISODate(isoDate: string): number {
	if (!isoDate || !isoDate.match(/^\d{4}-\d{2}-\d{2}$/)) {
		return new Date().getFullYear(); // Return current year as fallback
	}

	return parseInt(isoDate.split('-')[0], 10);
}

/**
 * Whether an item's `date` field marks it as not-yet-published.
 * Recognises the English and French (accented and unaccented) labels used
 * across the dataset. Such items are floated above dated entries when sorting.
 */
export function isForthcoming(item: { date?: string }): boolean {
	const d = item.date?.trim().toLowerCase();
	return d === 'forthcoming' || d === 'à paraître' || d === 'a paraitre';
}
