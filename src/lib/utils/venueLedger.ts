/**
 * The publication venues, as a ranked ledger.
 *
 * This replaces a two-level treemap. At this corpus's shape — some thirty
 * venues, most of which carry exactly one work — a treemap can only tile the
 * plate into near-equal rectangles too small to name: area encoded nothing,
 * and the labels were the first casualty. A ranked list states the same tally
 * exactly. Every venue that carries more than one work gets a row of its own,
 * with one mark per work; the long tail of single appearances is set as one
 * run, which is what it is.
 *
 * Pure, so the rule deciding which publication counts under which venue is
 * unit tested here rather than buried in the page.
 */

export type VenueGroupKey = 'journals' | 'publishers';

/** The fields of a publication the venue rule reads. */
export interface VenueSource {
	id: string;
	title: string;
	year: number;
	type: string;
	journal?: string;
	publisher?: string;
	series?: string;
}

/** One work, as the ledger links it. */
export interface VenueWork {
	id: string;
	title: string;
	year: number;
}

export interface Venue {
	name: string;
	/** Oldest first, so a row reads as the venue's history with the author. */
	works: VenueWork[];
}

export interface VenueGroup {
	key: VenueGroupKey;
	label: string;
	/** Venues carrying more than one work: most works first, then by name. */
	ranked: Venue[];
	/** Venues carrying exactly one work, alphabetical: the long tail. */
	singles: Venue[];
	venueCount: number;
	workCount: number;
}

export interface VenueLedger {
	/** Journals and series first, book publishers second; empty groups dropped. */
	groups: VenueGroup[];
	venueCount: number;
	workCount: number;
	/** The most works any one venue carries: the width of the mark column. */
	maxWorks: number;
}

const GROUP_LABELS: Record<VenueGroupKey, string> = {
	journals: 'Journals and series',
	publishers: 'Book publishers'
};

const GROUP_ORDER: readonly VenueGroupKey[] = ['journals', 'publishers'];

function named(group: VenueGroupKey, name: string | undefined) {
	const trimmed = name?.trim();
	return trimmed ? { group, name: trimmed } : null;
}

/**
 * Where a publication appeared, or null when it has no venue to count.
 *
 * Articles, special issues and bulletin pieces count under their journal.
 * Reports count under their publisher and working papers under their numbered
 * series; both are periodical venues, so they sit with the journals. Books,
 * chapters and encyclopedia entries count under the book publisher. Everything
 * else (theses, blog posts, reviews) has no venue in this sense.
 */
export function venueOf(pub: VenueSource): { group: VenueGroupKey; name: string } | null {
	switch (pub.type) {
		case 'article':
		case 'special-issue':
		case 'bulletin-article':
			return named('journals', pub.journal);
		case 'report':
			return named('journals', pub.publisher);
		case 'working-paper':
			return named('journals', pub.series || pub.journal || pub.publisher);
		case 'book':
		case 'chapter':
		case 'encyclopedia':
			return named('publishers', pub.publisher);
		default:
			return null;
	}
}

const byName = (a: Venue, b: Venue) => a.name.localeCompare(b.name);

/** Group the publications by venue and rank each group's venues. */
export function buildVenueLedger(publications: readonly VenueSource[]): VenueLedger {
	const buckets: Record<VenueGroupKey, Map<string, VenueWork[]>> = {
		journals: new Map(),
		publishers: new Map()
	};

	for (const pub of publications) {
		const venue = venueOf(pub);
		if (!venue) continue;
		const bucket = buckets[venue.group];
		const works = bucket.get(venue.name) ?? [];
		works.push({ id: pub.id, title: pub.title, year: pub.year });
		bucket.set(venue.name, works);
	}

	const groups = GROUP_ORDER.filter((key) => buckets[key].size > 0).map((key): VenueGroup => {
		const venues = [...buckets[key]].map(([name, works]) => ({
			name,
			works: works.sort((a, b) => a.year - b.year || a.title.localeCompare(b.title))
		}));
		return {
			key,
			label: GROUP_LABELS[key],
			ranked: venues
				.filter((v) => v.works.length > 1)
				.sort((a, b) => b.works.length - a.works.length || byName(a, b)),
			singles: venues.filter((v) => v.works.length === 1).sort(byName),
			venueCount: venues.length,
			workCount: venues.reduce((sum, v) => sum + v.works.length, 0)
		};
	});

	return {
		groups,
		venueCount: groups.reduce((sum, g) => sum + g.venueCount, 0),
		workCount: groups.reduce((sum, g) => sum + g.workCount, 0),
		maxWorks: Math.max(1, ...groups.flatMap((g) => g.ranked.map((v) => v.works.length)))
	};
}
