import type { Person } from '$lib/types/person';

export const person: Person = {
	id: 'augustin-ndione',
	name: 'Augustin Ndione',
	affiliations: [
		{
			institution: 'Cheikh Anta Diop University',
			years: [2026],
			confidence: 'verified',
			sources: [
				{
					url: 'https://github.com/fmadore/dh-ai-african-studies-2026/blob/a08ebaa9be96a6513a3208d74fe9cf37b62ddcd4/src/lib/data/participants/augustin-ndione.ts',
					label:
						'Charting New Territory: Digital Humanities and AI in African Studies, participant record',
					quote:
						"affiliation: 'Cheikh Anta Diop University'\nSince 2023, he is Director of the Center for Applied Linguistics in Dakar (CLAD) at Cheikh Anta Diop University in Dakar, which he joined in 2017."
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
				},
				{
					url: 'https://github.com/fmadore/stias-dh-ai-workshop-2026/blob/affa349febbfc360ec7504ad8e3e8bb25c2aef9d/src/lib/data/participants/augustin-ndione.ts',
					label: 'Organizer website source',
					quote: "name: 'Augustin Ndione',\n\taffiliation: {\n\t\ten: 'Cheikh Anta Diop University'"
				}
			],
			institutionId: 'cheikh-anta-diop-university',
			reviewNote:
				'Attested for the 2026 paper via its explicit link to participant affiliations. Affiliation explicitly listed by the 2026 workshop organizer; evidence supports 2026 only, not an open-ended appointment.'
		}
	]
};
