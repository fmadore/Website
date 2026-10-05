import type { Person } from '$lib/types/person';

export const person: Person = {
	id: 'abdoulaye-sounaye',
	name: 'Abdoulaye Sounaye',
	affiliations: [
		{
			institution: 'Leibniz-Zentrum Moderner Orient',
			years: [2021],
			confidence: 'verified',
			sources: [
				{
					url: 'https://github.com/fmadore/Remoboko/blob/7ad827a08e1866cbd35eb817c79fd7e81bb0e7ce/Final%20report/Data/Publications_and_activities_data.json',
					label: 'Dated workshop report',
					quote: 'Dr. Abdoulaye Sounaye (ZMO)'
				}
			],
			institutionId: 'leibniz-zentrum-moderner-orient',
			reviewNote:
				'Report dated 2022-01-24 explicitly describes the 2021 workshop. Title: Report – Workshop 16-17 November, 2021'
		},
		{
			institution: 'Leibniz-Zentrum Moderner Orient',
			years: [2022],
			confidence: 'uncertain',
			sources: [
				{
					url: 'https://github.com/fmadore/Website/blob/250c6bce6209ccaee96e7c136251a969bfc97ae8/src/lib/data/communications/events/workshop-religions-on-campus-2022.ts',
					label: 'Event record (this site’s data)',
					quote:
						"{\n\t\t\tname: 'Abdoulaye Sounaye',\n\t\t\trole: 'Convenor and Speaker',\n\t\t\taffiliation: 'Leibniz-Zentrum Moderner Orient'\n\t\t}"
				}
			],
			institutionId: 'leibniz-zentrum-moderner-orient',
			reviewNote:
				'Existing website affiliation; independent event-year confirmation was not obtained.'
		},
		{
			institution: 'Leibniz-Zentrum Moderner Orient',
			years: [2023],
			confidence: 'uncertain',
			sources: [
				{
					url: 'https://github.com/fmadore/Website/blob/250c6bce6209ccaee96e7c136251a969bfc97ae8/src/lib/data/communications/events/university-campuses-africa.ts',
					label: 'Event record (this site’s data)',
					quote:
						"name: 'Abdoulaye Sounaye', role: 'Convenor and Speaker', affiliation: 'Leibniz-Zentrum Moderner Orient'"
				}
			],
			institutionId: 'leibniz-zentrum-moderner-orient',
			reviewNote:
				'Affiliation exists in an event record. Publisher verification and exact publication-year coverage remain unconfirmed; no employment interval inferred. DOI/publisher response redirects to a ZMO proof-of-work challenge despite HTTP200. Existing event affiliation is contextual and has not been verified against the 2023 chapter. Existing event affiliation is contextual and has not been verified against the 2023 publication. Existing website affiliation; independent event-year confirmation was not obtained.'
		}
	]
};
