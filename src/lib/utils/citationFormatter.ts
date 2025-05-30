import type { Publication } from '$lib/types/publication'; // Assuming this path

// Human-readable labels for publication types
export const typeLabels: { [key: string]: string } = {
	book: 'Book',
	article: 'Journal Article',
	chapter: 'Book Chapter',
	'special-issue': 'Special Issue',
	report: 'Report',
	encyclopedia: 'Encyclopedia Entry',
	blogpost: 'Blog Post',
	'phd-dissertation': 'Ph.D. Dissertation',
	'masters-thesis': "Master's Thesis"
};

// Helper function to handle authors that might be string or array
export function getAuthorsArray(authors: string[] | string | undefined): string[] {
	if (!authors) return [];
	if (typeof authors === 'string') return authors.split(' and ');
	return authors;
}

// New function to format author list
export function formatAuthorList(authorsInput: string[] | string | undefined): string {
	const authorsArray = getAuthorsArray(authorsInput);
	const numAuthors = authorsArray.length;
	if (numAuthors === 0) return '';
	if (numAuthors === 1) return authorsArray[0];

	let formatted = '';
	authorsArray.forEach((author, i) => {
		formatted += author;
		if (i < numAuthors - 1) {
			formatted += i === numAuthors - 2 ? ' and ' : ', ';
		}
	});
	return formatted;
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
	const numEditors = editorsArray.length;
	let formatted = '';
	editorsArray.forEach((editor, i) => {
		formatted += editor;
		if (i < numEditors - 1) {
			// Use " and " before the last editor, ", " otherwise
			formatted += i === numEditors - 2 ? ' and ' : ', ';
		}
	});
	return formatted;
}

// Define type for metadata items (kept for internal use within formatter)
type MetadataItem = { label: string; value: string | number | undefined | null };

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
		let details = '';
		if (publication.placeOfPublication) {
			details += publication.placeOfPublication;
			if (publication.publisher) details += ':';
		}
		if (publication.placeOfPublication && publication.publisher) details += ' ';
		if (publication.publisher) details += publication.publisher;
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

		// Build and append book publication info
		let bookPubInfo = '';
		if (publication.placeOfPublication) {
			bookPubInfo += publication.placeOfPublication;
			if (publication.publisher) bookPubInfo += ':';
		}
		if (publication.placeOfPublication && publication.publisher) bookPubInfo += ' ';
		if (publication.publisher) bookPubInfo += publication.publisher;

		// Append the publication info
		details += bookPubInfo;

		// Ensure final period after all details
		if (details.trim() && !details.trim().endsWith('.')) {
			details += '.';
		}
		detailsHtml = details;
		year = publication.year;
	} else if (type === 'article') {
		let details = '';
		if (publication.journal) details += `<em>${publication.journal}</em>`;
		if (publication.volume) details += ` ${publication.volume}`; // Space before volume
		if (publication.issue) details += ` (${publication.issue})`;
		if (publication.pages) details += `: ${publication.pages}`; // Colon before pages
		if (details.trim() && !details.trim().endsWith('.')) {
			details += '.'; // Ensure final period
		}
		detailsHtml = details;
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

		// Build and append publication info like chapters (place: publisher)
		let pubInfo = '';
		if (publication.placeOfPublication) {
			pubInfo += publication.placeOfPublication;
			if (publication.publisher) pubInfo += ':';
		}
		if (publication.placeOfPublication && publication.publisher) pubInfo += ' ';
		if (publication.publisher) pubInfo += publication.publisher;

		details += pubInfo; // Append the publication info

		// Ensure final period
		if (details.trim() && !details.trim().endsWith('.')) {
			details += '.';
		}
		detailsHtml = details;
		year = publication.year;
	} else if (type === 'phd-dissertation' || type === 'masters-thesis') {
		let details = typeLabel; // Use the already determined typeLabel
		if (publication.department) details += `, ${publication.department}`;
		if (publication.university) details += `, ${publication.university}`;
		if (details.trim() && !details.trim().endsWith('.')) {
			details += '.'; // Ensure final period
		}
		detailsHtml = details;
		year = publication.year;
	} else if (type === 'blogpost') {
		let details = '';
		// Date (in parentheses) first, then comma, then italicized publisher
		const formattedDate = formatFullDate(publication.dateISO);
		if (formattedDate) {
			details += `(${formattedDate})`; // Add parentheses around the date
		}
		if (publication.publisher) {
			if (details) details += ', '; // Add comma separator if date exists
			details += `<em>${publication.publisher}</em>`;
		}

		if (details.trim() && !details.trim().endsWith('.')) {
			details += '.'; // Ensure final period
		}
		detailsHtml = details;
		year = undefined; // Year is included in the full date
	} else if (type === 'report') {
		// Format similar to article: *Publisher* Volume(Issue): Pages.
		let details = '';
		if (publication.publisher) details += `<em>${publication.publisher}</em>`;
		if (publication.volume) details += ` ${publication.volume}`; // Space before volume
		if (publication.issue) details += ` (${publication.issue})`; // Issue in parentheses
		if (publication.pages) details += `: ${publication.pages}`; // Colon before pages

		// Ensure final period
		if (details.trim() && !details.trim().endsWith('.')) {
			details += '.';
		}
		detailsHtml = details;
		year = publication.year;
	} else if (type === 'special-issue') {
		// Format: *Journal Name* Volume(Issue).
		let details = '';
		if (publication.journal) details += `<em>${publication.journal}</em>`;
		if (publication.volume) details += ` ${publication.volume}`; // Space before volume
		if (publication.issue) details += ` (${publication.issue})`; // Issue in parentheses

		// Ensure final period
		if (details.trim() && !details.trim().endsWith('.')) {
			details += '.';
		}
		detailsHtml = details;
		year = publication.year;
	}

	return {
		typeLabel,
		detailsHtml,
		year // Return the year separately (will be undefined for blogpost)
	};
}

// Helper function to format YYYY-MM-DD date to D Month YYYY
function formatFullDate(isoDate: string | undefined): string {
	if (!isoDate) return '';
	try {
		const date = new Date(isoDate + 'T00:00:00Z'); // Assume UTC to avoid timezone issues
		if (isNaN(date.getTime())) return isoDate; // Return original if invalid

		// Use options for "D Month YYYY" format, trying 'en-GB' locale
		const options: Intl.DateTimeFormatOptions = {
			day: 'numeric',
			month: 'long',
			year: 'numeric',
			timeZone: 'UTC'
		};
		return date.toLocaleDateString('en-GB', options); // Use 'en-GB' for D Month YYYY format
	} catch (e) {
		console.error('Error formatting date:', e);
		return isoDate; // Return original on error
	}
}
