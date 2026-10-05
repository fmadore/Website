import type { Person } from '$lib/types/person';

export const person: Person = {
	id: 'john-oluwafemi-daniel',
	name: 'John Oluwafemi Daniel',
	affiliations: [
		{
			institution: 'University of Ibadan',
			years: [2026],
			confidence: 'verified',
			sources: [
				{
					url: 'https://github.com/fmadore/stias-dh-ai-workshop-2026/blob/affa349febbfc360ec7504ad8e3e8bb25c2aef9d/src/lib/data/participants/john-daniel.ts',
					label: 'Organizer website source',
					quote: "name: 'John Oluwafemi Daniel',\n\taffiliation: {\n\t\ten: 'University of Ibadan'"
				}
			],
			institutionId: 'university-of-ibadan',
			reviewNote:
				'Affiliation explicitly listed by the 2026 workshop organizer; evidence supports 2026 only, not an open-ended appointment.'
		}
	]
};
