export interface GuestLecture {
	year: string;
	title: string;
	course: string;
	institution: string;
	level: 'undergraduate' | 'graduate';
	date: string;
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
