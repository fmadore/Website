/**
 * How a research project's `years` string is printed.
 *
 * The records hold the period in its machine form — `"2013-2018"`, or
 * `"2026-"` for work with no end date yet — because that is what sorts and
 * what `/api/research.json` should carry. Two surfaces print it: the research
 * index and the project masthead. They had drifted apart, the index formatting
 * the string and the project page printing it raw, so the same project read as
 * "Since 2026" in the list and "2026-" on its own page, with the hyphen left
 * dangling. One function now answers for both.
 */

/**
 * A project period in the display register: an en dash between the two years,
 * or "Since <year>" for an open-ended project.
 *
 * @example
 * formatProjectPeriod('2013-2018'); // '2013 – 2018'
 * formatProjectPeriod('2026-');     // 'Since 2026'
 * formatProjectPeriod('2020');      // '2020'
 */
export function formatProjectPeriod(years: string | undefined): string {
	if (!years) return '';
	const trimmed = years.trim();
	if (trimmed.endsWith('-')) return `Since ${trimmed.slice(0, -1)}`;
	return trimmed.replace('-', ' – ');
}

/**
 * Whether a period is open-ended — the record says the work is still running
 * without naming an end year. The formatted string already says so ("Since
 * 2026"), which is why the index appends "Ongoing" only to the closed spans of
 * projects still marked current.
 */
export function isOpenEndedPeriod(years: string | undefined): boolean {
	return Boolean(years?.trim().endsWith('-'));
}
