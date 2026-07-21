import { describe, it, expect } from 'vitest';
import { getAuthorsArray, formatAuthorList, formatCitation } from './citationFormatter';
import type { Publication } from '$lib/types/publication';

// Minimal fixture factory: supplies every required Publication field so tests
// only spell out the fields the formatter branch under test actually reads.
const pub = (over: Partial<Publication>): Publication => ({
	id: 'sample',
	type: 'book',
	title: 'Sample Title',
	authors: ['Frédérick Madore'],
	date: '2024',
	dateISO: '2024-01-01',
	year: 2024,
	language: 'English',
	...over
});

describe('getAuthorsArray', () => {
	it('returns an empty array for undefined', () => {
		expect(getAuthorsArray(undefined)).toEqual([]);
	});

	it('splits a string on " and "', () => {
		expect(getAuthorsArray('Jane Doe and John Smith')).toEqual(['Jane Doe', 'John Smith']);
	});

	it('wraps a single-name string without " and " as a one-element array', () => {
		expect(getAuthorsArray('Jane Doe')).toEqual(['Jane Doe']);
	});

	it('passes an array through unchanged', () => {
		const authors = ['Jane Doe', 'John Smith'];
		expect(getAuthorsArray(authors)).toBe(authors);
	});
});

describe('formatAuthorList', () => {
	it('returns an empty string for no authors', () => {
		expect(formatAuthorList(undefined)).toBe('');
		expect(formatAuthorList([])).toBe('');
	});

	it('returns a single name as-is', () => {
		expect(formatAuthorList(['Jane Doe'])).toBe('Jane Doe');
	});

	it('joins two names with " and "', () => {
		expect(formatAuthorList(['Jane Doe', 'John Smith'])).toBe('Jane Doe and John Smith');
	});

	it('joins three or more names with ", " and a final " and "', () => {
		expect(formatAuthorList(['A', 'B', 'C'])).toBe('A, B and C');
		expect(formatAuthorList(['A', 'B', 'C', 'D'])).toBe('A, B, C and D');
	});

	it('normalises a multi-"and" string input', () => {
		expect(formatAuthorList('A and B and C')).toBe('A, B and C');
	});
});

describe('formatCitation — book', () => {
	it('formats "Place: Publisher." when both are present', () => {
		const result = formatCitation(
			pub({ type: 'book', placeOfPublication: 'Leiden', publisher: 'Brill' })
		);
		expect(result.typeLabel).toBe('Book');
		expect(result.detailsHtml).toBe('Leiden: Brill.');
		expect(result.year).toBe(2024);
	});

	it('formats place only', () => {
		expect(formatCitation(pub({ type: 'book', placeOfPublication: 'Leiden' })).detailsHtml).toBe(
			'Leiden.'
		);
	});

	it('formats publisher only', () => {
		expect(formatCitation(pub({ type: 'book', publisher: 'Brill' })).detailsHtml).toBe('Brill.');
	});

	it('produces an empty details string when neither is present', () => {
		const result = formatCitation(pub({ type: 'book' }));
		expect(result.detailsHtml).toBe('');
		expect(result.year).toBe(2024);
	});
});

