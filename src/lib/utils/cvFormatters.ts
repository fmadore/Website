import type { Publication } from '$lib/types';
import type { AffiliationPeriod } from '$lib/types/affiliation';
import { author as siteAuthor } from '$lib/data/siteConfig';
import { joinNames, splitNames } from '$lib/utils/nameUtils';

/**
 * Returns the year label to show in the CV gutter. Forthcoming publications
 * surface "Forthcoming" instead of the projected year so unpublished work
 * isn't misread as already in print.
 */
export function getCVDisplayYear(pub: Pick<Publication, 'date' | 'year'>): string | number {
	const d = pub.date?.trim().toLowerCase();
	if (d === 'forthcoming' || d === 'à paraître' || d === 'a paraitre') {
		return pub.date!.trim();
	}
	return pub.year;
}

/**
 * Formats author list with the site owner in bold for CV display
 * Returns empty string if the site owner is the only author
 * Only bolds the name when there are multiple authors
 */
export function formatCVAuthorList(authorsInput: string[] | string | undefined): string {
	if (!authorsInput) return '';

	const authorsArray = Array.isArray(authorsInput)
		? authorsInput
		: typeof authorsInput === 'string'
			? authorsInput.split(' and ')
			: [];

	const numAuthors = authorsArray.length;
	if (numAuthors === 0) return '';

	// If the site owner is the only author, return empty string
	if (numAuthors === 1) {
		return authorsArray[0] === siteAuthor.name ? '' : authorsArray[0];
	}

	// Multiple authors - bold the site owner's name, join CV-style
	// (", " between entries, " and " before the last, no serial comma).
	return joinNames(
		authorsArray.map((author) =>
			author === siteAuthor.name ? `<strong>${siteAuthor.name}</strong>` : author
		)
	);
}

/**
 * Formats editor list with proper formatting for CV display
 * Adds ", and" (serial comma) before the last of three or more editors
 */
export function formatEditorList(editorsInput: string | undefined): string {
	if (!editorsInput) return '';
	return joinNames(splitNames(editorsInput), { serialComma: true });
}

/**
 * Formats volume and issue information for journal articles
 */
export function formatVolumeIssueDisplay(
	volume?: string | number,
	issue?: string | number
): string {
	let display = '';
	if (volume) {
		display += ` ${volume}`;
	}
	if (issue) {
		display += ` (${issue})`;
	}
	return display;
}

/**
 * Formats a full date from ISO format (YYYY-MM-DD or YYYY-MM) for CV display
 * Returns format like "15 April" or "April" if no day is available
 */
export function formatBlogDate(dateISO?: string): string {
	if (!dateISO) return '';

	const months = [
		'January',
		'February',
		'March',
		'April',
		'May',
		'June',
		'July',
		'August',
		'September',
		'October',
		'November',
		'December'
	];

	const parts = dateISO.split('-');
	if (parts.length >= 2) {
		const monthIndex = parseInt(parts[1], 10) - 1;
		const month = months[monthIndex] || '';

		if (parts.length >= 3) {
			// Has day
			const day = parseInt(parts[2], 10);
			return `${day} ${month}`;
		}
		// Month only
		return month;
	}

	return '';
}

/**
 * Formats a year range for compact CV display.
 * Handles both numeric pairs and string ranges.
 *
 * Examples:
 *   formatCVYearRange(2013, 2015)  → "2013-15"
 *   formatCVYearRange(2023)        → "2023"
 *   formatCVYearRange(2024, null)  → "2024-"   (ongoing)
 *   formatCVYearRange("2018-2023") → "2018-23"
 *   formatCVYearRange("2023-")     → "2023-"   (ongoing)
 *   formatCVYearRange("2023")      → "2023"
 */
export function formatCVYearRange(startYear: number, endYear?: number | null): string;
export function formatCVYearRange(yearString: string): string;
export function formatCVYearRange(startOrString: number | string, endYear?: number | null): string {
	if (typeof startOrString === 'string') {
		if (!startOrString.includes('-')) return startOrString;
		const [start, end] = startOrString.split('-');
		if (!end || end === '') return `${start}-`;
		return formatCVYearRange(parseInt(start), parseInt(end));
	}

	const startYear = startOrString;
	if (endYear === null) return `${startYear}-`;
	if (!endYear || endYear === startYear) return startYear.toString();

	const startCentury = Math.floor(startYear / 100);
	const endCentury = Math.floor(endYear / 100);
	if (startCentury === endCentury) {
		return `${startYear}-${endYear.toString().slice(-2)}`;
	}
	return `${startYear}-${endYear}`;
}

/**
 * Formats an affiliation period ({ start, end } where null = ongoing)
 */
export function formatAffiliationPeriod(period: AffiliationPeriod): string {
	if (period.end === null) {
		return `${period.start}–Present`;
	}
	if (period.start === period.end) {
		return period.start.toString();
	}
	return `${period.start}–${period.end}`;
}

/**
 * Groups publications by type and returns them in a structured format
 */
export function groupPublicationsByType(publications: Publication[]) {
	// Filter out theses
	const filteredPublications = publications.filter(
		(pub) => pub.type !== 'phd-dissertation' && pub.type !== 'masters-thesis'
	);

	// Define the desired order of publication types
	const publicationTypeOrder: Publication['type'][] = [
		'book',
		'special-issue',
		'article',
		'chapter',
		'report',
		'encyclopedia',
		'bulletin-article',
		'blogpost',
		'conference-proceedings'
	];

	// Group publications by type
	const publicationsByType = filteredPublications.reduce(
		(acc, pub) => {
			const type = pub.type || 'other';
			if (!acc[type]) {
				acc[type] = [];
			}
			acc[type].push(pub);
			return acc;
		},
		{} as Record<Publication['type'] | 'other', Publication[]>
	);

	// Get types present in the data that are also in our desired order
	const presentPublicationTypes = publicationTypeOrder.filter(
		(type) => publicationsByType[type]?.length > 0
	);

	// Get any remaining types not in the main order
	const otherPublicationTypes = Object.keys(publicationsByType).filter(
		(type) =>
			!publicationTypeOrder.includes(type as Publication['type']) &&
			publicationsByType[type as Publication['type']].length > 0
	);

	return {
		publicationsByType,
		presentPublicationTypes,
		otherPublicationTypes
	};
}
