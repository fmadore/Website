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
					url: 'https://github.com/fmadore/stias-dh-ai-workshop-2026/blob/main/src/lib/data/participants/leonard-kirui.ts',
					label: 'Organizer website source',
					quote: "name: 'Leonard Kibet Kirui',\n\taffiliation: {\n\t\ten: 'Moi University'"
				}
			],
			institutionId: 'moi-university',
			note: 'Evidence supports 2026; continuous employment is not inferred. Affiliation explicitly listed by the 2026 workshop organizer; evidence supports 2026 only, not an open-ended appointment.'
		}
	]
};
