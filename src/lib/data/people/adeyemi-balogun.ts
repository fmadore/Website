import type { Person } from '$lib/types/person';

export const person: Person = {
	id: 'adeyemi-balogun',
	name: 'Adeyemi Balogun',
	affiliations: [
		{
			institution: 'Osun State University',
			years: [2023],
			confidence: 'uncertain',
			sources: [
				{
					url: 'https://github.com/fmadore/Website/blob/250c6bce6209ccaee96e7c136251a969bfc97ae8/src/lib/data/communications/events/university-campuses-africa.ts',
					label: 'Event record (this site’s data)',
					quote:
						"{ name: 'Adeyemi Balogun', role: 'Speaker', affiliation: 'Osun State University, Nigeria' }"
				}
			],
			institutionId: 'osun-state-university',
			reviewNote:
				'Existing website affiliation; independent event-year confirmation was not obtained. Remoboko project report collaborator registry also lists Osun State University, but has no per-person date; this does not independently verify the event-year affiliation.'
		}
	]
};
