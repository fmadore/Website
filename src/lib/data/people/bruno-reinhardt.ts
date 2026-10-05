import type { Person } from '$lib/types/person';

export const person: Person = {
	id: 'bruno-reinhardt',
	name: 'Bruno Reinhardt',
	affiliations: [
		{
			institution: 'Universidade Federal de Santa Catarina',
			years: [2023],
			confidence: 'uncertain',
			sources: [
				{
					url: 'https://github.com/fmadore/Website/blob/250c6bce6209ccaee96e7c136251a969bfc97ae8/src/lib/data/communications/events/university-campuses-africa.ts',
					label: 'Event record (this site’s data)',
					quote:
						"{\n\t\t\tname: 'Bruno Reinhardt',\n\t\t\trole: 'Speaker',\n\t\t\taffiliation: 'Universidade Federal de Santa Catarina, Brazil'\n\t\t}"
				}
			],
			institutionId: 'universidade-federal-de-santa-catarina',
			reviewNote:
				'Existing website affiliation; independent event-year confirmation was not obtained. Remoboko project report collaborator registry also lists Universidade Federal de Santa Catarina, but has no per-person date; this does not independently verify the event-year affiliation.'
		}
	]
};
