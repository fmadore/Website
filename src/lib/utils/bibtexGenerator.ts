import type { Publication } from '$lib/types';

// Helper function to format authors for BibTeX
function formatAuthors(authors: string[] | undefined): string {
	if (!authors || authors.length === 0) return '';
	return authors.map(escapeBibtex).join(' and ');
}

// Helper function to format page ranges for BibTeX
function formatPageRange(pages: string): string {
	// Replace various dash types with BibTeX double dash
	return pages
		.replace(/[-–—]/g, '--') // Replace hyphen, en-dash, em-dash with double hyphen
		.replace(/\s*--\s*/g, '--'); // Remove spaces around double dashes
}

// Helper function to escape special BibTeX characters
function escapeBibtex(text: string | undefined): string {
	if (!text) return '';
	return text
		.replace(/\\/g, '\\\\') // Must escape backslashes first
		.replace(/\{/g, '\\{')
		.replace(/\}/g, '\\}')
		.replace(/%/g, '\\%')
		.replace(/\$/g, '\\$')
		.replace(/&/g, '\\&')
		.replace(/#/g, '\\#')
		.replace(/_/g, '\\_')
		.replace(/\^/g, '\\^')
		.replace(/~/g, '\\~');
}

// Helper function to get BibTeX month string
function getBibtexMonth(dateISO: string | undefined): string | undefined {
	if (!dateISO) return undefined;
	const parts = dateISO.split('-');
	if (parts.length >= 2) {
		const monthNum = parseInt(parts[1], 10);
		if (monthNum >= 1 && monthNum <= 12) {
			return ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'][
				monthNum - 1
			];
		}
	}
	return undefined;
}

// Helper function to validate required fields for each BibTeX entry type
function validateRequiredFields(publication: Publication, bibtexType: string): string[] {
	const warnings: string[] = [];

	switch (bibtexType) {
		case 'article':
			if (!publication.authors || publication.authors.length === 0) warnings.push('author');
			if (!publication.title) warnings.push('title');
			if (!publication.journal) warnings.push('journal');
			if (!publication.dateISO && !publication.year) warnings.push('year');
			break;
		case 'book':
			if (!publication.authors || publication.authors.length === 0) {
				// For edited books, editors are in the authors field, so we need either authors or editors
				if (
					!publication.editors ||
					(Array.isArray(publication.editors) && publication.editors.length === 0) ||
					(typeof publication.editors === 'string' && !publication.editors.trim())
				) {
					warnings.push('author/editor');
				}
			}
			if (!publication.title) warnings.push('title');
			if (!publication.publisher) warnings.push('publisher');
			if (!publication.dateISO && !publication.year) warnings.push('year');
			break;
		case 'incollection':
			if (!publication.authors || publication.authors.length === 0) warnings.push('author');
			if (!publication.title) warnings.push('title');
			if (!publication.book) warnings.push('booktitle');
			if (!publication.publisher) warnings.push('publisher');
			if (!publication.dateISO && !publication.year) warnings.push('year');
			break;
		case 'inproceedings':
			if (!publication.authors || publication.authors.length === 0) warnings.push('author');
			if (!publication.title) warnings.push('title');
			if (!publication.book) warnings.push('booktitle');
			if (!publication.dateISO && !publication.year) warnings.push('year');
			break;
		case 'phdthesis':
		case 'mastersthesis':
			if (!publication.authors || publication.authors.length === 0) warnings.push('author');
			if (!publication.title) warnings.push('title');
			if (!publication.university) warnings.push('school');
			if (!publication.dateISO && !publication.year) warnings.push('year');
			break;
		case 'techreport':
			if (!publication.authors || publication.authors.length === 0) warnings.push('author');
			if (!publication.title) warnings.push('title');
			if (!publication.publisher && !publication.institution) warnings.push('institution');
			if (!publication.dateISO && !publication.year) warnings.push('year');
			break;
		case 'unpublished':
			if (!publication.authors || publication.authors.length === 0) warnings.push('author');
			if (!publication.title) warnings.push('title');
			// Note field is required but we auto-generate it, so no check needed
			break;
		// For misc, booklet, manual, proceedings - fewer required fields
		case 'booklet':
		case 'manual':
			if (!publication.title) warnings.push('title');
			break;
		case 'proceedings':
			if (!publication.title) warnings.push('title');
			if (!publication.dateISO && !publication.year) warnings.push('year');
			break;
	}

	return warnings;
}

