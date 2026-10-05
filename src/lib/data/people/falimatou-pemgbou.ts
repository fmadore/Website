import type { Person } from '$lib/types/person';

export const person: Person = {
	id: 'falimatou-pemgbou',
	name: 'Falimatou Pemgbou',
	affiliations: [
		{
			institution: 'University of Ebolowa',
			years: [2026],
			confidence: 'verified',
			sources: [
				{
					url: 'https://github.com/fmadore/stias-dh-ai-workshop-2026/blob/affa349febbfc360ec7504ad8e3e8bb25c2aef9d/src/lib/data/participants/falimatou-pemgbou.ts',
					label: 'Organizer website source',
					quote: "name: 'Falimatou Pemgbou',\n\taffiliation: {\n\t\ten: 'University of Ebolowa'"
				}
			],
			reviewNote:
				'Affiliation explicitly listed by the 2026 workshop organizer; evidence supports 2026 only, not an open-ended appointment.'
		}
	]
};
