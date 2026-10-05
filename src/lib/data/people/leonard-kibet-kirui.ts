import type { Person } from '$lib/types/person';

export const person: Person = {
	id: 'leonard-kibet-kirui',
	name: 'Leonard Kibet Kirui',
	affiliations: [
		{
			institution: 'Moi University',
			years: [2026],
			confidence: 'verified',
			sources: [
				{
					url: 'https://github.com/fmadore/stias-dh-ai-workshop-2026/blob/affa349febbfc360ec7504ad8e3e8bb25c2aef9d/src/lib/data/participants/leonard-kirui.ts',
					label: 'Organizer website source',
					quote: "name: 'Leonard Kibet Kirui',\n\taffiliation: {\n\t\ten: 'Moi University'"
				}
			],
			institutionId: 'moi-university',
			reviewNote:
				'Affiliation explicitly listed by the 2026 workshop organizer; evidence supports 2026 only, not an open-ended appointment.'
		}
	]
};
