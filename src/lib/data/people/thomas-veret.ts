import type { Person } from '$lib/types/person';

export const person: Person = {
	id: 'thomas-veret',
	name: 'Thomas Veret',
	affiliations: [
		{
			institution: 'Sorbonne Nouvelle University',
			years: [2022],
			confidence: 'verified',
			sources: [
				{
					url: 'https://github.com/fmadore/Remoboko/blob/7ad827a08e1866cbd35eb817c79fd7e81bb0e7ce/Final%20report/Data/Publications_and_activities_data.json',
					label: 'Dated workshop report',
					quote:
						'Thomas Veret (Institut de Linguistique et Phonétique Générales et Appliquées (ILPGA), Université Paris 3 Sorbonne Nouvelle)'
				}
			],
			institutionId: 'sorbonne-nouvelle-university',
			reviewNote:
				'Report dated 2023-02-17 explicitly describes the 2022 workshop. Title: Report of the Workshop "Religions on Campus: Coexisting Traditions, Reformulating the Secular and Life Projects"'
		}
	]
};
