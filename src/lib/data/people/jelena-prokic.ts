import type { Person } from '$lib/types/person';

export const person: Person = {
	id: 'jelena-prokic',
	name: 'Jelena Prokic',
	affiliations: [
		{
			institution: 'Leiden University',
			years: [2026],
			confidence: 'verified',
			sources: [
				{
					url: 'https://github.com/fmadore/stias-dh-ai-workshop-2026/blob/main/src/lib/data/participants/jelena-prokic.ts',
					label: 'Organizer website source',
					quote: "name: 'Jelena Prokic',\n\taffiliation: {\n\t\ten: 'Leiden University'"
				}
			],
			institutionId: 'leiden-university',
			note: 'Evidence supports 2026; continuous employment is not inferred. Affiliation explicitly listed by the 2026 workshop organizer; evidence supports 2026 only, not an open-ended appointment.'
		}
	]
};
