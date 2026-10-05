import type { Person } from '$lib/types/person';

export const person: Person = {
	id: 'sadia-bajwa',
	name: 'Sadia Bajwa',
	affiliations: [
		{
			institution: 'Humboldt University of Berlin',
			years: [2023],
			confidence: 'uncertain',
			sources: [
				{
					url: 'https://github.com/fmadore/Website/blob/250c6bce6209ccaee96e7c136251a969bfc97ae8/src/lib/data/communications/events/university-campuses-africa.ts',
					label: 'Event record (this site’s data)',
					quote:
						"{\n\t\t\tname: 'Sadia Bajwa',\n\t\t\trole: 'Speaker',\n\t\t\taffiliation: 'Humboldt-Universität zu Berlin, Germany'\n\t\t}"
				}
			],
			institutionId: 'humboldt-university-of-berlin',
			reviewNote:
				'Existing website affiliation; independent event-year confirmation was not obtained. Remoboko project report collaborator registry also lists Humboldt University of Berlin, but has no per-person date; this does not independently verify the event-year affiliation.'
		}
	]
};
