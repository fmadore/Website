import type { Person } from '$lib/types/person';

export const person: Person = {
	id: 'eliette-ngo-tjomb-assembe',
	name: 'Eliette Ngo Tjomb Assembe',
	affiliations: [
		{
			institution: 'University of Yaoundé I',
			years: [2026],
			confidence: 'verified',
			sources: [
				{
					url: 'https://github.com/fmadore/stias-dh-ai-workshop-2026/blob/affa349febbfc360ec7504ad8e3e8bb25c2aef9d/src/lib/data/participants/eliette-ngo-tjomb.ts',
					label: 'Organizer website source',
					quote:
						"name: 'Eliette Ngo Tjomb Assembe',\n\taffiliation: {\n\t\ten: 'University of Yaoundé 1'"
				}
			],
			institutionId: 'university-of-yaounde-i',
			reviewNote:
				'Affiliation explicitly listed by the 2026 workshop organizer; evidence supports 2026 only, not an open-ended appointment.'
		}
	]
};
