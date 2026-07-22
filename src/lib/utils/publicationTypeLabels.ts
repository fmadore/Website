/**
 * Publication-type label registry.
 *
 * Single source of truth for every mapping keyed by a publication type
 * identifier (`article`, `chapter`, `special-issue`, …). The registers are
 * intentionally kept distinct — each targets a different output vocabulary
 * and must NOT be merged or cross-derived:
 *  - BADGE    — Title Case, detail-page badges/titles
 *  - CITATION — citation-style labels (e.g. "Ph.D. Dissertation"), bibliographies
 *  - SEO      — sentence case, meta descriptions
 *  - CV       — plural section headings on the CV page
 *  - FILTER   — sentence-case facet labels on the publications index
 *  - CHIP     — short plural chip labels on the publications index
 *  - CHART    — sentence-case labels for the stacked-bar visualisation
 *  - GANTT    — compact labels for the Gantt visualisation
 *  - PANEL    — sidebar "relevant publications" filter buttons
 *  - COINS genre / DC type — machine registers for OpenURL/COinS and Dublin Core
 *
 * Communication and activity type labels live in `typeUtils.ts`.
 */

/** Title-case labels for badges/titles. */
export const PUBLICATION_TYPE_BADGE_LABELS: Record<string, string> = {
	article: 'Journal Article',
	'bulletin-article': 'Bulletin Article',
	book: 'Book',
	chapter: 'Book Chapter',
	'special-issue': 'Special Issue',
	report: 'Report',
	encyclopedia: 'Encyclopedia Entry',
	blogpost: 'Blog Post',
	'masters-thesis': "Master's Thesis",
	'phd-dissertation': 'PhD Dissertation'
};

/** Citation-style labels (used in bibliographies and citation exports). */
export const PUBLICATION_TYPE_CITATION_LABELS: Record<string, string> = {
	book: 'Book',
	article: 'Journal Article',
	'bulletin-article': 'Bulletin Article',
	chapter: 'Book Chapter',
	'special-issue': 'Special Issue',
	report: 'Report',
	encyclopedia: 'Encyclopedia Entry',
	blogpost: 'Blog Post',
	'phd-dissertation': 'Ph.D. Dissertation',
	'masters-thesis': "Master's Thesis",
	'conference-proceedings': 'Conference Proceedings'
};

/**
 * Type label mappings for SEO purposes - used in meta descriptions.
 * These are more descriptive than the badge labels.
 */
export const PUBLICATION_TYPE_SEO_LABELS: Record<string, string> = {
	article: 'Journal article',
	'bulletin-article': 'Bulletin article',
	book: 'Book',
	chapter: 'Book chapter',
	'special-issue': 'Special issue',
	report: 'Research report',
	encyclopedia: 'Encyclopedia entry',
	blogpost: 'Blog post',
	'masters-thesis': "Master's thesis",
	'phd-dissertation': 'PhD dissertation'
};

/** Plural section headings for the CV page. */
export const PUBLICATION_TYPE_CV_HEADING_LABELS: Record<string, string> = {
	book: 'Books',
	'special-issue': 'Guest Edited Journals',
	article: 'Journal Articles',
	chapter: 'Book Chapters',
	report: 'Report',
	encyclopedia: 'Encyclopedia Entry',
	'bulletin-article': 'Bulletin Articles',
	blogpost: 'Blog Posts',
	'conference-proceedings': 'Conference Proceedings'
};

/** Sentence-case facet labels for the publications index filters. */
export const PUBLICATION_TYPE_FILTER_LABELS: Record<string, string> = {
	blogpost: 'Blog post',
	book: 'Book',
	'bulletin-article': 'Bulletin article',
	chapter: 'Book chapter',
	'conference-proceedings': 'Conference proceedings',
	encyclopedia: 'Encyclopedia entry',
	article: 'Journal article',
	'masters-thesis': "Master's thesis",
	'phd-dissertation': 'Ph.D. dissertation',
	report: 'Report',
	'special-issue': 'Special issue'
};

