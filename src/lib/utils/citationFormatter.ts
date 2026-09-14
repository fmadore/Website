import type { Publication } from '$lib/types/publication';
import { formatDisplayDate, isForthcoming } from '$lib/utils/date-formatter';
import { joinNames, splitNames } from '$lib/utils/nameUtils';
import { PUBLICATION_TYPE_CITATION_LABELS } from '$lib/utils/publicationTypeLabels';
import { quoteTitle, typesetQuotes, typesetQuotesInHtml } from '$lib/utils/typesetQuotes';

// Human-readable labels for publication types (citation register).
// Re-exported from the single type-label registry in publicationTypeLabels.
export const typeLabels = PUBLICATION_TYPE_CITATION_LABELS;

// Helper function to handle authors that might be string or array
export function getAuthorsArray(authors: string[] | string | undefined): string[] {
	if (!authors) return [];
	if (typeof authors === 'string') return authors.split(' and ');
	return authors;
}

// New function to format author list. Citation style: ", " between entries,
// " and " before the last (no serial comma) — the joinNames defaults.
//
// Typeset here, not in `joinNames`: nameUtils is shared with the BibTeX and
// COinS generators, where a curled apostrophe in "N'Dri" would corrupt an
// export. This is the display byline, so it takes the typographic register.
export function formatAuthorList(authorsInput: string[] | string | undefined): string {
	return typesetQuotes(joinNames(getAuthorsArray(authorsInput)));
}

