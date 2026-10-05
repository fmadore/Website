import type { Person } from '$lib/types/person';

export const person: Person = {
	id: 'laure-assaf',
	name: 'Laure Assaf',
	affiliations: [
		{
			institution: 'New York University Abu Dhabi',
			years: [2023],
			confidence: 'uncertain',
			sources: [
				{
					url: 'https://github.com/fmadore/Website/blob/250c6bce6209ccaee96e7c136251a969bfc97ae8/src/lib/data/communications/events/university-campuses-africa.ts',
					label: 'Event record (this site’s data)',
					quote:
						"{ name: 'Laure Assaf', role: 'Speaker', affiliation: 'NYU Abu Dhabi, United Arab Emirates' }"
				}
			],
			institutionId: 'new-york-university-abu-dhabi',
			reviewNote:
				'Existing website affiliation; independent event-year confirmation was not obtained. Remoboko project report collaborator registry also lists New York University Abu Dhabi, but has no per-person date; this does not independently verify the event-year affiliation.'
		}
	]
};
