import type { Person } from '$lib/types/person';

export const person: Person = {
	id: 'irene-mwendwa',
	name: 'Irene Mwendwa',
	affiliations: [
		{
			institution: 'Sulwe Labs',
			years: [2026],
			confidence: 'verified',
			sources: [
				{
					url: 'https://github.com/fmadore/dh-ai-african-studies-2026/blob/a08ebaa9be96a6513a3208d74fe9cf37b62ddcd4/src/lib/data/participants/irene-mwendwa.ts',
					label:
						'Charting New Territory: Digital Humanities and AI in African Studies, participant record',
					quote: "affiliation: 'Sulwe Labs'"
				},
				{
					url: 'https://doi.org/10.58144/20260827-000',
					label: 'Publication DOI'
				},
				{
					url: 'https://github.com/fmadore/dh-ai-african-studies-2026/blob/a08ebaa9be96a6513a3208d74fe9cf37b62ddcd4/src/lib/data/position-paper-meta.ts',
					label: 'Published paper affiliation statement',
					quote:
						'Affiliations and short biographies of all workshop participants are available on the workshop website: https://fmadore.github.io/dh-ai-african-studies-2026/participants.'
				}
			],
			reviewNote:
				'Attested for the 2026 paper via its explicit link to participant affiliations. Affiliation explicitly listed by the 2026 workshop organizer; evidence supports 2026 only, not an open-ended appointment. No public institutional address has been verified for this distributed entity/project or independent scholar.'
		}
	]
};
