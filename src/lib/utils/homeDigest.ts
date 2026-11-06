/**
 * The home page's digest of the datasets: the books, the promoted writing, the
 * talks still to come, and publications and talks per year. Pure, and run by
 * the home page's server load, so the page ships these few rows rather than
 * the summaries they are cut from.
 */
import type { Publication } from '#lib/types/publication.ts';
import type { Communication } from '#lib/types/communication.ts';
import { isForthcoming } from '#lib/utils/date-formatter.ts';

type PublicationRow = Pick<
	Publication,
	| 'id'
	| 'type'
	| 'title'
	| 'date'
	| 'dateISO'
	| 'year'
	| 'image'
	| 'isEditedVolume'
	| 'journal'
	| 'book'
	| 'proceedingsTitle'
	| 'conferenceName'
	| 'series'
	| 'publisher'
>;

type TalkRow = Pick<Communication, 'id' | 'title' | 'dateISO' | 'year'>;

export interface HomeBook {
	id: string;
	title: string;
	year: number;
	image: string;
	edited: boolean;
}

export interface HomeWriting {
	id: string;
	title: string;
	year: number;
	/** What the ledger key prints: the year, or "Forthcoming" for unpublished work. */
	when: string;
	venue?: string;
}

export interface HomeTalk {
	id: string;
	title: string;
	dateISO: string;
}

export interface OutputYear {
	year: number;
	publications: number;
	talks: number;
}

export interface OutputRecord {
	/** One row per year from the first to the last, empty years included. */
	years: OutputYear[];
	publications: number;
	talks: number;
}

/** Newest first, by ISO date; a bare year sorts before any date within it. */
const byDateDesc = <T extends { dateISO: string }>(a: T, b: T) =>
	b.dateISO.localeCompare(a.dateISO);

/** A title without its subtitle: what a cover caption has room for. */
export function mainTitle(title: string): string {
	return title.split(/:\s/)[0]!.trim();
}

/** The books with a cover, newest first. Edited volumes are marked, not left out. */
export function homeBooks(publications: readonly PublicationRow[]): HomeBook[] {
	return publications
		.filter((p) => p.type === 'book' && p.image)
		.sort(byDateDesc)
		.map(({ id, title, year, image, isEditedVolume }) => ({
			id,
			title: mainTitle(title),
			year,
			image: image as string,
			edited: Boolean(isEditedVolume)
		}));
}

/** Where a piece of writing appeared, in the order a reader would name it. */
export function venueOf(publication: PublicationRow): string | undefined {
	return (
		publication.journal ??
		publication.book ??
		publication.proceedingsTitle ??
		publication.conferenceName ??
		publication.series ??
		publication.publisher
	);
}

/**
 * Kinds of writing the home page leaves to the index: notes and posts about
 * the work, rather than the work. Books are shown as covers instead.
 */
const NOT_LATEST = new Set(['book', 'bulletin-article', 'blogpost']);

function toWriting(p: PublicationRow): HomeWriting {
	const venue = venueOf(p);
	const when = isForthcoming(p) ? 'Forthcoming' : String(p.year);
	return { id: p.id, title: p.title, year: p.year, when, ...(venue ? { venue } : {}) };
}

/** The newest scholarly writing other than books. */
export function latestWriting(
	publications: readonly PublicationRow[],
	limit: number
): HomeWriting[] {
	return publications
		.filter((p) => !NOT_LATEST.has(p.type))
		.sort(byDateDesc)
		.slice(0, limit)
		.map(toWriting);
}

/**
 * The publications picked in `ids`, in that order. An id that names no
 * publication throws, so a mistyped pick fails the build rather than
 * vanishing from the page.
 */
export function featuredWriting(
	publications: readonly PublicationRow[],
	ids: readonly string[]
): HomeWriting[] {
	const byId = new Map(publications.map((p) => [p.id, p]));
	return ids.map((id) => {
		const publication = byId.get(id);
		if (!publication) throw new Error(`homeFeatured.ts: no publication has the id "${id}"`);
		return toWriting(publication);
	});
}

/**
 * Talks on or after `today` (an ISO day), soonest first. A talk dated to the
 * month or year only cannot be placed against a day, so it is left out.
 */
export function upcomingTalks(talks: readonly TalkRow[], today: string, limit: number): HomeTalk[] {
	return talks
		.filter((t) => /^\d{4}-\d{2}-\d{2}$/.test(t.dateISO) && t.dateISO >= today)
		.sort((a, b) => a.dateISO.localeCompare(b.dateISO))
		.slice(0, limit)
		.map(({ id, title, dateISO }) => ({ id, title, dateISO }));
}

/** Publications and talks per year, over the full span of either. */
export function outputRecord(
	publications: readonly Pick<PublicationRow, 'year'>[],
	talks: readonly Pick<TalkRow, 'year'>[]
): OutputRecord {
	const count = (rows: readonly { year: number }[]) => {
		const counts = new Map<number, number>();
		for (const { year } of rows) counts.set(year, (counts.get(year) ?? 0) + 1);
		return counts;
	};
	const pubs = count(publications);
	const spoken = count(talks);
	const all = [...pubs.keys(), ...spoken.keys()];
	if (all.length === 0) return { years: [], publications: 0, talks: 0 };

	const years: OutputYear[] = [];
	for (let year = Math.min(...all); year <= Math.max(...all); year++) {
		years.push({ year, publications: pubs.get(year) ?? 0, talks: spoken.get(year) ?? 0 });
	}
	return { years, publications: publications.length, talks: talks.length };
}

/**
 * `2026-10-08` → `08 Oct`. The parts are read from the string and formatted
 * in UTC, so no time zone can move the day.
 */
export function formatDayMonth(dateISO: string): string {
	const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(dateISO);
	if (!match) return dateISO;
	const [, year, month, day] = match;
	const date = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)));
	return `${day} ${date.toLocaleString('en-GB', { month: 'short', timeZone: 'UTC' })}`;
}

/** The year of an ISO date, as written. */
export function yearOf(dateISO: string): string {
	return dateISO.slice(0, 4);
}
