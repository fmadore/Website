import type { Publication } from '$lib/types/publication';
import { formatDisplayDate, isForthcoming } from '$lib/utils/date-formatter';
import { PUBLICATION_TYPE_CITATION_LABELS } from '$lib/utils/typeUtils';

// Human-readable labels for publication types (citation register).
// Re-exported from the single type-label registry in typeUtils.
export const typeLabels = PUBLICATION_TYPE_CITATION_LABELS;

// Helper function to handle authors that might be string or array
export function getAuthorsArray(authors: string[] | string | undefined): string[] {
	if (!authors) return [];
	if (typeof authors === 'string') return authors.split(' and ');
	return authors;
}

// Join names citation-style: ", " between entries, " and " before the last.
function joinNames(names: string[]): string {
	if (names.length === 0) return '';
	if (names.length === 1) return names[0];
	return `${names.slice(0, -1).join(', ')} and ${names[names.length - 1]}`;
}

// New function to format author list
export function formatAuthorList(authorsInput: string[] | string | undefined): string {
	return joinNames(getAuthorsArray(authorsInput));
}

// Helper function to format editor string (e.g., "Name1, Name2 and Name3")
function formatEditors(editors: string | undefined): string {
	if (!editors) return '';
	// Replace " and " with ", " then split by comma, trim, and filter empty
	const editorsArray = editors
		.replace(/\s+and\s+/g, ', ')
		.split(',')
		.map((name) => name.trim())
		.filter(Boolean);
	return joinNames(editorsArray);
}

// "Place: Publisher" imprint block shared by book/chapter/encyclopedia/
// conference-proceedings citations. Either half may be absent.
function formatImprint(publication: Pick<Publication, 'placeOfPublication' | 'publisher'>): string {
	let imprint = '';
	if (publication.placeOfPublication) {
		imprint += publication.placeOfPublication;
		if (publication.publisher) imprint += ':';
	}
	if (publication.placeOfPublication && publication.publisher) imprint += ' ';
	if (publication.publisher) imprint += publication.publisher;
	return imprint;
}

// Ensure a non-empty details string closes with a period.
function withFinalPeriod(details: string): string {
	if (details.trim() && !details.trim().endsWith('.')) {
		return details + '.';
	}
	return details;
}

// Define the structure for the formatted citation output
export interface FormattedCitation {
	typeLabel: string;
	// authorHtml: string; // We'll handle authors separately in the component for now due to interactivity
	detailsHtml: string;
	year?: number | string; // Include year separately if useful
}

