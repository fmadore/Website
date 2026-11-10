import type { Person } from '#lib/types/person.ts';

export const person: Person = {
	id: 'emmanuel-ngue-um',
	name: 'Emmanuel Ngue Um',
	affiliations: [
		{
			institution: 'University of Yaoundé I',
			years: [2026],
			confidence: 'verified',
			sources: [
				{
					url: 'https://github.com/fmadore/dh-ai-african-studies-2026/blob/a08ebaa9be96a6513a3208d74fe9cf37b62ddcd4/src/lib/data/participants/emmanuel-ngue-um.ts',
					label:
						'Charting New Territory: Digital Humanities and AI in African Studies, participant record',
					quote:
						"affiliation: 'University of Yaounde 1'\nEmmanuel Ngue Um is an Associate Professor of African Languages and Linguistics at the University of Yaoundé 1."
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
					url: 'https://github.com/fmadore/stias-dh-ai-workshop-2026/blob/affa349febbfc360ec7504ad8e3e8bb25c2aef9d/src/lib/data/organizers.ts',
					label: 'Organizer website source',
					quote:
						"name: 'Emmanuel Ngue Um',\n\t\trole: { en: 'Organiser', fr: 'Organisateur' },\n\t\taffiliation: {\n\t\t\ten: 'University of Yaoundé 1'"
				}
			],
			institutionId: 'university-of-yaounde-i',
			reviewNote:
				'Attested for the 2026 paper via its explicit link to participant affiliations. Affiliation explicitly listed by the 2026 workshop organizer; evidence supports 2026 only, not an open-ended appointment.'
		},
		{
			institution: 'University of Yaoundé I',
			years: [2027],
			confidence: 'verified',
			sources: [
				{
					url: 'https://www.frederickmadore.com/publications/dh-ai-african-studies-dhasa',
					label: 'Publication record (this site’s data)',
					quote:
						'Special issue of the Journal of the Digital Humanities Association of Southern Africa, ed. Frédérick Madore, Vincent Hiribarren, Emmanuel Ngue Um and Menno van Zaanen (forthcoming 2027)'
				}
			],
			institutionId: 'university-of-yaounde-i',
			reviewNote:
				'Confirmed by Frédérick Madore, co-editor, on 2026-11-10: same affiliation as in 2026 for the forthcoming 2027 edition(s). Supports 2027 only.'
		}
	]
};
