import type { Person } from '$lib/types/person';

export const person: Person = {
	id: 'rebecca-babirye',
	name: 'Rebecca Babirye',
	affiliations: [
		{
			institution: 'Tokyo Christian University',
			years: [2023],
			confidence: 'uncertain',
			sources: [
				{
					url: 'https://github.com/fmadore/Website/blob/main/src/lib/data/communications/events/university-campuses-africa.ts',
					label: 'Existing site data',
					quote:
						"{ name: 'Rebecca Babirye', role: 'Speaker', affiliation: 'Tokyo Christian University, Japan' }"
				}
			],
			note: 'Evidence supports 2023; continuous employment is not inferred. Existing website affiliation; independent event-year confirmation was not obtained. Remoboko project report collaborator registry also lists Tokyo Christian University, but has no per-person date; this does not independently verify the event-year affiliation. Institutional coordinates are unresolved; this affiliation remains unpinned.'
		}
	]
};
