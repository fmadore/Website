export interface GuestLecture {
	year: string;
	title: string;
	course: string;
	institution: string;
	level: 'undergraduate' | 'graduate';
	date: string;
}

const guestLectures: GuestLecture[] = [
	{
		year: '2022',
		title: 'Islam and Muslims in West Africa',
		course: 'Religion in/from Africa',
		institution: 'Universität Bayreuth (Germany)',
		level: 'graduate',
		date: '31 May 2022'
	},
	{
		year: '2020',
		title: 'Colonial Surveillance in French West Africa in the Interwar Period',
		course: 'Politics, Identity and Violence in Africa',
		institution: 'University of Florida (United States)',
		level: 'undergraduate',
		date: '11 September 2020'
	},
	{
		year: '2019',
		title: 'Islam and Muslim Societies in Francophone West Africa',
		course: 'Religions of Africa',
		institution: 'University of Florida (United States)',
		level: 'undergraduate',
		date: '5 September 2019'
	},
	{
		year: '2018',
		title: 'Outils technologiques pour la recherche en histoire',
		course: 'Recherche et rédaction [Research and Writing]',
		institution: 'Université Laval (Canada)',
		level: 'undergraduate',
		date: '16 February 2018'
	},
	{
		year: '2018',
		title: "La recherche historique en Afrique de l'Ouest: enjeux et défis",
		course: "Les sciences historiques aujourd'hui [Historical Sciences Today]",
		institution: 'Université Laval (Canada)',
		level: 'undergraduate',
		date: '5 February 2018'
	},
	{
		year: '2017',
		title: 'Religions et enjeux de pouvoir',
		course: 'Afrique subsaharienne: diversité culturelle et mondialisation [Sub-Saharan Africa: Cultural Diversity and Globalization]',
		institution: 'Université Laval (Canada)',
		level: 'undergraduate',
		date: '3 April 2017'
	},
	{
		year: '2017',
		title: 'Sociétés, religion et politique',
		course: 'Politique et société en Afrique [Politics and Society in Africa]',
		institution: 'Université Laval (Canada)',
		level: 'graduate',
		date: '28 February 2017'
	},
	{
		year: '2017',
		title: 'Outils technologiques pour la recherche doctorale',
		course: 'Projet de thèse [Dissertation Project]',
		institution: 'Université Laval (Canada)',
		level: 'graduate',
		date: '13 January 2017'
	},
	{
		year: '2016',
		title: 'Outils technologiques pour la recherche doctorale',
		course: 'Projet de thèse [Dissertation Project]',
		institution: 'Université Laval (Canada)',
		level: 'graduate',
		date: '1 February 2016'
	}
];

export default guestLectures;
