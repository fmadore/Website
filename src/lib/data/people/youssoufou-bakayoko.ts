import type { Person } from '$lib/types/person';

export const person: Person = {
	id: 'youssoufou-bakayoko',
	name: 'Youssoufou Bakayoko',
	affiliations: [
		{
			institution: 'Université Alassane Ouattara',
			years: [2021],
			confidence: 'verified',
			sources: [
				{
					url: 'https://github.com/fmadore/Remoboko/blob/7ad827a08e1866cbd35eb817c79fd7e81bb0e7ce/Final%20report/Data/Publications_and_activities_data.json',
					label: 'Dated workshop report',
					quote: 'Youssoufou Bakayoko (Universite Alassane Ouat tara)'
				}
			],
			institutionId: 'universite-alassane-ouattara',
			reviewNote:
				'Report dated 2022-01-24 explicitly describes the 2021 workshop. Title: Report – Workshop 16-17 November, 2021'
		}
	]
};
