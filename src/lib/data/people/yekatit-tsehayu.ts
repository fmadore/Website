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
					url: 'https://github.com/fmadore/Website/blob/main/src/lib/data/communications/events/university-campuses-africa.ts',
					label: 'Existing site data',
					quote:
						"{\n\t\t\tname: 'Yekatit Tsehayu',\n\t\t\trole: 'Speaker',\n\t\t\taffiliation: 'University of Florida, United States'\n\t\t}"
				}
			],
			institutionId: 'university-of-florida',
			note: 'Evidence supports 2023; continuous employment is not inferred. Existing website affiliation; independent event-year confirmation was not obtained.'
		}
	]
};
