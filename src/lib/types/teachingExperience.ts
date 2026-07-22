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
}
