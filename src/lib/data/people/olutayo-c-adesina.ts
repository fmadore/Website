import type { Person } from '$lib/types/person';

export const person: Person = {
	id: 'olutayo-c-adesina',
	name: 'Olutayo C. Adesina',
	affiliations: [
		{
			institution: 'University of Ibadan',
			years: [2023],
			confidence: 'uncertain',
			sources: [
				{
					url: 'https://github.com/fmadore/Website/blob/250c6bce6209ccaee96e7c136251a969bfc97ae8/src/lib/data/communications/events/university-campuses-africa.ts',
					label: 'Event record (this site’s data)',
					quote:
						"{ name: 'Olutayo C. Adesina', role: 'Speaker', affiliation: 'University of Ibadan, Nigeria' }"
				}
			],
			institutionId: 'university-of-ibadan',
			reviewNote:
				'Existing website affiliation; independent event-year confirmation was not obtained.'
		}
	]
};
