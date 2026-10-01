import type { Person } from '$lib/types/person';

export const person: Person = {
	id: 'mounkaila-abdou',
	name: 'Mounkaila Abdou',
	affiliations: [
		{
			institution: 'Abdou Moumouni University',
			years: [2022],
			confidence: 'verified',
			sources: [
				{
					url: 'https://github.com/fmadore/Remoboko/blob/master/Final%20report/Data/Publications_and_activities_data.json',
					label: 'Dated workshop report mirror',
					quote: 'Mounkaila Abdou (UAM)'
				}
			],
			institutionId: 'abdou-moumouni-university',
			note: 'Evidence supports 2022; continuous employment is not inferred. Report dated 2023-02-17 explicitly describes the 2022 workshop. Title: Report of the Workshop "Religions on Campus: Coexisting Traditions, Reformulating the Secular and Life Projects"'
		}
	]
};
