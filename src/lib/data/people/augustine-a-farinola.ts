import type { Person } from '$lib/types/person';

export const person: Person = {
	id: 'augustine-a-farinola',
	name: 'Augustine A. Farinola',
	affiliations: [
		{
			institution: 'University of Alberta',
			years: [2026],
			confidence: 'verified',
			sources: [
				{
					url: 'https://github.com/fmadore/stias-dh-ai-workshop-2026/blob/affa349febbfc360ec7504ad8e3e8bb25c2aef9d/src/lib/data/participants/augustine-farinola.ts',
					label: 'Organizer website source',
					quote: "name: 'Augustine A. Farinola',\n\taffiliation: {\n\t\ten: 'University of Alberta'"
				}
			],
			institutionId: 'university-of-alberta',
			reviewNote:
				'Affiliation explicitly listed by the 2026 workshop organizer; evidence supports 2026 only, not an open-ended appointment.'
		}
	]
};
