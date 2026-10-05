import type { Person } from '$lib/types/person';

export const person: Person = {
	id: 'mohamadou-konate',
	name: 'Mohamadou Konaté',
	affiliations: [
		{
			institution: 'Joseph Ki-Zerbo University',
			years: [2026],
			confidence: 'verified',
			sources: [
				{
					url: 'https://github.com/fmadore/stias-dh-ai-workshop-2026/blob/affa349febbfc360ec7504ad8e3e8bb25c2aef9d/src/lib/data/participants/mohamadou-konate.ts',
					label: 'Organizer website source',
					quote: "name: 'Mohamadou Konaté',\n\taffiliation: {\n\t\ten: 'Joseph Ki-Zerbo University'"
				}
			],
			institutionId: 'joseph-ki-zerbo-university',
			reviewNote:
				'Affiliation explicitly listed by the 2026 workshop organizer; evidence supports 2026 only, not an open-ended appointment.'
		}
	]
};
