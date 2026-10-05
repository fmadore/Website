import type { Person } from '$lib/types/person';

export const person: Person = {
	id: 'nuraddin-aman',
	name: 'Nuraddin Aman',
	affiliations: [
		{
			institution: 'Addis Ababa University',
			years: [2026],
			confidence: 'verified',
			sources: [
				{
					url: 'https://github.com/fmadore/dh-ai-african-studies-2026/blob/a08ebaa9be96a6513a3208d74fe9cf37b62ddcd4/src/lib/data/participants/nuraddin-aman.ts',
					label:
						'Charting New Territory: Digital Humanities and AI in African Studies, participant record',
					quote:
						"affiliation: 'Addis Ababa University, Institute of Ethiopian Studies'\nNuraddin Aman, PhD, is an assistant professor at the Institute of Ethiopian Studies, Addis Ababa University, and currently heads the Center for Indigenous Knowledge Research."
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
			reviewNote: 'Attested for the 2026 paper via its explicit link to participant affiliations.'
		},
		{
			institution: 'Addis Ababa University, Institute of Ethiopian Studies',
			years: [2026],
			confidence: 'verified',
			sources: [
				{
					url: 'https://github.com/fmadore/dh-ai-african-studies-2026/blob/a08ebaa9be96a6513a3208d74fe9cf37b62ddcd4/src/lib/data/participants/nuraddin-aman.ts',
					label: 'Organizer website source',
					quote:
						"name: 'Nuraddin Aman',\n\taffiliation: 'Addis Ababa University, Institute of Ethiopian Studies'"
				}
			],
			reviewNote:
				'Affiliation explicitly listed by the 2026 workshop organizer; evidence supports 2026 only, not an open-ended appointment.'
		}
	]
};
