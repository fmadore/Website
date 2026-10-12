/**
 * Where citing works cite one of the site's publications, quoted from their
 * own text. One set per cited publication (its `id` is the publication's);
 * each context answers one entry of that publication's `citedBy`, keyed by the
 * entry's `wikidataId`, or by its `url` when it has none.
 *
 * Passages are located by a language model in each citing work's full text
 * and matched word for word against it by script before they are recorded;
 * note numbers are removed for display. The run itself, with the verbatim
 * text, lives outside git (`reports/citation-contexts/`).
 */

/**
 * - `quoted`: the work was read and its passages are recorded;
 * - `bibliography-only`: the work was read and lists the publication in its
 *   references without citing it in the text;
 * - `unread`: no full text was available to read.
 */
export type CitationContextStatus = 'quoted' | 'bibliography-only' | 'unread';

export type CitationPassage = {
	/** The sentence or sentences carrying the citation, as printed, note numbers removed. */
	text: string;
	/** The page or pages in the citing work, as printed; absent for a web page. */
	page?: string;
	/** How the citing work refers to the publication there: `Madore 2016, 419`, `note 45`. */
	citedAs?: string;
	/** The passage is the note's own text rather than the sentence carrying its number. */
	inNote?: boolean;
	/** `reader` when it was read from a printed copy rather than matched against a full text. */
	checkedBy?: 'script' | 'reader';
};

export type CitationContext = {
	/** The `citedBy` entry: its `wikidataId`, or its `url` when it has none. */
	citing: string;
	/** ISO 639-1 code of the citing text, for the quotation's `lang`. */
	language: string;
	status: CitationContextStatus;
	passages?: CitationPassage[];
};

export type CitationContextSet = {
	/** The cited publication's id. */
	id: string;
	/** The model that located the passages, as the page credits it. */
	model: string;
	/** ISO date of the run. */
	extracted: string;
	contexts: CitationContext[];
};
