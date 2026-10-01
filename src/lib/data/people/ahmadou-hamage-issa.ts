import type { Person } from '$lib/types/person';

export const person: Person = {
	id: 'ahmadou-hamage-issa',
	name: 'Ahmadou Hamage Issa',
	affiliations: [
		{
			institution: 'Abdou Moumouni University',
			years: [2021],
			confidence: 'verified',
			sources: [
				{
					url: 'https://github.com/fmadore/Remoboko/blob/master/Final%20report/Data/Publications_and_activities_data.json',
					label: 'Dated workshop report mirror',
					quote: 'Ahmadou Hamage Issa (Université Abdou Moumouni)'
				}
			],
			institutionId: 'abdou-moumouni-university',
			note: 'Evidence supports 2021; continuous employment is not inferred. Report dated 2022-01-24 explicitly describes the 2021 workshop. Title: Report – Workshop 16-17 November, 2021'
		}
	]
};
