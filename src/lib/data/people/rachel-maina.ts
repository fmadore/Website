import type { Person } from '$lib/types/person';

export const person: Person = {
	id: 'rachel-maina',
	name: 'Rachel Maina',
	affiliations: [
		{
			institution: 'University of Wisconsin–Madison',
			years: [2026],
			confidence: 'verified',
			sources: [
				{
					url: 'https://github.com/fmadore/stias-dh-ai-workshop-2026/blob/main/src/lib/data/participants/rachel-maina.ts',
					label: 'Organizer website source',
					quote:
						"name: 'Rachel Maina',\n\taffiliation: {\n\t\ten: 'University of Wisconsin–Madison'"
				}
			],
			institutionId: 'university-of-wisconsin-madison',
			note: 'Evidence supports 2026; continuous employment is not inferred. Affiliation explicitly listed by the 2026 workshop organizer; evidence supports 2026 only, not an open-ended appointment.'
		}
	]
};
