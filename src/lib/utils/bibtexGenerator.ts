import type { Publication } from '$lib/types';

// Helper function to format authors for BibTeX
function formatAuthors(authors: string[] | undefined): string {
	if (!authors || authors.length === 0) return '';
	return authors.map(escapeBibtex).join(' and ');
}

// Helper function to escape special BibTeX characters
function escapeBibtex(text: string | undefined): string {
	if (!text) return '';
	return text
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

export function generateBibtex(publication: Publication): string {
	const bibtexFields: string[] = [];
	const id = publication.id;
	let bibtexType = 'misc'; // Default type

	// Determine BibTeX entry type based on publication type
	if (publication.type === 'book' && publication.isEditedVolume) {
		bibtexType = 'collection';
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
			case 'special-issue': // if it's an edited work, might be 'proceedings' or 'collection'
				bibtexType = publication.isEditedWork ? 'collection' : 'article'; // Assuming articles within a special issue
				break;
			case 'encyclopedia': // No direct BibTeX, treat as 'incollection' or 'misc'
			case 'blogpost':
				bibtexType = 'misc';
				break;
			default:
				bibtexType = 'misc';
		}
	}

	// Common fields
	if (publication.title) bibtexFields.push(`  title = {${escapeBibtex(publication.title)}}`);

	// Authors / Editors based on type
	if (bibtexType === 'collection') {
		if (publication.authors && publication.authors.length > 0) {
			// These are editors for a collection
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
		if (monthName) bibtexFields.push(`  month = {${monthName}}`);
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
				bibtexFields.push(`  pages = {${escapeBibtex(publication.pages.replace('-', '--'))}}`);
			if ((publication as any).issn)
				bibtexFields.push(`  issn = {${escapeBibtex((publication as any).issn)}}`);
			break;
		case 'book': // For non-edited books
			if (publication.publisher)
				bibtexFields.push(`  publisher = {${escapeBibtex(publication.publisher)}}`);
			if (publication.placeOfPublication)
				bibtexFields.push(`  address = {${escapeBibtex(publication.placeOfPublication)}}`);
			if (publication.isbn) bibtexFields.push(`  isbn = {${escapeBibtex(publication.isbn)}}`);
			if (publication.series) bibtexFields.push(`  series = {${escapeBibtex(publication.series)}}`);
			if (publication.pageCount && publication.pageCount > 0)
				bibtexFields.push(`  pages = {${publication.pageCount}}`);
			break;
		case 'collection': // For edited volumes (previously type 'book' with isEditedVolume=true)
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
				bibtexFields.push(`  pages = {${escapeBibtex(publication.pages.replace('-', '--'))}}`);

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
			if ((publication as any).institution || publication.publisher)
				bibtexFields.push(
					`  institution = {${escapeBibtex((publication as any).institution || publication.publisher)}}`
				);
			if ((publication as any).reportNumber)
				bibtexFields.push(`  number = {${escapeBibtex((publication as any).reportNumber)}}`);
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

	return `@${bibtexType}{${id},\n  ${fieldsString}\n}`;
}
