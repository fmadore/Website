import type { Person } from '$lib/types/person';

export const person: Person = {
	id: 'adejoke-rafiat-adetoro',
	name: 'Adéjọkẹ Rafiat Adétòrò',
	affiliations: [
		{
			institution: 'Leibniz-Zentrum Moderner Orient',
			years: [2021],
			confidence: 'verified',
			sources: [
				{
					url: 'https://github.com/fmadore/Remoboko/blob/7ad827a08e1866cbd35eb817c79fd7e81bb0e7ce/Final%20report/Data/Publications_and_activities_data.json',
					label: 'Dated workshop report',
					quote: 'Adéjoké Rafiat  Adétòrò, (University of Ibadan/ZMO)'
				}
			],
			institutionId: 'leibniz-zentrum-moderner-orient',
			reviewNote:
				'Report dated 2022-01-24 explicitly describes the 2021 workshop. Title: Report – Workshop 16-17 November, 2021'
		},
		{
			institution: 'University of Ibadan',
			years: [2021],
			confidence: 'verified',
			sources: [
				{
					url: 'https://github.com/fmadore/Remoboko/blob/7ad827a08e1866cbd35eb817c79fd7e81bb0e7ce/Final%20report/Data/Publications_and_activities_data.json',
					label: 'Dated workshop report',
					quote: 'Adéjoké Rafiat  Adétòrò, (University of Ibadan/ZMO)'
				}
			],
			institutionId: 'university-of-ibadan',
			reviewNote:
				'Report dated 2022-01-24 explicitly describes the 2021 workshop. Title: Report – Workshop 16-17 November, 2021'
		},
		{
			institution: 'Université Laval',
			years: [2021],
			confidence: 'uncertain',
			sources: [
				{
					url: 'https://github.com/fmadore/Website/blob/250c6bce6209ccaee96e7c136251a969bfc97ae8/src/lib/data/communications/events/workshop-religion-in-higher-educational-institutions-2021.ts',
					label: 'Event record (this site’s data)',
					quote:
						"{\n\t\t\tname: 'Adéjoké Rafiat Adétòrò',\n\t\t\trole: 'Convenor and Speaker',\n\t\t\taffiliation: 'Université Laval, Canada'\n\t\t}"
				}
			],
			institutionId: 'universite-laval',
			note: 'This site’s event record names Université Laval; the dated workshop report names the University of Ibadan and ZMO.',
			reviewNote:
				'Existing website affiliation; independent event-year confirmation was not obtained. CONFLICT: existing record says Université Laval, but the dated workshop report says University of Ibadan/ZMO. Laval remains uncertain.'
		},
		{
			institution: 'University of Ibadan',
			years: [2023],
			confidence: 'uncertain',
			sources: [
				{
					url: 'https://github.com/fmadore/Website/blob/250c6bce6209ccaee96e7c136251a969bfc97ae8/src/lib/data/communications/events/university-campuses-africa.ts',
					label: 'Event record (this site’s data)',
					quote:
						"{\n\t\t\tname: 'Adéjọkẹ Rafiat Adétòrò',\n\t\t\trole: 'Speaker',\n\t\t\taffiliation: 'University of Ibadan, Nigeria'\n\t\t}"
				}
			],
			institutionId: 'university-of-ibadan',
			reviewNote:
				'Existing website affiliation; independent event-year confirmation was not obtained.'
		}
	],
	aliases: ['Adéjoké Rafiat Adétòrò']
};
