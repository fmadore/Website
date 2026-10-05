import type { Person } from '$lib/types/person';

export const person: Person = {
	id: 'nadir-abdulhadi-nasidi',
	name: 'Nadir Abdulhadi Nasidi',
	affiliations: [
		{
			institution: 'Ahmadu Bello University',
			years: [2021],
			confidence: 'verified',
			sources: [
				{
					url: 'https://github.com/fmadore/Remoboko/blob/7ad827a08e1866cbd35eb817c79fd7e81bb0e7ce/Final%20report/Data/Publications_and_activities_data.json',
					label: 'Dated workshop report',
					quote: 'Nadir Abdulhadi Nasidi (Ahmadu Bello University)'
				}
			],
			institutionId: 'ahmadu-bello-university',
			reviewNote:
				'Report dated 2022-01-24 explicitly describes the 2021 workshop. Title: Report – Workshop 16-17 November, 2021'
		},
		{
			institution: 'Ahmadu Bello University',
			years: [2022],
			confidence: 'verified',
			sources: [
				{
					url: 'https://github.com/fmadore/Remoboko/blob/7ad827a08e1866cbd35eb817c79fd7e81bb0e7ce/Final%20report/Data/Publications_and_activities_data.json',
					label: 'Dated workshop report',
					quote: 'Nadir A. Nasidi (Ahmadu Bello University)'
				}
			],
			institutionId: 'ahmadu-bello-university',
			reviewNote:
				'Report dated 2023-02-17 explicitly describes the 2022 workshop. Title: Report of the Workshop "Religions on Campus: Coexisting Traditions, Reformulating the Secular and Life Projects"'
		}
	],
	aliases: ['Nadir A. Nasidi']
};