describe('formatCitation — chapter', () => {
	it('formats book, editors, pages and imprint with a final period', () => {
		const result = formatCitation(
			pub({
				type: 'chapter',
				book: 'Muslim Minorities',
				editors: 'Jane Doe and John Smith',
				pages: '45-67',
				placeOfPublication: 'Berlin',
				publisher: 'De Gruyter'
			})
		);
		expect(result.typeLabel).toBe('Book Chapter');
		expect(result.detailsHtml).toBe(
			'In <em>Muslim Minorities</em>, ed. Jane Doe and John Smith, 45-67. Berlin: De Gruyter.'
		);
	});

	it('formats book and pages without an imprint (trailing separator space is kept)', () => {
		const result = formatCitation(
			pub({ type: 'chapter', book: 'Muslim Minorities', pages: '45-67' })
		);
		expect(result.detailsHtml).toBe('In <em>Muslim Minorities</em>, 45-67. ');
	});

	it('formats book only (trailing separator space is kept)', () => {
		expect(formatCitation(pub({ type: 'chapter', book: 'Muslim Minorities' })).detailsHtml).toBe(
			'In <em>Muslim Minorities</em>. '
		);
	});

	it('normalises comma/and editor strings to ", … and …"', () => {
		const result = formatCitation(pub({ type: 'chapter', book: 'B', editors: 'A, B and C' }));
		expect(result.detailsHtml).toBe('In <em>B</em>, ed. A, B and C. ');
	});

	it('appends the imprint after the book info and closes with a period', () => {
		const result = formatCitation(
			pub({ type: 'chapter', book: 'B', placeOfPublication: 'Paris', publisher: 'Karthala' })
		);
		expect(result.detailsHtml).toBe('In <em>B</em>. Paris: Karthala.');
	});
});

describe('formatCitation — article / bulletin-article', () => {
	it('formats journal, volume, issue and pages with citation punctuation', () => {
		const result = formatCitation(
			pub({
				type: 'article',
				journal: 'Cahiers d’études africaines',
				volume: '58',
				issue: '2',
				pages: '113-138'
			})
		);
		expect(result.typeLabel).toBe('Journal Article');
		expect(result.detailsHtml).toBe('<em>Cahiers d’études africaines</em> 58 (2): 113-138.');
	});

	it('formats journal only', () => {
		expect(formatCitation(pub({ type: 'article', journal: 'Africa' })).detailsHtml).toBe(
			'<em>Africa</em>.'
		);
	});

	it('formats journal and pages without volume/issue', () => {
		expect(
			formatCitation(pub({ type: 'article', journal: 'Africa', pages: '1-20' })).detailsHtml
		).toBe('<em>Africa</em>: 1-20.');
	});

	it('produces an empty details string when no journal fields are present', () => {
		expect(formatCitation(pub({ type: 'article' })).detailsHtml).toBe('');
	});

	it('uses the same format for bulletin articles with their own label', () => {
		const result = formatCitation(
			pub({ type: 'bulletin-article', journal: 'ISITA Bulletin', volume: '4' })
		);
		expect(result.typeLabel).toBe('Bulletin Article');
		expect(result.detailsHtml).toBe('<em>ISITA Bulletin</em> 4.');
	});
});

describe('formatCitation — encyclopedia', () => {
	it('formats title, editors, pages and imprint', () => {
		const result = formatCitation(
			pub({
				type: 'encyclopedia',
				encyclopediaTitle: 'Encyclopaedia of Islam',
				editors: 'Jane Doe and John Smith',
				pages: '12-14',
				placeOfPublication: 'Leiden',
				publisher: 'Brill'
			})
		);
		expect(result.typeLabel).toBe('Encyclopedia Entry');
		expect(result.detailsHtml).toBe(
			'In <em>Encyclopaedia of Islam</em>, ed. Jane Doe and John Smith, 12-14. Leiden: Brill.'
		);
	});

	it('renders empty <em></em> when the encyclopedia title is missing (trailing space kept)', () => {
		expect(formatCitation(pub({ type: 'encyclopedia' })).detailsHtml).toBe('In <em></em>. ');
	});
});

describe('formatCitation — dissertations and theses', () => {
	it('formats a PhD dissertation with department and university', () => {
		const result = formatCitation(
			pub({ type: 'phd-dissertation', department: 'History', university: 'Université Laval' })
		);
		expect(result.typeLabel).toBe('Ph.D. Dissertation');
		expect(result.detailsHtml).toBe('Ph.D. Dissertation, History, Université Laval.');
		expect(result.year).toBe(2024);
	});

	it('formats a master’s thesis with university only', () => {
		const result = formatCitation(pub({ type: 'masters-thesis', university: 'Université Laval' }));
		expect(result.typeLabel).toBe("Master's Thesis");
		expect(result.detailsHtml).toBe("Master's Thesis, Université Laval.");
	});

	it('falls back to the bare type label when no institution fields exist', () => {
		expect(formatCitation(pub({ type: 'phd-dissertation' })).detailsHtml).toBe(
			'Ph.D. Dissertation.'
		);
	});
});

