import type { Person } from '$lib/types/person';

export const person: Person = {
	id: 'lydia-kila-taban',
	name: 'Lydia Kila Taban',
	affiliations: [
		{
			institution: 'Masakhane',
			years: [2026],
			confidence: 'verified',
			sources: [
				{
					url: 'https://github.com/fmadore/stias-dh-ai-workshop-2026/blob/affa349febbfc360ec7504ad8e3e8bb25c2aef9d/src/lib/data/participants/lydia-kila-taban.ts',
					label: 'Organizer website source',
					quote: "name: 'Lydia Kila Taban',\n\taffiliation: {\n\t\ten: 'Masakhane'"
				}
			],
			reviewNote:
				'Affiliation explicitly listed by the 2026 workshop organizer; evidence supports 2026 only, not an open-ended appointment. No public institutional address has been verified for this distributed entity/project or independent scholar.'
		}
	]
};
