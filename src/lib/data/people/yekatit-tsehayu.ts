import type { Person } from '$lib/types/person';

export const person: Person = {
	id: 'yekatit-tsehayu',
	name: 'Yekatit Tsehayu',
	affiliations: [
		{
			institution: 'University of Florida',
			years: [2023],
			confidence: 'uncertain',
			sources: [
				{
					url: 'https://github.com/fmadore/Website/blob/250c6bce6209ccaee96e7c136251a969bfc97ae8/src/lib/data/communications/events/university-campuses-africa.ts',
					label: 'Event record (this site’s data)',
					quote:
						"{\n\t\t\tname: 'Yekatit Tsehayu',\n\t\t\trole: 'Speaker',\n\t\t\taffiliation: 'University of Florida, United States'\n\t\t}"
				}
			],
			institutionId: 'university-of-florida',
			reviewNote:
				'Existing website affiliation; independent event-year confirmation was not obtained.'
		}
	]
};
