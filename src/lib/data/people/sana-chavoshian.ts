import type { Person } from '$lib/types/person';

export const person: Person = {
	id: 'sana-chavoshian',
	name: 'Sana Chavoshian',
	affiliations: [
		{
			institution: 'Leibniz-Zentrum Moderner Orient',
			years: [2023],
			confidence: 'uncertain',
			sources: [
				{
					url: 'https://github.com/fmadore/Website/blob/main/src/lib/data/communications/events/university-campuses-africa.ts',
					label: 'Existing site data',
					quote:
						"{ name: 'Sana Chavoshian', role: 'Discussant', affiliation: 'Leibniz-Zentrum Moderner Orient' }"
				}
			],
			institutionId: 'leibniz-zentrum-moderner-orient',
			note: 'Evidence supports 2023; continuous employment is not inferred. Existing website affiliation; independent event-year confirmation was not obtained. Remoboko project report collaborator registry also lists Leibniz-Zentrum Moderner Orient, but has no per-person date; this does not independently verify the event-year affiliation.'
		}
	]
};
