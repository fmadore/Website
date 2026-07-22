/**
 * Type Display Utilities
 *
 * Single source of truth for converting internal communication and activity
 * type identifiers to human-readable text. Two label registers are
 * intentionally kept distinct per entity:
 *  - BADGE   — Title Case, used for detail-page badges/titles
 *  - SEO     — sentence case, used in meta descriptions
 *
 * Publication type labels live in `publicationTypeLabels.ts`, the single
 * registry for every mapping keyed by a publication type.
 */

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
	news: 'News',
	presentation: 'Presentation',
	podcast: 'Podcast',
	career: 'Career'
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
