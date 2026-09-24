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
	poster: 'Poster Presentation',
	event: 'Academic Event',
	podcast: 'Podcast'
};

export const COMMUNICATION_TYPE_SEO_LABELS: Record<string, string> = {
	conference: 'Conference paper',
	workshop: 'Workshop presentation',
	seminar: 'Seminar',
	lecture: 'Lecture',
	panel: 'Panel discussion',
	poster: 'Poster presentation',
	event: 'Academic event'
};

/* LIST — singular row labels on the Talks & Events index */
export const COMMUNICATION_TYPE_LIST_LABELS: Record<string, string> = {
	conference: 'Conference paper',
	workshop: 'Workshop',
	seminar: 'Seminar',
	lecture: 'Lecture',
	panel: 'Panel organised',
	poster: 'Poster',
	event: 'Academic event',
	podcast: 'Podcast'
};

/* CHIP — plural facet-chip labels on the Talks & Events index */
export const COMMUNICATION_TYPE_CHIP_LABELS: Record<string, string> = {
	conference: 'Conferences',
	workshop: 'Workshops',
	seminar: 'Seminars',
	lecture: 'Lectures',
	panel: 'Panels',
	poster: 'Posters',
	event: 'Events',
	podcast: 'Podcasts'
};

/* CHART — axis/legend labels on the visualisations page */
export const COMMUNICATION_TYPE_CHART_LABELS: Record<string, string> = {
	conference: 'Conference paper',
	workshop: 'Workshop',
	seminar: 'Seminar',
	lecture: 'Lecture',
	panel: 'Panel organised',
	poster: 'Poster',
	event: 'Academic event organised',
	podcast: 'Podcast'
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
	conference: 'Conference paper',
	workshop: 'Workshop',
	seminar: 'Seminar',
	lecture: 'Lecture summary',
	panel: 'Panel discussion',
	grant: 'Research grant',
	publication: 'Publication',
	event: 'Academic event',
	visit: 'Academic visit',
	news: 'News'
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
