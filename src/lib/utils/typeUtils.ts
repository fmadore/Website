/**
 * Type Display Utilities
 *
 * Centralized functions for converting internal type identifiers to
 * human-readable display text. Used across detail pages for badges,
 * titles, and labels.
 */

/**
 * Maps publication type identifiers to human-readable display text.
 *
 * @param type - The internal publication type identifier
 * @returns Human-readable display text for the type
 *
 * @example
 * getPublicationTypeBadge('article') // Returns: 'Journal Article'
 * getPublicationTypeBadge('chapter') // Returns: 'Book Chapter'
 */
export function getPublicationTypeBadge(type: string): string {
	const typeLabels: Record<string, string> = {
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
	return typeLabels[type] || type;
}

/**
 * Maps communication type identifiers to human-readable display text.
 *
 * @param type - The internal communication type identifier
 * @returns Human-readable display text for the type
 *
 * @example
 * getCommunicationTypeBadge('conference') // Returns: 'Conference Paper'
 * getCommunicationTypeBadge('workshop') // Returns: 'Workshop Presentation'
 */
export function getCommunicationTypeBadge(type: string): string {
	const typeLabels: Record<string, string> = {
		conference: 'Conference Paper',
		workshop: 'Workshop Presentation',
		seminar: 'Seminar',
		lecture: 'Lecture',
		panel: 'Panel',
		event: 'Academic Presentation'
	};
	return typeLabels[type] || type;
}

/**
 * Maps activity type identifiers to human-readable display text.
 * Uses engaging, blog-friendly labels.
 *
 * @param type - The internal activity type identifier
 * @returns Human-readable display text for the type
 *
 * @example
 * getActivityTypeBadge('conference') // Returns: 'Conference'
 * getActivityTypeBadge('grant') // Returns: 'Research Grant'
 */
export function getActivityTypeBadge(type: string | undefined): string {
	if (!type) return 'Activity';

	const typeLabels: Record<string, string> = {
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
	return typeLabels[type] || type;
}

/**
 * Formats a panel type for display by capitalizing the first letter.
 * Used for activity panel types.
 *
 * @param panelType - The panel type string to format
 * @returns Formatted panel type with first letter capitalized
 *
 * @example
 * formatPanelType('conference') // Returns: 'Conference'
 */
export function formatPanelType(panelType: string | undefined): string {
	if (!panelType) return '';
	return panelType.charAt(0).toUpperCase() + panelType.slice(1);
}

/**
 * Type label mappings for SEO purposes - used in meta descriptions.
 * These are more descriptive than the badge labels.
 */
export const PUBLICATION_TYPE_SEO_LABELS: Record<string, string> = {
	article: 'Journal article',
	book: 'Book',
	chapter: 'Book chapter',
	'special-issue': 'Special issue',
	report: 'Research report',
	encyclopedia: 'Encyclopedia entry',
	blogpost: 'Blog post',
	'masters-thesis': "Master's thesis",
	'phd-dissertation': 'PhD dissertation'
};

export const COMMUNICATION_TYPE_SEO_LABELS: Record<string, string> = {
	conference: 'Conference paper',
	workshop: 'Workshop presentation',
	seminar: 'Seminar',
	lecture: 'Lecture',
	panel: 'Panel discussion',
	event: 'Academic presentation'
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
