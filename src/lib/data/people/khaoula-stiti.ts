import type { Person } from '$lib/types/person';

export const person: Person = {
	id: 'khaoula-stiti',
	name: 'Khaoula Stiti',
	affiliations: [
		{
			institution: 'Unaffiliated scholar',
			years: [2026],
			confidence: 'verified',
			sources: [
				{
					url: 'https://github.com/fmadore/stias-dh-ai-workshop-2026/blob/main/src/lib/data/participants/khaoula-stiti.ts',
					label: 'Organizer website source',
					quote: "name: 'Khaoula Stiti',\n\taffiliation: {\n\t\ten: 'Unaffiliated scholar'"
				}
			],
			note: 'Evidence supports 2026; continuous employment is not inferred. Affiliation explicitly listed by the 2026 workshop organizer; evidence supports 2026 only, not an open-ended appointment. Do not copy personal/work city coordinates from workshop website. No public institutional address has been verified for this distributed entity/project or independent scholar. Institutional coordinates are unresolved; this affiliation remains unpinned.'
		}
	]
};
