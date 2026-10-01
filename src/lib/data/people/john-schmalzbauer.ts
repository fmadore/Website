import type { Person } from '$lib/types/person';

export const person: Person = {
	id: 'john-schmalzbauer',
	name: 'John Schmalzbauer',
	affiliations: [
		{
			institution: 'Missouri State University',
			years: [2023],
			confidence: 'uncertain',
			sources: [
				{
					url: 'https://github.com/fmadore/Website/blob/main/src/lib/data/communications/events/university-campuses-africa.ts',
					label: 'Existing site data',
					quote:
						"{\n\t\t\tname: 'John Schmalzbauer',\n\t\t\trole: 'Speaker',\n\t\t\taffiliation: 'Missouri State University, United States'\n\t\t}"
				}
			],
			institutionId: 'missouri-state-university',
			note: 'Uncertain affiliation considered for 2023; continuous employment is not inferred. Existing website affiliation; independent event-year confirmation was not obtained. Remoboko project report collaborator registry also lists Missouri State University, but has no per-person date; this does not independently verify the event-year affiliation.'
		}
	]
};
