import type { Person } from '$lib/types/person';

export const person: Person = {
	id: 'mahamadou-bello-adamou',
	name: 'Mahamadou Bello Adamou',
	affiliations: [
		{
			institution: 'Abdou Moumouni University',
			years: [2021],
			confidence: 'verified',
			sources: [
				{
					url: 'https://github.com/fmadore/Remoboko/blob/7ad827a08e1866cbd35eb817c79fd7e81bb0e7ce/Final%20report/Data/Publications_and_activities_data.json',
					label: 'Dated workshop report',
					quote: 'Bello Adamou Mahamadou (Université Abdou Moumouni/ZMO)'
				}
			],
			institutionId: 'abdou-moumouni-university',
			reviewNote:
				'Report dated 2022-01-24 explicitly describes the 2021 workshop. Title: Report – Workshop 16-17 November, 2021'
		},
		{
			institution: 'Leibniz-Zentrum Moderner Orient',
			years: [2021],
			confidence: 'verified',
			sources: [
				{
					url: 'https://github.com/fmadore/Remoboko/blob/7ad827a08e1866cbd35eb817c79fd7e81bb0e7ce/Final%20report/Data/Publications_and_activities_data.json',
					label: 'Dated workshop report',
					quote: 'Bello Adamou Mahamadou (Université Abdou Moumouni/ZMO)'
				}
			],
			institutionId: 'leibniz-zentrum-moderner-orient',
			note: 'The dated workshop report names ZMO; this site’s event record names Abdou Moumouni University.',
			reviewNote:
				'Report dated 2022-01-24 explicitly describes the 2021 workshop. Title: Report – Workshop 16-17 November, 2021'
		},
		{
			institution: 'Abdou Moumouni University',
			years: [2022],
			confidence: 'uncertain',
			sources: [
				{
					url: 'https://github.com/fmadore/Website/blob/250c6bce6209ccaee96e7c136251a969bfc97ae8/src/lib/data/communications/events/workshop-religions-on-campus-2022.ts',
					label: 'Event record (this site’s data)',
					quote:
						"{\n\t\t\tname: 'Mahamadou Bello Adamou',\n\t\t\trole: 'Convenor and Speaker',\n\t\t\taffiliation: 'Université Abdou Moumouni, Niger'\n\t\t}"
				}
			],
			institutionId: 'abdou-moumouni-university',
			reviewNote:
				'Existing website affiliation; independent event-year confirmation was not obtained. CONFLICT: existing event record says Abdou Moumouni University; dated report lists ZMO. The report may omit a simultaneous university affiliation.'
		},
		{
			institution: 'Leibniz-Zentrum Moderner Orient',
			years: [2022],
			confidence: 'verified',
			sources: [
				{
					url: 'https://github.com/fmadore/Remoboko/blob/7ad827a08e1866cbd35eb817c79fd7e81bb0e7ce/Final%20report/Data/Publications_and_activities_data.json',
					label: 'Dated workshop report',
					quote: 'Bello Adamou Mahamadou (ZMO)'
				}
			],
			institutionId: 'leibniz-zentrum-moderner-orient',
			reviewNote:
				'Report dated 2023-02-17 explicitly describes the 2022 workshop. Title: Report of the Workshop "Religions on Campus: Coexisting Traditions, Reformulating the Secular and Life Projects"'
		},
		{
			institution: 'Abdou Moumouni University',
			years: [2023],
			confidence: 'uncertain',
			sources: [
				{
					url: 'https://github.com/fmadore/Website/blob/250c6bce6209ccaee96e7c136251a969bfc97ae8/src/lib/data/communications/events/university-campuses-africa.ts',
					label: 'Event record (this site’s data)',
					quote:
						"{\n\t\t\tname: 'Mahamadou Bello Adamou',\n\t\t\trole: 'Speaker',\n\t\t\taffiliation: 'Université Abdou Moumouni, Niger'\n\t\t}"
				}
			],
			institutionId: 'abdou-moumouni-university',
			reviewNote:
				'Existing website affiliation; independent event-year confirmation was not obtained. Remoboko project report collaborator registry also lists Abdou Moumouni University, but has no per-person date; this does not independently verify the event-year affiliation.'
		}
	]
};
