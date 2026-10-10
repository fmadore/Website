export interface GuestLecture {
	year: string;
	title: string;
	course: string;
	institution: string;
	level: 'undergraduate' | 'graduate';
	date: string;
	/** The date as YYYY-MM-DD, which orders the lectures among the talks given as teaching. */
	dateISO: string;
}

/**
 * A row of the guest-lecture lists (/teaching, /teaching/guest-lectures, the
 * CV and their twins): a `GuestLecture` record, or a talk given as teaching
 * (`Communication.teaching`), which may name no level and links to its page.
 */
export interface TeachingLecture extends Omit<GuestLecture, 'level'> {
	level?: GuestLecture['level'];
	/** The talk's id, when the row is a talk on record: its page is /communications/<id>. */
	talkId?: string;
}

export interface TeachingExperience {
	id: string;
	year: string;
	title: string;
	institution: string;
	level: 'undergraduate' | 'graduate';
	period?: string;
	syllabusUrl?: string;
	sections?: string;
	/**
	 * What the course covers, in the scholar's own words. Held on the record
	 * rather than in a route: `/teaching` prints it as the ledger description,
	 * `/api/cv.json` publishes it, and the CV's citation-style line omits it.
	 */
	description?: string;
}