// Main formatting function (to be implemented)
export function formatCitation(publication: Publication): FormattedCitation {
	const type = publication.type;
	const typeLabel = typeLabels[type] || type;
	let detailsHtml = '';
	let year: number | string | undefined = publication.year; // Explicitly type 'year' to allow undefined

	// --- Logic to build detailsHtml based on type ---
	// (This will consolidate logic from PublicationItem's metadata block and template)

	if (type === 'book') {
		let details = formatImprint(publication);
		if (details) details += '.'; // Add period if details exist
		detailsHtml = details;
		year = publication.year;
	} else if (type === 'chapter') {
		let details = 'In ';
		let hasBookInfo = false;
		if (publication.book) {
			details += `<em>${publication.book}</em>`;
			hasBookInfo = true;
		}
		if (publication.editors) {
			if (hasBookInfo) details += ', ';
			// Use the helper function
			const editorsFormatted = formatEditors(publication.editors);
			if (editorsFormatted) {
				details += `ed. ${editorsFormatted}`;
				hasBookInfo = true;
			}
		}
		if (publication.pages) {
			if (hasBookInfo) details += ', ';
			details += `${publication.pages}`;
			hasBookInfo = true;
		}
		if (hasBookInfo) details += '. '; // Separator after main book/editor/page info

		// Append the "place: publisher" imprint and close with a period
		details += formatImprint(publication);
		detailsHtml = withFinalPeriod(details);
		year = publication.year;
	} else if (type === 'article' || type === 'bulletin-article') {
		let details = '';
		if (publication.journal) details += `<em>${publication.journal}</em>`;
		if (publication.volume) details += ` ${publication.volume}`; // Space before volume
		if (publication.issue) details += ` (${publication.issue})`;
		if (publication.pages) details += `: ${publication.pages}`; // Colon before pages
		detailsHtml = withFinalPeriod(details);
		year = publication.year;
	} else if (type === 'encyclopedia') {
		let details = `In <em>${publication.encyclopediaTitle || ''}</em>`;
		if (publication.editors) {
			// Use the helper function
			const editorsFormatted = formatEditors(publication.editors);
			if (editorsFormatted) {
				details += `, ed. ${editorsFormatted}`;
			}
		}
		if (publication.pages) {
			// Remove "pp." prefix and add comma separator
			details += `, ${publication.pages}`;
		}
		details += '. '; // Separator after title/editors/pages info

		// Append the "place: publisher" imprint and close with a period
		details += formatImprint(publication);
		detailsHtml = withFinalPeriod(details);
		year = publication.year;
	} else if (type === 'phd-dissertation' || type === 'masters-thesis') {
		let details = typeLabel; // Use the already determined typeLabel
		if (publication.department) details += `, ${publication.department}`;
		if (publication.university) details += `, ${publication.university}`;
		detailsHtml = withFinalPeriod(details);
		year = publication.year;
	} else if (type === 'blogpost') {
		let details = '';
		// Date (in parentheses) first, then comma, then italicized publisher
		const formattedDate = publication.dateISO ? formatDisplayDate(publication.dateISO) : '';
		if (formattedDate) {
			details += `(${formattedDate})`; // Add parentheses around the date
		}
		if (publication.publisher) {
			if (details) details += ', '; // Add comma separator if date exists
			details += `<em>${publication.publisher}</em>`;
		}

		detailsHtml = withFinalPeriod(details);
		year = undefined; // Year is included in the full date
	} else if (type === 'report') {
		// Format similar to article: *Publisher* Volume(Issue): Pages.
		let details = '';
		if (publication.publisher) details += `<em>${publication.publisher}</em>`;
		if (publication.volume) details += ` ${publication.volume}`; // Space before volume
		if (publication.issue) details += ` (${publication.issue})`; // Issue in parentheses
		if (publication.pages) details += `: ${publication.pages}`; // Colon before pages

		detailsHtml = withFinalPeriod(details);
		year = publication.year;
	} else if (type === 'special-issue') {
		// Format: *Journal Name* Volume(Issue).
		let details = '';
		if (publication.journal) details += `<em>${publication.journal}</em>`;
		if (publication.volume) details += ` ${publication.volume}`; // Space before volume
		if (publication.issue) details += ` (${publication.issue})`; // Issue in parentheses

		detailsHtml = withFinalPeriod(details);
		year = publication.year;
	} else if (type === 'conference-proceedings') {
		// Format: In *Proceedings Title*
		let details = '';
		if (publication.proceedingsTitle) {
			details += `In <em>${publication.proceedingsTitle}</em>`;
		}
		if (publication.editors) {
			// Use the helper function
			const editorsFormatted = formatEditors(publication.editors);
			if (editorsFormatted) {
				details += `, ed. ${editorsFormatted}`;
			}
		}
		if (publication.pages) {
			details += `, ${publication.pages}`;
		}
		details += '. '; // Separator after proceedings info

		// Append the "place: publisher" imprint and close with a period
		details += formatImprint(publication);
		detailsHtml = withFinalPeriod(details);
		year = publication.year;
	}

	// If the publication is forthcoming, surface that label in place of the year
	// so list views read "(Forthcoming)." rather than "(2026)." for unpublished work.
	if (typeof publication.date === 'string' && isForthcoming(publication)) {
		year = publication.date.trim();
	}

	return {
		typeLabel,
		detailsHtml,
		year // Return the year separately (will be undefined for blogpost)
	};
}

// Communication citation formatter
export function formatCommunicationCitation(communication: {
	title: string;
	conference?: string;
	episode?: string | number;
	location?: string;
	country?: string;
	date?: string;
}): string {
	const parts: string[] = [];

	// Only include conference name if it's different from the title
	if (communication.conference && communication.conference !== communication.title) {
		let conf = communication.conference;
		if (communication.episode) {
			conf += `, ep. ${communication.episode}`;
		}
		parts.push(conf);
	}

	// Add location if present
	if (communication.location) {
		parts.push(communication.location);
	}

	// Add country if present
	if (communication.country) {
		parts.push(communication.country);
	}

	// Add date if present
	if (communication.date) {
		parts.push(communication.date);
	}

	return parts.join(', ');
}
