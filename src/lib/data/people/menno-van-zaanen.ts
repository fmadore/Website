import type { Person } from '$lib/types/person';

export const person: Person = {
	id: 'menno-van-zaanen',
	name: 'Menno van Zaanen',
	affiliations: [
		{
			institution: 'South African Centre for Digital Language Resources (SADiLaR)',
			years: [2024],
			confidence: 'verified',
			sources: [
				{
					url: 'https://github.com/DHCSSza/escalator-sadilar/blob/65d6f2113fbb44b0ab23f9e48086144e56b6a550/content/dh-ignite/contact.md',
					label: 'Institutional website source',
					quote: 'Menno van Zaanen (SADiLaR)'
				}
			],
			reviewNote:
				'The SADiLaR ESCALATOR programme website explicitly lists this person as SADiLaR. The pinned source revision is dated 2024-08-27. This is historical corroboration for 2024, not independent verification for the ECAS 2025 event or current employment.'
		},
		{
			institution: 'South African Centre for Digital Language Resources (SADiLaR)',
			years: [2025],
			confidence: 'uncertain',
			sources: [
				{
					url: 'https://github.com/fmadore/Website/blob/250c6bce6209ccaee96e7c136251a969bfc97ae8/src/lib/data/communications/panels/ecas-2025.ts#L68',
					label: 'Event record (this site’s data)',
					quote:
						"name: 'Menno van Zaanen',\n\t\t\t\t\taffiliation: 'South African Centre for Digital Language Resources'"
				}
			],
			reviewNote:
				'Affiliation appears in the existing website record; the original event programme or an independent source for this event year has not been inspected.'
		},
		{
			institution: 'South African Centre for Digital Language Resources (SADiLaR)',
			years: [2026],
			confidence: 'verified',
			sources: [
				{
					url: 'https://github.com/fmadore/dh-ai-african-studies-2026/blob/a08ebaa9be96a6513a3208d74fe9cf37b62ddcd4/src/lib/data/participants/menno-van-zaanen.ts',
					label:
						'Charting New Territory: Digital Humanities and AI in African Studies, participant record',
					quote:
						"affiliation: 'South African Centre for Digital Language Resources'\nMenno van Zaanen is a professor in Digital Humanities at the South African Centre for Digital Language Resources."
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
				'Attested for the 2026 paper via its explicit link to participant affiliations. The organiser’s public participant biography corroborates this institution in the 2026 workshop context. Do not transfer verification to earlier conference years or infer continuous employment.'
		},
		{
			institution: 'South African Centre for Digital Language Resources (SADiLaR)',
			years: [2026],
			confidence: 'verified',
			sources: [
				{
					url: 'https://github.com/fmadore/stias-dh-ai-workshop-2026/blob/affa349febbfc360ec7504ad8e3e8bb25c2aef9d/src/lib/data/organizers.ts',
					label: 'Organizer website source',
					quote:
						"name: 'Menno van Zaanen',\n\t\trole: { en: 'Organiser', fr: 'Organisateur' },\n\t\taffiliation: {\n\t\t\ten: 'South African Centre for Digital Language Resources (SADiLaR)'"
				},
				{
					url: 'https://github.com/fmadore/dh-ai-african-studies-2026/blob/a08ebaa9be96a6513a3208d74fe9cf37b62ddcd4/src/lib/data/participants/menno-van-zaanen.ts',
					label: 'Organizer website source',
					quote:
						"name: 'Menno van Zaanen',\n\taffiliation: 'South African Centre for Digital Language Resources'"
				}
			],
			reviewNote:
				'Affiliation explicitly listed by the 2026 workshop organizer; evidence supports 2026 only, not an open-ended appointment.'
		}
	]
};
