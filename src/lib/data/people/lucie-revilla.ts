import type { Person } from '$lib/types/person';

export const person: Person = {
	id: 'lucie-revilla',
	name: 'Lucie Revilla',
	affiliations: [
		{
			institution: 'Institut de recherche pour le développement',
			years: [2023],
			confidence: 'uncertain',
			sources: [
				{
					url: 'https://github.com/fmadore/Website/blob/250c6bce6209ccaee96e7c136251a969bfc97ae8/src/lib/data/communications/events/university-campuses-africa.ts',
					label: 'Event record (this site’s data)',
					quote:
						"{\n\t\t\tname: 'Lucie Revilla',\n\t\t\trole: 'Speaker',\n\t\t\taffiliation: 'Institut de Recherche pour le Développement, France'\n\t\t}"
				}
			],
			reviewNote:
				'Existing website affiliation; independent event-year confirmation was not obtained. Remoboko project report collaborator registry also lists Les Afriques dans le monde, but has no per-person date; this does not independently verify the event-year affiliation.'
		}
	]
};
