import type { Person } from '$lib/types/person';

export const person: Person = {
	id: 'eva-spies',
	name: 'Eva Spies',
	affiliations: [
		{
			institution: 'University of Bayreuth',
			years: [2023],
			confidence: 'uncertain',
			sources: [
				{
					url: 'https://github.com/fmadore/Website/blob/main/src/lib/data/communications/events/university-campuses-africa.ts',
					label: 'Existing site data',
					quote:
						"{ name: 'Eva Spies', role: 'Discussant', affiliation: 'Universität Bayreuth, Germany' }"
				}
			],
			institutionId: 'university-of-bayreuth',
			note: 'Uncertain affiliation considered for 2023; continuous employment is not inferred. Existing website affiliation; independent event-year confirmation was not obtained. Remoboko project report collaborator registry also lists University of Bayreuth, but has no per-person date; this does not independently verify the event-year affiliation.'
		}
	]
};
