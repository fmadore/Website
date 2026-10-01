import type { Person } from '$lib/types/person';

export const person: Person = {
	id: 'hammed-olalekan-lawal',
	name: 'Hammed Olalekan Lawal',
	affiliations: [
		{
			institution: 'University of Bayreuth',
			years: [2026],
			confidence: 'verified',
			sources: [
				{
					url: 'https://github.com/fmadore/stias-dh-ai-workshop-2026/blob/main/src/lib/data/participants/hammed-olalekan-lawal.ts',
					label: 'Organizer website source',
					quote:
						"name: 'Hammed Olalekan Lawal',\n\taffiliation: {\n\t\ten: 'University of Bayreuth'"
				}
			],
			institutionId: 'university-of-bayreuth',
			note: 'Evidence supports 2026; continuous employment is not inferred. Affiliation explicitly listed by the 2026 workshop organizer; evidence supports 2026 only, not an open-ended appointment.'
		}
	]
};
