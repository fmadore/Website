import type { Person } from '$lib/types/person';

export const person: Person = {
	id: 'june-temitope-gbadamosi',
	name: 'June Temitope Gbadamosi',
	affiliations: [
		{
			institution: 'University of Ibadan',
			years: [2021],
			confidence: 'verified',
			sources: [
				{
					url: 'https://github.com/fmadore/Remoboko/blob/master/Final%20report/Data/Publications_and_activities_data.json',
					label: 'Dated workshop report mirror',
					quote: 'June Temitope Gbadamosi (University of Ibadan)'
				}
			],
			institutionId: 'university-of-ibadan',
			note: 'Evidence supports 2021; continuous employment is not inferred. Report dated 2022-01-24 explicitly describes the 2021 workshop. Title: Report – Workshop 16-17 November, 2021'
		}
	]
};