export function generateBibtex(publication: Publication): string {
	const bibtexFields: string[] = [];
	const id = publication.id;
	let bibtexType = 'misc'; // Default type

	// Determine BibTeX entry type based on publication type
	if (publication.type === 'book' && publication.isEditedVolume) {
		bibtexType = 'book'; // Edited volumes are still books in BibTeX
	} else {
		switch (publication.type) {
			case 'article':
				bibtexType = 'article';
				break;
			case 'book': // This is now for non-edited books
				bibtexType = 'book';
				break;
			case 'chapter':
				bibtexType = 'incollection';
				break;
			case 'phd-dissertation':
				bibtexType = 'phdthesis';
				break;
			case 'masters-thesis':
				bibtexType = 'mastersthesis';
				break;
			case 'report':
				bibtexType = 'techreport';
				break;
			case 'special-issue': // if it's an edited work, might be 'proceedings' or 'book'
				bibtexType = publication.isEditedWork ? 'book' : 'article'; // Use 'book' for edited special issues
				break;
			case 'encyclopedia': // No direct BibTeX, treat as 'incollection' or 'misc'
			case 'blogpost':
				bibtexType = 'misc';
				break;
			default:
				bibtexType = 'misc';
		}
	}

	// Validate required fields and add warnings as comments
	const missingFields = validateRequiredFields(publication, bibtexType);
	let warningComment = '';
	if (missingFields.length > 0) {
		warningComment = `% WARNING: Missing required fields for ${bibtexType}: ${missingFields.join(', ')}\n`;
	}

	// Common fields
	if (publication.title) bibtexFields.push(`  title = {${escapeBibtex(publication.title)}}`);

	// Authors / Editors based on type
	if (bibtexType === 'book' && (publication.isEditedVolume || publication.isEditedWork)) {
		// For edited volumes/works, the main authors are actually editors
		if (publication.authors && publication.authors.length > 0) {
			// These are editors for an edited work
			bibtexFields.push(`  editor = {${formatAuthors(publication.authors)}}`);
		} else if (typeof publication.editors === 'string' && publication.editors) {
			bibtexFields.push(`  editor = {${escapeBibtex(publication.editors)}}`);
		} else if (Array.isArray(publication.editors) && publication.editors.length > 0) {
			bibtexFields.push(`  editor = {${formatAuthors(publication.editors)}}`);
		}
	} else if (publication.authors && publication.authors.length > 0) {
		// Ensure authors array is not empty
		bibtexFields.push(`  author = {${formatAuthors(publication.authors)}}`);
	}

	if (publication.dateISO) {
		const yearPart = publication.dateISO.split('-')[0];
		if (yearPart) bibtexFields.push(`  year = {${escapeBibtex(yearPart)}}`);

		const monthName = getBibtexMonth(publication.dateISO);
		if (monthName) bibtexFields.push(`  month = ${monthName}`); // Unquoted month abbreviation
	} else if (publication.year) {
		bibtexFields.push(`  year = {${publication.year}}`);
	}

	if (publication.abstract)
		bibtexFields.push(`  abstract = {${escapeBibtex(publication.abstract)}}`);
	if (publication.doi) bibtexFields.push(`  doi = {${escapeBibtex(publication.doi)}}`);
	if (publication.url) bibtexFields.push(`  url = {${escapeBibtex(publication.url)}}`);
	if (publication.language)
		bibtexFields.push(`  language = {${escapeBibtex(publication.language)}}`);

	const notes: string[] = [];
	if (publication.prefacedBy) {
		notes.push(`Prefaced by ${escapeBibtex(publication.prefacedBy)}.`);
	}
	// Add other generic notes if necessary in the future by pushing to this array

	// Type-specific fields
	switch (bibtexType) {
		case 'article':
			if (publication.journal)
				bibtexFields.push(`  journal = {${escapeBibtex(publication.journal)}}`);
			if (publication.volume) bibtexFields.push(`  volume = {${escapeBibtex(publication.volume)}}`);
			if (publication.issue) bibtexFields.push(`  number = {${escapeBibtex(publication.issue)}}`);
			if (publication.pages)
				bibtexFields.push(`  pages = {${escapeBibtex(formatPageRange(publication.pages))}}`);
			if (publication.issn)
				bibtexFields.push(`  issn = {${escapeBibtex(publication.issn)}}`);
			break;
		case 'book': // For both regular books and edited volumes
			if (publication.publisher)
				bibtexFields.push(`  publisher = {${escapeBibtex(publication.publisher)}}`);
			if (publication.placeOfPublication)
				bibtexFields.push(`  address = {${escapeBibtex(publication.placeOfPublication)}}`);
			if (publication.isbn) bibtexFields.push(`  isbn = {${escapeBibtex(publication.isbn)}}`);
			if (publication.series) bibtexFields.push(`  series = {${escapeBibtex(publication.series)}}`);
			if (publication.pageCount && publication.pageCount > 0)
				bibtexFields.push(`  pages = {${publication.pageCount}}`);
			break;
		case 'incollection': // Chapters
			if (publication.book) bibtexFields.push(`  booktitle = {${escapeBibtex(publication.book)}}`);
			if (publication.publisher)
				bibtexFields.push(`  publisher = {${escapeBibtex(publication.publisher)}}`);
			if (publication.placeOfPublication)
				bibtexFields.push(`  address = {${escapeBibtex(publication.placeOfPublication)}}`);
			if (publication.pages)
				bibtexFields.push(`  pages = {${escapeBibtex(formatPageRange(publication.pages))}}`);

			if (typeof publication.editors === 'string' && publication.editors) {
				// Split string by comma or 'and', then format correctly
				const editorArray = publication.editors
					.split(/,\s*|\s+and\s+/)
					.map((name) => name.trim())
					.filter((name) => name);
				if (editorArray.length > 0) {
					bibtexFields.push(`  editor = {${formatAuthors(editorArray)}}`);
				}
			} else if (Array.isArray(publication.editors) && publication.editors.length > 0) {
				bibtexFields.push(`  editor = {${formatAuthors(publication.editors)}}`);
			}

			if (publication.series) bibtexFields.push(`  series = {${escapeBibtex(publication.series)}}`);
			if (publication.volume) bibtexFields.push(`  volume = {${escapeBibtex(publication.volume)}}`); // Volume of the book
			if (publication.isbn) bibtexFields.push(`  isbn = {${escapeBibtex(publication.isbn)}}`); // ISBN of the book
			break;
		case 'phdthesis':
		case 'mastersthesis':
			if (publication.university)
				bibtexFields.push(`  school = {${escapeBibtex(publication.university)}}`);
			if (publication.placeOfPublication)
				bibtexFields.push(`  address = {${escapeBibtex(publication.placeOfPublication)}}`); // University's address
			if (publication.advisors && publication.advisors.length > 0) {
				notes.push(`Advisors: ${formatAuthors(publication.advisors)}.`);
			}
			break;
		case 'techreport':
			if (publication.institution || publication.publisher)
				bibtexFields.push(
					`  institution = {${escapeBibtex(publication.institution || publication.publisher)}}`
				);
			if (publication.reportNumber)
				bibtexFields.push(`  number = {${escapeBibtex(publication.reportNumber)}}`);
			if (publication.placeOfPublication)
				bibtexFields.push(`  address = {${escapeBibtex(publication.placeOfPublication)}}`);
			break;
	}

	if (publication.tags && publication.tags.length > 0)
		bibtexFields.push(`  keywords = {${publication.tags.map(escapeBibtex).join(', ')}}`);

	if (notes.length > 0) {
		bibtexFields.push(`  note = {${notes.join(' ')}}`);
	}

	const fieldsString = bibtexFields.join(',\n  ');

	return `${warningComment}@${bibtexType}{${id},\n  ${fieldsString}\n}`;
}
