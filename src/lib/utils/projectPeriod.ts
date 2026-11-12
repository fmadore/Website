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
 * A project period in the display register: an en dash closed up between the
 * two years (DESIGN.md, the Punctuation Rule), or "Since <year>" for an
 * open-ended project.
 *
 * @example
 * formatProjectPeriod('2013-2018'); // '2013–2018'
 * formatProjectPeriod('2026-');     // 'Since 2026'
 * formatProjectPeriod('2020');      // '2020'
 */
export function formatProjectPeriod(years: string | undefined): string {
	if (!years) return '';
	const trimmed = years.trim();
	if (trimmed.endsWith('-')) return `Since ${trimmed.slice(0, -1)}`;
	return trimmed.replace(/\s*[-–]\s*/, '–');
}

/**
 * A project period as numbers, for a chart that draws it.
 *
 * `ongoing` is true for an open-ended record (`"2026-"`), whose end is then
 * the year passed as `currentYear` — the build year, so the prerendered plate
 * and the hydrated one agree (see `buildDate.ts`). An open-ended project that
 * starts after `currentYear` ends where it starts rather than before it.
 */
export interface ProjectPeriod {
	startYear: number;
	endYear: number;
	ongoing: boolean;
}

/**
 * Parse a research record's `years` string. Accepts a hyphen or an en dash,
 * with or without spaces; returns undefined for anything that does not start
 * with a four-digit year, or whose end precedes its start.
 *
 * @example
 * parseProjectPeriod('2013-2018', 2026); // { startYear: 2013, endYear: 2018, ongoing: false }
 * parseProjectPeriod('2025-', 2026);     // { startYear: 2025, endYear: 2026, ongoing: true }
 * parseProjectPeriod('2020', 2026);      // { startYear: 2020, endYear: 2020, ongoing: false }
 */
export function parseProjectPeriod(
	years: string | undefined,
	currentYear: number
): ProjectPeriod | undefined {
	const match = /^\s*(\d{4})\s*(?:([-–])\s*(\d{4})?)?\s*$/.exec(years ?? '');
	if (!match) return undefined;
	const startYear = Number(match[1]);
	if (match[3]) {
		const endYear = Number(match[3]);
		return endYear < startYear ? undefined : { startYear, endYear, ongoing: false };
	}
	if (match[2]) return { startYear, endYear: Math.max(startYear, currentYear), ongoing: true };
	return { startYear, endYear: startYear, ongoing: false };
}
