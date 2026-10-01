import type { Person } from '$lib/types/person';

export const person: Person = {
	id: 'christine-mataranyika',
	name: 'Christine Mataranyika',
	affiliations: [
		{
			institution: 'University of the Witwatersrand',
			years: [2026],
			confidence: 'verified',
			sources: [
				{
					url: 'https://github.com/fmadore/stias-dh-ai-workshop-2026/blob/main/src/lib/data/participants/christine-mataranyika.ts',
					label: 'Organizer website source',
					quote:
						"name: 'Christine Mataranyika',\n\taffiliation: {\n\t\ten: 'University of the Witwatersrand'"
				}
			],
			institutionId: 'university-of-the-witwatersrand',
			note: 'Evidence supports 2026; continuous employment is not inferred. Affiliation explicitly listed by the 2026 workshop organizer; evidence supports 2026 only, not an open-ended appointment.'
		}
	]
};
