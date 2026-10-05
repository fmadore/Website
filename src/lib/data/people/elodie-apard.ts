import type { Person } from '$lib/types/person';

export const person: Person = {
	id: 'elodie-apard',
	name: 'Élodie Apard',
	affiliations: [
		{
			institution: 'Les Afriques dans le monde',
			years: [2021],
			confidence: 'verified',
			sources: [
				{
					url: 'https://github.com/fmadore/Remoboko/blob/7ad827a08e1866cbd35eb817c79fd7e81bb0e7ce/Final%20report/Data/Publications_and_activities_data.json',
					label: 'Dated workshop report',
					quote: 'Dr. Elodie Apard (LAM)'
				}
			],
			institutionId: 'les-afriques-dans-le-monde',
			reviewNote:
				'Report dated 2022-01-24 explicitly describes the 2021 workshop. Title: Report – Workshop 16-17 November, 2021 CORRECTION: LAM is Les Afriques dans le monde, as expanded in the Remoboko collaborator dataset, not Laboratoire d’Anthropologie Sociale. Additional source: https://github.com/fmadore/Remoboko/blob/7ad827a08e1866cbd35eb817c79fd7e81bb0e7ce/Final%20report/Data/Collaborators_data.json'
		}
	]
};
