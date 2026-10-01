import type { Person } from '$lib/types/person';

export const person: Person = {
	id: 'olubunmi-olowookere',
	name: 'Olubunmi  Olowookere',
	affiliations: [
		{
			institution: 'University of Ibadan',
			years: [2021],
			confidence: 'uncertain',
			sources: [
				{
					url: 'https://github.com/fmadore/Website/blob/main/src/lib/data/communications/events/workshop-religion-in-higher-educational-institutions-2021.ts',
					label: 'Existing site data',
					quote:
						"{ name: 'Olubunmi  Olowookere', role: 'Speaker', affiliation: 'University of Ibadan, Nigeria' }"
				}
			],
			institutionId: 'university-of-ibadan',
			note: 'Evidence supports 2021; continuous employment is not inferred. Existing website affiliation; independent event-year confirmation was not obtained. Remoboko project report collaborator registry also lists University of Ibadan, but has no per-person date; this does not independently verify the event-year affiliation.'
		}
	]
};
