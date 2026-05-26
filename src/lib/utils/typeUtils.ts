/**
 * Type Display Utilities
 *
 * Single source of truth for converting internal type identifiers to
 * human-readable text. Three label registers are intentionally kept
 * distinct per entity:
 *  - BADGE   — Title Case, used for detail-page badges/titles
 *  - CITATION — citation-style (e.g. "Ph.D. Dissertation"), used in bibliographies
 *  - SEO     — sentence case, used in meta descriptions
 */

/* ===== Publication type labels ===== */

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

/* ===== Communication type labels ===== */

export const COMMUNICATION_TYPE_BADGE_LABELS: Record<string, string> = {
	conference: 'Conference Paper',
	workshop: 'Workshop Presentation',
	seminar: 'Seminar',
	lecture: 'Lecture',
	panel: 'Panel',
	event: 'Academic Event'
};

export const COMMUNICATION_TYPE_SEO_LABELS: Record<string, string> = {
	conference: 'Conference paper',
	workshop: 'Workshop presentation',
	seminar: 'Seminar',
	lecture: 'Lecture',
	panel: 'Panel discussion',
	event: 'Academic event'
};

/* ===== Activity type labels ===== */

export const ACTIVITY_TYPE_BADGE_LABELS: Record<string, string> = {
	conference: 'Conference',
	workshop: 'Workshop',
	seminar: 'Seminar',
	lecture: 'Lecture',
	panel: 'Panel',
	grant: 'Research Grant',
	publication: 'Publication',
	event: 'Event',
	visit: 'Academic Visit',
	news: 'News'
};

export const ACTIVITY_TYPE_SEO_LABELS: Record<string, string> = {
	conference: 'Conference insights',
	workshop: 'Workshop highlights',
	seminar: 'Seminar takeaways',
	lecture: 'Lecture summary',
	panel: 'Panel discussion',
	grant: 'Research funding',
	publication: 'Publication update',
	event: 'Academic event',
	visit: 'Academic visit',
	news: 'Latest news'
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
 * Maps communication type identifiers to human-readable display text.
 *
 * @example
 * getCommunicationTypeBadge('conference') // Returns: 'Conference Paper'
 * getCommunicationTypeBadge('workshop') // Returns: 'Workshop Presentation'
 */
export function getCommunicationTypeBadge(type: string): string {
	return COMMUNICATION_TYPE_BADGE_LABELS[type] || type;
}

/**
 * Maps activity type identifiers to human-readable display text.
 * Uses engaging, blog-friendly labels.
 *
 * @example
 * getActivityTypeBadge('conference') // Returns: 'Conference'
 * getActivityTypeBadge('grant') // Returns: 'Research Grant'
 */
export function getActivityTypeBadge(type: string | undefined): string {
	if (!type) return 'Activity';
	return ACTIVITY_TYPE_BADGE_LABELS[type] || type;
}

/**
 * Formats a panel type for display by capitalizing the first letter.
 * Used for activity panel types.
 *
 * @example
 * formatPanelType('conference') // Returns: 'Conference'
 */
export function formatPanelType(panelType: string | undefined): string {
	if (!panelType) return '';
	return panelType.charAt(0).toUpperCase() + panelType.slice(1);
}