describe('formatCitation — blogpost', () => {
	it('formats the display date in parentheses, then the italicised publisher, and drops year', () => {
		const result = formatCitation(
			pub({ type: 'blogpost', dateISO: '2024-03-21', publisher: 'Africa Is a Country' })
		);
		expect(result.typeLabel).toBe('Blog Post');
		expect(result.detailsHtml).toBe('(21 March 2024), <em>Africa Is a Country</em>.');
		expect(result.year).toBeUndefined();
	});

	it('formats publisher alone when there is no ISO date', () => {
		const result = formatCitation(
			pub({ type: 'blogpost', dateISO: '', publisher: 'Africa Is a Country' })
		);
		expect(result.detailsHtml).toBe('<em>Africa Is a Country</em>.');
	});

	it('formats the date alone when there is no publisher', () => {
		const result = formatCitation(pub({ type: 'blogpost', dateISO: '2024-03-21' }));
		expect(result.detailsHtml).toBe('(21 March 2024).');
		expect(result.year).toBeUndefined();
	});
});

describe('formatCitation — report', () => {
	it('formats italicised publisher with volume, issue and pages', () => {
		const result = formatCitation(
			pub({ type: 'report', publisher: 'ISS', volume: '12', issue: '3', pages: '1-10' })
		);
		expect(result.typeLabel).toBe('Report');
		expect(result.detailsHtml).toBe('<em>ISS</em> 12 (3): 1-10.');
		expect(result.year).toBe(2024);
	});
});

describe('formatCitation — special issue', () => {
	it('formats italicised journal with volume and issue', () => {
		const result = formatCitation(
			pub({ type: 'special-issue', journal: 'Islamic Africa', volume: '15', issue: '2' })
		);
		expect(result.typeLabel).toBe('Special Issue');
		expect(result.detailsHtml).toBe('<em>Islamic Africa</em> 15 (2).');
	});
});

describe('formatCitation — conference proceedings', () => {
	it('formats proceedings title, editors, pages and imprint', () => {
		const result = formatCitation(
			pub({
				type: 'conference-proceedings',
				proceedingsTitle: 'Proceedings of the Sahel Conference',
				editors: 'Jane Doe',
				pages: '1-9',
				placeOfPublication: 'Paris',
				publisher: 'Karthala'
			})
		);
		expect(result.typeLabel).toBe('Conference Proceedings');
		expect(result.detailsHtml).toBe(
			'In <em>Proceedings of the Sahel Conference</em>, ed. Jane Doe, 1-9. Paris: Karthala.'
		);
	});
});

describe('formatCitation — forthcoming date override', () => {
	it('surfaces "Forthcoming" as the year label instead of the numeric year', () => {
		const result = formatCitation(
			pub({ type: 'article', journal: 'Africa', date: 'Forthcoming', year: 2026 })
		);
		expect(result.year).toBe('Forthcoming');
	});

	it('trims whitespace around the forthcoming label', () => {
		expect(formatCitation(pub({ date: '  Forthcoming ' })).year).toBe('Forthcoming');
	});

	it('matches case-insensitively but preserves the original casing of the label', () => {
		expect(formatCitation(pub({ date: 'forthcoming' })).year).toBe('forthcoming');
	});

	it('recognises the French label "à paraître"', () => {
		expect(formatCitation(pub({ date: 'à paraître' })).year).toBe('à paraître');
	});

	it('leaves the numeric year untouched for a normal date', () => {
		expect(formatCitation(pub({ date: '2024', year: 2024 })).year).toBe(2024);
	});
});
