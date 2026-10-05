import type { Person } from '$lib/types/person';

export const person: Person = {
	id: 'mirjam-de-bruijn',
	name: 'Mirjam de Bruijn',
	affiliations: [
		{
			institution: 'Leiden University',
			years: [2026],
			confidence: 'verified',
			sources: [
				{
					url: 'https://github.com/fmadore/stias-dh-ai-workshop-2026/blob/affa349febbfc360ec7504ad8e3e8bb25c2aef9d/src/lib/data/participants/mirjam-de-bruijn.ts',
					label: 'Organizer website source',
					quote: "name: 'Mirjam de Bruijn',\n\taffiliation: {\n\t\ten: 'Leiden University'"
				}
			],
			institutionId: 'leiden-university',
			reviewNote:
				'Affiliation explicitly listed by the 2026 workshop organizer; evidence supports 2026 only, not an open-ended appointment.'
		}
	]
};
