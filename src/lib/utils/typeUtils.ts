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
 *
 * Every register is checked with `satisfies Record<CommunicationType, string>`
 * (or `ActivityType`): a type missing from a register, or a key that is not a
 * type, is a compile error. The declared type stays a string-keyed record so
 * the many call sites that look a label up by a plain `string` keep compiling;
 * `typeUtils.test.ts` holds the unions themselves to the corpus.
 */
import type { CommunicationType } from '#lib/types/communication.ts';
import type { ActivityType } from '#lib/types/activity.ts';

/** A label register: complete over its union, readable by any string key. */
type LabelRegister = Readonly<Record<string, string>>;

/* ===== Communication type labels ===== */

export const COMMUNICATION_TYPE_BADGE_LABELS: LabelRegister = {
	conference: 'Conference Paper',
	workshop: 'Workshop Presentation',
	seminar: 'Seminar',
	lecture: 'Lecture',
	panel: 'Panel',
	poster: 'Poster Presentation',
	event: 'Academic Event',
	podcast: 'Podcast'
} satisfies Record<CommunicationType, string>;

export const COMMUNICATION_TYPE_SEO_LABELS: LabelRegister = {
	conference: 'Conference paper',
	workshop: 'Workshop presentation',
	seminar: 'Seminar',
	lecture: 'Lecture',
	panel: 'Panel discussion',
	poster: 'Poster presentation',
	event: 'Academic event',
	podcast: 'Podcast episode'
} satisfies Record<CommunicationType, string>;

/* LIST — singular row labels on the Talks & Events index */
export const COMMUNICATION_TYPE_LIST_LABELS: LabelRegister = {
	conference: 'Conference paper',
	workshop: 'Workshop',
	seminar: 'Seminar',
	lecture: 'Lecture',
	panel: 'Panel organised',
	poster: 'Poster',
	event: 'Academic event',
	podcast: 'Podcast'
} satisfies Record<CommunicationType, string>;

/* CHIP — plural facet-chip labels on the Talks & Events index */
export const COMMUNICATION_TYPE_CHIP_LABELS: LabelRegister = {
	conference: 'Conferences',
	workshop: 'Workshops',
	seminar: 'Seminars',
	lecture: 'Lectures',
	panel: 'Panels',
	poster: 'Posters',
	event: 'Events',
	podcast: 'Podcasts'
} satisfies Record<CommunicationType, string>;

/* CHART — axis/legend labels on the visualisations page */
export const COMMUNICATION_TYPE_CHART_LABELS: LabelRegister = {
	conference: 'Conference paper',
	workshop: 'Workshop',
	seminar: 'Seminar',
	lecture: 'Lecture',
	panel: 'Panel organised',
	poster: 'Poster',
	event: 'Academic event organised',
	podcast: 'Podcast'
} satisfies Record<CommunicationType, string>;

/* ===== Activity type labels ===== */

export const ACTIVITY_TYPE_BADGE_LABELS: LabelRegister = {
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
} satisfies Record<ActivityType, string>;

export const ACTIVITY_TYPE_SEO_LABELS: LabelRegister = {
	conference: 'Conference paper',
	workshop: 'Workshop',
	seminar: 'Seminar',
	lecture: 'Lecture summary',
	panel: 'Panel discussion',
	grant: 'Research grant',
	publication: 'Publication',
	event: 'Academic event',
	visit: 'Academic visit',
	news: 'News',
	presentation: 'Presentation',
	podcast: 'Podcast episode',
	career: 'Career news'
} satisfies Record<ActivityType, string>;

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

/** Narrows a record's `type` string to the closed set the registers label. */
export function isActivityType(type: string | undefined): type is ActivityType {
	return type !== undefined && Object.hasOwn(ACTIVITY_TYPE_BADGE_LABELS, type);
}

/** Sentence-case label for a talk type, for meta descriptions. */
export function communicationTypeSeoLabel(type: CommunicationType | undefined): string | undefined {
	return type ? COMMUNICATION_TYPE_SEO_LABELS[type] : undefined;
}

/**
 * Sentence-case label for an activity type, for meta descriptions. Undefined
 * for a missing or unknown type, so the caller's fallback is explicit.
 */
export function activityTypeSeoLabel(type: string | undefined): string | undefined {
	return isActivityType(type) ? ACTIVITY_TYPE_SEO_LABELS[type] : undefined;
}
