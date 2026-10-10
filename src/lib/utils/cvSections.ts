/**
 * What each CV section prints, and in what order.
 *
 * Two surfaces print the CV: the page (`/cv`, one component per section in
 * `$lib/components/cv/`) and its Markdown twin (`/cv.md`,
 * `$lib/server/markdown/cv.ts`). They set an entry in their own medium —
 * markup on one, Markdown on the other — but they must agree on which records
 * a section holds and in what order, and on the few derived strings both
 * print. Those decisions live here, once, so the page and its twin cannot
 * drift apart. The entry formatters both share are in `cvFormatters.ts`.
 *
 * Pure and dataset-free: each function takes the records it selects from, so a
 * component keeps importing the projection it already reads and this module
 * never pulls a dataset into a bundle.
 */
import type { CvCommunication } from '$lib/types/communication';
import type { Education } from '$lib/types/education';
import type { EditorialMembership } from '$lib/types/editorial-membership';
import type { Fieldwork } from '$lib/types/fieldwork';
import type { PeerReview } from '$lib/types/peer-review';
import type { CvPublication } from '$lib/types/publication';
import type {
	GuestLecture,
	TeachingExperience,
	TeachingLecture
} from '$lib/types/teachingExperience';
import { formatDayMonth } from './date-formatter';

// ── Header ───────────────────────────────────────────────────────────────────

/** The CV's edition stamp, "8 October 2026": the build date, in UTC. */
export function formatCvEditionDate(date: Date): string {
	return date.toLocaleDateString('en-GB', {
		timeZone: 'UTC',
		year: 'numeric',
		month: 'long',
		day: 'numeric'
	});
}

// ── Education ────────────────────────────────────────────────────────────────

const EDUCATION_TYPES = ['Degree', 'Training', 'Certificate'];

/** Degrees, trainings and certificates, each in the dataset's order; anything untyped under other. */
export function splitEducation<T extends Pick<Education, 'type'>>(entries: readonly T[]) {
	return {
		degrees: entries.filter((entry) => entry.type === 'Degree'),
		trainings: entries.filter((entry) => entry.type === 'Training'),
		certificates: entries.filter((entry) => entry.type === 'Certificate'),
		other: entries.filter((entry) => !EDUCATION_TYPES.includes(entry.type || ''))
	};
}

// ── Publications ─────────────────────────────────────────────────────────────

/** Whether the CV's publication list prints a record: theses sit under Education instead. */
export function isCvPublication(pub: Pick<CvPublication, 'type'>): boolean {
	return pub.type !== 'phd-dissertation' && pub.type !== 'masters-thesis';
}

// ── Digital humanities projects ──────────────────────────────────────────────

/** "2018-2023" → its start and end; an open range ("2023-") ends at Infinity. */
export function parseProjectYears(years: string): { start: number; end: number } {
	const [startStr = '', endStr] = years.split('-');
	const start = parseInt(startStr, 10);
	const ongoing = years.endsWith('-');
	const end = ongoing ? Infinity : endStr ? parseInt(endStr, 10) : start;
	return { start, end };
}

/**
 * Strictly most recent first, ignoring the DH index's featured/order fields:
 * by start year, so a focused recent project (2023) outranks a long-running
 * older one (2018-24); then by end year, so an ongoing project beats a closed
 * one that started the same year; then by title. Sorts a copy.
 */
export function sortDhProjectsByRecency<T extends { years: string; title: string }>(
	projects: readonly T[]
): T[] {
	return [...projects].sort((a, b) => {
		const ay = parseProjectYears(a.years);
		const by = parseProjectYears(b.years);
		if (ay.start !== by.start) return by.start - ay.start;
		if (ay.end !== by.end) return by.end - ay.end;
		return a.title.localeCompare(b.title);
	});
}

// ── Talks ────────────────────────────────────────────────────────────────────

/**
 * The talks each CV section lists, by type, keeping the dataset's order:
 * invited talks (lectures, seminars, workshops), the three kinds of
 * conference participation, the events organised, and the podcasts printed
 * under Media. A talk given as teaching is held back from all of them for
 * the Teaching section (`teaching`), so the CV prints it once.
 */
export function splitCvTalks<T extends Pick<CvCommunication, 'type' | 'teaching'>>(
	talks: readonly T[]
) {
	const given = talks.filter((talk) => !talk.teaching);
	const ofType = (...types: Array<CvCommunication['type']>) =>
		given.filter((talk) => types.includes(talk.type));
	return {
		invited: ofType('lecture', 'seminar', 'workshop'),
		panels: ofType('panel'),
		papers: ofType('conference'),
		posters: ofType('poster'),
		events: ofType('event'),
		podcasts: ofType('podcast'),
		teaching: talks.filter((talk) => talk.teaching)
	};
}

/**
 * The venue an invited talk prints. A panel appearance carries the event
 * itself as its title, so printing the conference alongside would repeat it
 * verbatim ("University of Kansas AI and Africa Symposium", *AI and Africa
 * Symposium*); it is printed only when it adds something.
 */
