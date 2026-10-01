import type { Person } from '$lib/types/person';

export const person: Person = {
	id: 'abdoulbaki-djibo',
	name: 'Abdoulbaki Djibo',
	affiliations: [
		{
			institution: 'Abdou Moumouni University',
			years: [2021],
			confidence: 'verified',
			sources: [
				{
					url: 'https://github.com/fmadore/Remoboko/blob/master/Final%20report/Data/Publications_and_activities_data.json',
					label: 'Dated workshop report mirror',
					quote: 'Abdoulbaki Djibo (Universite Abdou Moumouni)'
				}
			],
			institutionId: 'abdou-moumouni-university',
			note: 'Evidence supports 2021; continuous employment is not inferred. Report dated 2022-01-24 explicitly describes the 2021 workshop. Title: Report – Workshop 16-17 November, 2021'
		},
		{
			institution: 'Abdou Moumouni University',
			years: [2022],
			confidence: 'verified',
			sources: [
				{
					url: 'https://github.com/fmadore/Remoboko/blob/master/Final%20report/Data/Publications_and_activities_data.json',
					label: 'Dated workshop report mirror',
					quote: 'Abdoulbaki Djibo (UAM)'
				}
			],
			institutionId: 'abdou-moumouni-university',
			note: 'Evidence supports 2022; continuous employment is not inferred. Report dated 2023-02-17 explicitly describes the 2022 workshop. Title: Report of the Workshop "Religions on Campus: Coexisting Traditions, Reformulating the Secular and Life Projects"'
		}
	]
};
