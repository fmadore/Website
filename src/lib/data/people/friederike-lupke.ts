import type { Person } from '$lib/types/person';

export const person: Person = {
	id: 'friederike-lupke',
	name: 'Friederike Lüpke',
	affiliations: [
		{
			institution: 'University of Helsinki',
			years: [2026],
			confidence: 'verified',
			sources: [
				{
					url: 'https://github.com/fmadore/stias-dh-ai-workshop-2026/blob/affa349febbfc360ec7504ad8e3e8bb25c2aef9d/src/lib/data/participants/friederike-lupke.ts',
					label: 'Organizer website source',
					quote: "name: 'Friederike Lüpke',\n\taffiliation: {\n\t\ten: 'University of Helsinki'"
				}
			],
			institutionId: 'university-of-helsinki',
			reviewNote:
				'Affiliation explicitly listed by the 2026 workshop organizer; evidence supports 2026 only, not an open-ended appointment.'
		}
	]
};
