import type { Person } from '$lib/types/person';

export const person: Person = {
	id: 'olubunmi-olowookere',
	name: 'Olubunmi Olowookere',
	affiliations: [
		{
			institution: 'University of Ibadan',
			years: [2021],
			confidence: 'uncertain',
			sources: [
				{
					url: 'https://github.com/fmadore/Website/blob/250c6bce6209ccaee96e7c136251a969bfc97ae8/src/lib/data/communications/events/workshop-religion-in-higher-educational-institutions-2021.ts',
					label: 'Event record (this site’s data)',
					quote:
						"{ name: 'Olubunmi  Olowookere', role: 'Speaker', affiliation: 'University of Ibadan, Nigeria' }"
				}
			],
			institutionId: 'university-of-ibadan',
			reviewNote:
				'Existing website affiliation; independent event-year confirmation was not obtained. Remoboko project report collaborator registry also lists University of Ibadan, but has no per-person date; this does not independently verify the event-year affiliation.'
		}
	]
};