// Helper function to format editor string (e.g., "Name1, Name2 and Name3")
function formatEditors(editors: string | undefined): string {
	if (!editors) return '';
	return joinNames(splitNames(editors));
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

// Ensure a non-empty details string closes with a period, dropping any
// trailing separator space left behind when an optional imprint is absent.
function withFinalPeriod(details: string): string {
	const trimmed = details.trimEnd();
	if (trimmed && !trimmed.endsWith('.')) {
		return trimmed + '.';
	}
	return trimmed;
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
		// Format: *Blog*, 21 March 2024. — the host first, then the day it ran,
		// as the CV bibliography sets it. The full date carries the year, so the
		// separate year slot stays empty rather than printing it twice.
		let details = '';
		if (publication.publisher) details += `<em>${publication.publisher}</em>`;
		const formattedDate = publication.dateISO ? formatDisplayDate(publication.dateISO) : '';
		if (formattedDate) {
			if (details) details += ', ';
			details += formattedDate;
		}

		detailsHtml = withFinalPeriod(details);
		year = undefined;
	} else if (type === 'working-paper') {
		// Format: *Series* Issue: Pages. Publisher.
		// A working paper is identified by its series and number, not a journal;
		// the issuing body follows as an imprint when it isn't the series itself.
		let details = '';
		const seriesTitle = publication.series || publication.journal;
		if (seriesTitle) details += `<em>${seriesTitle}</em>`;
		if (publication.volume) details += ` ${publication.volume}`;
		if (publication.issue) details += ` ${publication.issue}`;
		if (publication.pages) details += `: ${publication.pages}`;
		if (publication.publisher && publication.publisher !== seriesTitle) {
			if (details) details += '. ';
			details += publication.placeOfPublication
				? `${publication.placeOfPublication}: ${publication.publisher}`
				: publication.publisher;
		}
		detailsHtml = withFinalPeriod(details);
		year = publication.year;
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
		// The details string is display copy assembled from journal / book /
		// publisher / editor fields, each spelled however its source spells it.
		// Typesetting here rather than at every call site keeps the site's lists,
		// its detail pages and the MCP server's `reference` style in one register.
		// `typesetQuotesInHtml` because the string carries <em> markup.
		detailsHtml: typesetQuotesInHtml(detailsHtml),
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

	// Plain text (no markup), so the whole venue line typesets in one pass.
	return typesetQuotes(parts.join(', '));
}

// ── The plain-text display reference ─────────────────────────────────────────
//
// `formatCitation` builds the *display* reference as HTML fragments the page
// assembles around its own heading. A reference a reader can copy, paste or be
// handed by an assistant is a different artefact: one flat string, whole,
// carrying the title the page prints above it.
//
// It lives here rather than in the page or in `mcp/` because both consume it —
// the site's "Copy reference" control and the MCP server's `reference` citation
// style — and a second implementation would guarantee the two eventually
// disagree about the same work.

const REFERENCE_ENTITIES: Record<string, string> = {
	'&lt;': '<',
	'&gt;': '>',
	'&quot;': '"',
	'&#39;': "'",
	'&nbsp;': ' ',
	'&amp;': '&'
};

/**
 * Strip the display formatter's markup down to plain text.
 *
 * Two things here are deliberate rather than merely tidy:
 *
 *  - Tag removal repeats until the string stops changing. A single pass over
 *    `<[^>]+>` turns `<<b>script>` into `<script>` — it removes the inner tag
 *    and leaves a new one behind. Looping to a fixed point cannot.
 *  - Entities are decoded in one pass through a lookup, not by chained
 *    `replace` calls. Decoding `&amp;` first would turn `&amp;lt;` into `&lt;`
 *    and then into `<`, reviving markup the caller had escaped.
 */
function stripReferenceMarkup(html: string): string {
	let text = html;
	let previous: string;
	do {
		previous = text;
		text = text.replace(/<[^>]*>/g, '');
	} while (text !== previous);

	return text
		.replace(/&(?:amp|lt|gt|quot|nbsp|#39);/g, (entity) => REFERENCE_ENTITIES[entity] ?? entity)
		.replace(/\s+/g, ' ')
		.trim();
}

export interface ReferenceTextOptions {
	/** Close with the bracketed type label — "[Journal Article]". */
	typeLabel?: boolean;
	/** Close with the resolvable DOI address, for a reference meant to be pasted. */
	doi?: boolean;
}

/**
 * Types whose title is the work itself. Everywhere else the italic falls on a
 * host — the journal, the edited volume, the encyclopaedia, the series — and
 * the title is set roman in quotation marks; a book has no host, so its title
 * carries the italic and no quotes. The CV sets its bibliography by the same
 * rule (`CVPublications.svelte`), so the two never disagree.
 */
const STANDALONE_TYPES: ReadonlySet<Publication['type']> = new Set(['book']);

function escapeHtml(text: string): string {
	return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// Close a reference element with a full stop unless it already ends in one
// — a title that asks a question must not read "ivoirien?." on the page.
function closeElement(text: string): string {
	return /[.?!]$/.test(text) ? text : `${text}.`;
}

/**
 * The site's display reference as one HTML string:
 * `Authors. (Year). Title. Venue details.` — with the host italicised as
 * `formatCitation` already sets it, and the title itself italicised when the
 * work stands alone (see `STANDALONE_TYPES`). What the record rail prints.
 *
 * The title and byline are data, not markup, so they are escaped here; the
 * details string arrives from `formatCitation` already carrying its `<em>`.
 */
export function formatReferenceHtml(
	publication: Publication,
	options: ReferenceTextOptions = {}
): string {
	const { typeLabel: label, detailsHtml, year } = formatCitation(publication);
	const authors = escapeHtml(formatAuthorList(publication.authors));
	const title = typesetQuotes(publication.title);
	// The stop sits outside the italic or the closing quote, as on the CV, and
	// is checked against the bare title so “Whose Islam?” takes no second one.
	const stop = closeElement(title).slice(title.length);
	const titleHtml = STANDALONE_TYPES.has(publication.type)
		? `<em>${escapeHtml(title)}</em>${stop}`
		: `${escapeHtml(quoteTitle(publication.title))}${stop}`;

	return [
		authors && closeElement(authors),
		year && `(${year}).`,
		titleHtml,
		detailsHtml,
		options.typeLabel && `[${escapeHtml(label)}]`,
		options.doi && publication.doi ? `https://doi.org/${escapeHtml(publication.doi)}` : ''
	]
		.filter(Boolean)
		.join(' ')
		.replace(/\s+/g, ' ')
		.trim();
}

/**
 * The same reference as plain text — what the "Copy reference" control puts on
 * the clipboard and what the MCP server hands to assistants. Derived from the
 * HTML form so the two can never assemble the same work differently.
 */
export function formatReferenceText(
	publication: Publication,
	options: ReferenceTextOptions = {}
): string {
	return stripReferenceMarkup(formatReferenceHtml(publication, options));
}
