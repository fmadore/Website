import type { Person } from '$lib/types/person';

export const person: Person = {
	id: 'jules-mansaly',
	name: 'Jules Mansaly',
	affiliations: [
		{
			institution: 'University of the Gambia',
			years: [2026],
			confidence: 'verified',
			sources: [
				{
					url: 'https://github.com/fmadore/stias-dh-ai-workshop-2026/blob/affa349febbfc360ec7504ad8e3e8bb25c2aef9d/src/lib/data/participants/jules-mansaly.ts',
					label: 'Organizer website source',
					quote: "name: 'Jules Mansaly',\n\taffiliation: {\n\t\ten: 'University of the Gambia'"
				}
			],
			institutionId: 'university-of-the-gambia',
			reviewNote:
				'Affiliation explicitly listed by the 2026 workshop organizer; evidence supports 2026 only, not an open-ended appointment.'
		}
	]
};
