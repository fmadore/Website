import type { Person } from '$lib/types/person';

export const person: Person = {
	id: 'vera-breitner',
	name: 'Vera Breitner',
	affiliations: [
		{
			institution: 'Bielefeld University',
			years: [2026],
			confidence: 'verified',
			sources: [
				{
					url: 'https://github.com/fmadore/dh-ai-african-studies-2026/blob/main/src/lib/data/participants/vera-breitner.ts',
					label: 'Organizer website source',
					quote: "name: 'Vera Breitner',\n\taffiliation: 'Bielefeld University'"
				}
			],
			institutionId: 'bielefeld-university',
			note: 'Evidence supports 2026; continuous employment is not inferred. Affiliation explicitly listed by the 2026 workshop organizer; evidence supports 2026 only, not an open-ended appointment.'
		}
	]
};
