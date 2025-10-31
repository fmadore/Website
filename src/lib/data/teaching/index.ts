export interface TeachingExperience {
	year: string;
	title: string;
	institution: string;
	level: 'undergraduate' | 'graduate';
	period?: string;
	syllabusUrl?: string;
	sections?: string;
}

const teaching: TeachingExperience[] = [
	{
		year: '2020',
		title: 'The African Past',
		institution: 'University of Ottawa (Canada)',
		level: 'undergraduate',
		period: 'Fall 2020',
		syllabusUrl: '/files/syllabus_the_african_past__fall_2020.pdf'
	},
	{
		year: '2020',
		title: 'Francophone West Africa',
		institution: 'University of Florida (United States)',
		level: 'undergraduate',
		period: 'Spring 2020',
		syllabusUrl: '/files/syllabus-francophone-west-africa.pdf'
	},
	{
		year: '2013-2018',
		title: 'Dissertation historique [Historical writing]',
		institution: 'Université Laval (Canada)',
		level: 'undergraduate',
		sections: '8 sections',
		period: 'Fall 2013-Winter 2018'
	}
];

export default teaching;