/** Short plural chip labels — the publications index's compact type row. */
export const PUBLICATION_TYPE_CHIP_LABELS: Record<string, string> = {
	blogpost: 'Blog posts',
	book: 'Books',
	'bulletin-article': 'Bulletins',
	chapter: 'Chapters',
	'conference-proceedings': 'Proceedings',
	encyclopedia: 'Encyclopedia',
	article: 'Articles',
	'masters-thesis': 'Theses',
	'phd-dissertation': 'Dissertations',
	report: 'Reports',
	'special-issue': 'Special issues'
};

/** Sentence-case labels for the publications stacked-bar visualisation. */
export const PUBLICATION_TYPE_CHART_LABELS: Record<string, string> = {
	article: 'Journal article',
	'bulletin-article': 'Bulletin article',
	book: 'Book',
	chapter: 'Book chapter',
	'conference-proceedings': 'Conference proceedings',
	'special-issue': 'Special issue',
	report: 'Research report',
	encyclopedia: 'Encyclopedia entry',
	blogpost: 'Blog post',
	'masters-thesis': "Master's thesis",
	'phd-dissertation': 'PhD dissertation'
};

/** Compact labels for the publications Gantt visualisation. */
export const PUBLICATION_TYPE_GANTT_LABELS: Record<string, string> = {
	article: 'Article',
	'bulletin-article': 'Bulletin',
	book: 'Book',
	chapter: 'Chapter',
	'conference-proceedings': 'Proceedings',
	'special-issue': 'Special Issue',
	report: 'Report',
	encyclopedia: 'Encyclopedia',
	blogpost: 'Blog Post',
	'masters-thesis': 'Thesis',
	'phd-dissertation': 'Dissertation'
};

/** Labels for the sidebar "relevant publications" type-filter buttons. */
export const PUBLICATION_TYPE_PANEL_LABELS: Record<string, string> = {
	article: 'Journal Article',
	'bulletin-article': 'Bulletin Article',
	book: 'Book',
	chapter: 'Book Chapter',
	'special-issue': 'Special Issue',
	report: 'Report',
	encyclopedia: 'Encyclopedia Entry',
	blogpost: 'Blog Post',
	dissertation: 'Dissertation'
};

/** OpenURL/COinS `rft.genre` values per publication type. */
export const PUBLICATION_TYPE_COINS_GENRES: Record<string, string> = {
	article: 'article',
	chapter: 'bookitem',
	encyclopedia: 'bookitem',
	blogpost: 'article',
	book: 'book',
	'special-issue': 'journal',
	report: 'report',
	'phd-dissertation': 'dissertation',
	'masters-thesis': 'dissertation',
	'conference-proceedings': 'proceeding',
	'bulletin-article': 'article'
};

/** Dublin Core `DC.type` values per publication type. */
export const PUBLICATION_TYPE_DC_TYPES: Record<string, string> = {
	article: 'Text',
	chapter: 'Text',
	encyclopedia: 'Text',
	blogpost: 'Text',
	book: 'Book',
	'special-issue': 'Collection',
	report: 'Text',
	'phd-dissertation': 'Text',
	'masters-thesis': 'Text',
	'conference-proceedings': 'Text',
	'bulletin-article': 'Text'
};

/**
 * Maps publication type identifiers to human-readable display text.
 *
 * @example
 * getPublicationTypeBadge('article') // Returns: 'Journal Article'
 * getPublicationTypeBadge('chapter') // Returns: 'Book Chapter'
 */
export function getPublicationTypeBadge(type: string): string {
	return PUBLICATION_TYPE_BADGE_LABELS[type] || type;
}

/**
 * Formats a publication type into a human-readable CV section heading.
 */
export function getPublicationTypeDisplayName(type: string): string {
	return PUBLICATION_TYPE_CV_HEADING_LABELS[type] ?? 'Other Publications';
}

/** Citation genre for OpenURL/COinS compatibility. */
export function getCitationGenre(type: string): string {
	return PUBLICATION_TYPE_COINS_GENRES[type] || 'unknown';
}

/** Dublin Core type for a publication type. */
export function getDcType(type: string): string {
	return PUBLICATION_TYPE_DC_TYPES[type] || 'Text';
}