export function invitedTalkVenue(talk: Pick<CvCommunication, 'title' | 'conference'>): string {
	return talk.conference && !talk.title.includes(talk.conference) ? talk.conference : '';
}

/** An organised panel is listed under the panel's own title, when it has one. */
export function organisedPanelTitle(talk: Pick<CvCommunication, 'title' | 'panelTitle'>): string {
	return talk.panelTitle || talk.title;
}

/**
 * An event's date as the CV prints it beside the year key: a multi-day range
 * keeps its authored form minus the year ("12-14 March"), a single day is
 * "23 September".
 */
export function cvEventDate(talk: Pick<CvCommunication, 'date' | 'dateISO'>): string {
	return talk.date.includes('-')
		? talk.date.replace(/\s+\d{4}$/, '')
		: formatDayMonth(talk.dateISO);
}

// ── Teaching ─────────────────────────────────────────────────────────────────

/** Courses, newest first by the first year of their span ("2019-2020"). Sorts a copy. */
export function sortCoursesByYear<T extends Pick<TeachingExperience, 'year'>>(
	courses: readonly T[]
): T[] {
	const firstYear = (course: T) => parseInt(course.year.split('-')[0] ?? course.year, 10);
	return [...courses].sort((a, b) => firstYear(b) - firstYear(a));
}

/** The fields a talk given as teaching needs to stand as a lecture row. */
export type TeachingTalk = Pick<
	CvCommunication,
	'id' | 'title' | 'conference' | 'date' | 'dateISO' | 'teaching'
>;

/** A talk given as teaching, as a guest-lecture row: its course defaults to the talk's venue. */
export function talkAsLecture(talk: TeachingTalk): TeachingLecture {
	const teaching = talk.teaching;
	return {
		year: talk.dateISO.slice(0, 4),
		title: talk.title,
		course: teaching?.course ?? talk.conference,
		institution: teaching?.institution ?? talk.conference,
		level: teaching?.level,
		date: talk.date,
		dateISO: talk.dateISO,
		talkId: talk.id
	};
}

/**
 * Every lecture the teaching record lists: the guest lectures and the talks
 * given as teaching (talks without `teaching` are skipped), newest first by
 * date. One list for the CV's Teaching section, `/teaching`,
 * `/teaching/guest-lectures`, their twins and `/api/cv.json`.
 */
export function teachingLectures(
	lectures: readonly GuestLecture[],
	talks: readonly TeachingTalk[]
): TeachingLecture[] {
	return [...lectures, ...talks.filter((talk) => talk.teaching).map(talkAsLecture)].sort((a, b) =>
		b.dateISO.localeCompare(a.dateISO)
	);
}

/** "Undergraduate" or "Graduate". */
export function teachingLevelLabel(level: TeachingExperience['level']): string {
	return level === 'undergraduate' ? 'Undergraduate' : 'Graduate';
}

/** A lecture's host and level as the CV prints them: "Université Laval (Canada), Graduate". */
export function lectureHostAndLevel(
	lecture: Pick<TeachingLecture, 'institution' | 'level'>
): string {
	return lecture.level
		? `${lecture.institution}, ${teachingLevelLabel(lecture.level)}`
		: lecture.institution;
}

// ── Research experience ──────────────────────────────────────────────────────

/**
 * Fieldwork grouped by place, keyed by every year the place was visited. The
 * years are read from the trip's own date string, so a cross-year trip
 * ("November 2014 - April 2015") counts both; a date with no year in it falls
 * back to the record's `year`. Years run newest first, places alphabetically.
 */
export function groupFieldworkByPlace(
	fieldworks: readonly Pick<Fieldwork, 'city' | 'country' | 'date' | 'year'>[]
): Array<{ location: string; years: number[] }> {
	const byPlace = new Map<string, Set<number>>();
	for (const fieldwork of fieldworks) {
		const location = `${fieldwork.city}, ${fieldwork.country}`;
		const years = byPlace.get(location) ?? new Set<number>();
		byPlace.set(location, years);
		const inDate = fieldwork.date.match(/\b(19|20)\d{2}\b/g);
		if (inDate && inDate.length > 0) for (const year of inDate) years.add(Number(year));
		else years.add(fieldwork.year);
	}
	return [...byPlace]
		.map(([location, years]) => ({ location, years: [...years].sort((a, b) => b - a) }))
		.sort((a, b) => a.location.localeCompare(b.location));
}

// ── Service ──────────────────────────────────────────────────────────────────

/** Peer reviews minus the template record and its placeholder journal. */
export function realPeerReviews<T extends Pick<PeerReview, 'id' | 'journal'>>(
	reviews: readonly T[]
): T[] {
	return reviews.filter(
		(review) => !review.id.includes('template') && review.journal !== 'Journal Name'
	);
}

/** Editorial memberships minus the template record. */
export function realEditorialMemberships<T extends Pick<EditorialMembership, 'id'>>(
	memberships: readonly T[]
): T[] {
	return memberships.filter((membership) => !membership.id.includes('template'));
}
