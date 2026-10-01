import type { Person } from '$lib/types/person';

export const person: Person = {
	id: 'oreen-yousuf',
	name: 'Oreen Yousuf',
	affiliations: [
		{
			institution: 'Uppsala University',
			years: [2026],
			confidence: 'verified',
			sources: [
				{
					url: 'https://github.com/fmadore/stias-dh-ai-workshop-2026/blob/main/src/lib/data/participants/oreen-yousuf.ts',
					label: 'Organizer website source',
					quote: "name: 'Oreen Yousuf',\n\taffiliation: {\n\t\ten: 'Uppsala University'"
				}
			],
			institutionId: 'uppsala-university',
			note: 'Evidence supports 2026; continuous employment is not inferred. Affiliation explicitly listed by the 2026 workshop organizer; evidence supports 2026 only, not an open-ended appointment.'
		}
	]
};
