import type { Publication } from '$lib/types';
import type { ProfessionalAffiliation } from '$lib/data/affiliations/template';

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
		case 'blogpost':
			return 'Blog Posts';
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
		'blogpost'
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
