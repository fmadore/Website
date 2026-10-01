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
					url: 'https://github.com/fmadore/Website/blob/main/src/lib/data/communications/events/university-campuses-africa.ts',
					label: 'Existing site data',
					quote:
						"{\n\t\t\tname: 'Lucie Revilla',\n\t\t\trole: 'Speaker',\n\t\t\taffiliation: 'Institut de Recherche pour le Développement, France'\n\t\t}"
				}
			],
			note: 'Evidence supports 2023; continuous employment is not inferred. Existing website affiliation; independent event-year confirmation was not obtained. Remoboko project report collaborator registry also lists Les Afriques dans le monde, but has no per-person date; this does not independently verify the event-year affiliation. Institutional coordinates are unresolved; this affiliation remains unpinned.'
		}
	]
};
