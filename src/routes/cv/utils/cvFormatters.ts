import type { Publication } from '$lib/types';
import type { ProfessionalAffiliation } from '$lib/data/affiliations/template';

/**
 * Formats author list with Frédérick Madore in bold for CV display
 * Returns empty string if Frédérick Madore is the only author
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
	
	// If only one author and it's Frédérick Madore, return empty string
	if (numAuthors === 1) {
		return authorsArray[0] === 'Frédérick Madore' ? '' : authorsArray[0];
	}

	// Multiple authors - bold Frédérick Madore's name
	let formatted = '';
	authorsArray.forEach((author, i) => {
		const authorName = author === 'Frédérick Madore' 
			? '<strong>Frédérick Madore</strong>' 
			: author;
		
		formatted += authorName;
		if (i < numAuthors - 1) {
			formatted += i === numAuthors - 2 ? ' and ' : ', ';
		}
	});
	return formatted;
}

/**
 * Formats editor list with proper formatting for CV display
 * Adds "and" before the last editor
 */
export function formatEditorList(editorsInput: string | undefined): string {
	if (!editorsInput) return '';
	
	// Split by common separators
	const editors = editorsInput.split(/,\s*|\s+and\s+/);
	
	if (editors.length === 0) return '';
	if (editors.length === 1) return editors[0];
	if (editors.length === 2) return `${editors[0]} and ${editors[1]}`;
	
	// Three or more editors
	const lastEditor = editors[editors.length - 1];
	const otherEditors = editors.slice(0, -1).join(', ');
	return `${otherEditors}, and ${lastEditor}`;
}

/**
 * Formats a publication type into a human-readable display name
 */
export function getPublicationTypeDisplayName(type: Publication['type']): string {
	switch (type) {
		case 'book':
			return 'Books';
		case 'special-issue':
			return 'Guest Edited Journals';
		case 'article':
			return 'Journal Articles';
		case 'chapter':
			return 'Book Chapters';
		case 'report':
			return 'Report';
		case 'encyclopedia':
			return 'Encyclopedia Entry';
		case 'bulletin-article':
			return 'Bulletin Articles';
		case 'blogpost':
			return 'Blog Posts';
		case 'conference-proceedings':
			return 'Conference Proceedings';
		default:
			return 'Other Publications';
	}
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
		'January', 'February', 'March', 'April', 'May', 'June',
		'July', 'August', 'September', 'October', 'November', 'December'
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
 * Formats an affiliation period (either YearRange or StartEnd format)
 */
export function formatAffiliationPeriod(period: ProfessionalAffiliation['period']): string {
	if ('min' in period) {
		// It's a YearRange
		if (period.min === period.max) {
			return period.min.toString();
		}
		return `${period.min}–${period.max}`;
	} else {
		// It's { start: number; end: 'present' | number }
		if (typeof period.end === 'number' && period.start === period.end) {
			return period.start.toString();
		}
		return `${period.start}–${period.end}`;
	}
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
