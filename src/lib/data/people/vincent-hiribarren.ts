import type { Person } from '$lib/types/person';

export const person: Person = {
	id: 'vincent-hiribarren',
	name: 'Vincent Hiribarren',
	affiliations: [
		{
			institution: "King's College London",
			years: [2018],
			confidence: 'uncertain',
			sources: [
				{
					url: 'https://github.com/fmadore/dh-ai-african-studies-2026/blob/a08ebaa9be96a6513a3208d74fe9cf37b62ddcd4/src/lib/data/participants/vincent-hiribarren.ts',
					label: 'Evidence from another year',
					quote: 'affiliation: "King\'s College London"'
				},
				{
					url: 'https://digihistbie.hypotheses.org/1117',
					label: 'Evidence from another year',
					quote:
						'organisiert von Frédérick Madore (Universität Bayreuth) und Vincent Hiribarren (King’s College London)'
				}
			],
			institutionId: 'kings-college-london',
			reviewNote:
				'Live Libération page returned HTTP403. Stored publisher screenshot confirms Pamela Millet-Mouity’s EHESS affiliation only; it gives no institution for Vincent Hiribarren. His 2026 King’s record does not establish a 2018 affiliation.'
		},
		{
			institution: "King's College London",
			years: [2025],
			confidence: 'uncertain',
			sources: [
				{
					url: 'https://github.com/fmadore/Website/blob/250c6bce6209ccaee96e7c136251a969bfc97ae8/src/lib/data/communications/panels/ecas-2025.ts#L95',
					label: 'Event record (this site’s data)',
					quote: "name: 'Vincent Hiribarren', affiliation: \"King's College London\""
				}
			],
			institutionId: 'kings-college-london',
			reviewNote:
				'Affiliation appears in the existing website record; the original event programme or an independent source for this event year has not been inspected.'
		},
		{
			institution: "King's College London",
			years: [2026],
			confidence: 'verified',
			sources: [
				{
					url: 'https://github.com/fmadore/dh-ai-african-studies-2026/blob/a08ebaa9be96a6513a3208d74fe9cf37b62ddcd4/src/lib/data/participants/vincent-hiribarren.ts',
					label:
						'Charting New Territory: Digital Humanities and AI in African Studies, participant record',
					quote: 'affiliation: "King\'s College London"'
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
					url: 'https://digihistbie.hypotheses.org/1117',
					label: 'Publisher publication author affiliation',
					quote:
						'organisiert von Frédérick Madore (Universität Bayreuth) und Vincent Hiribarren (King’s College London)'
				},
				{
					url: 'https://doi.org/10.58079/15z9p',
					label: 'Publication DOI'
				},
				{
					url: 'https://github.com/fmadore/Website/blob/250c6bce6209ccaee96e7c136251a969bfc97ae8/src/lib/data/communications/panels/reaf-2026.ts#L107',
					label: 'Event record (this site’s data)',
					quote: "name: 'Vincent Hiribarren', affiliation: \"King's College London\""
				},
				{
					url: 'https://github.com/fmadore/Website/blob/250c6bce6209ccaee96e7c136251a969bfc97ae8/static/files/humanites-numeriques-ia-etudes-africaines-reaf-2026.pdf',
					label: 'Conference programme pdf',
					quote:
						'Vincent Hiribarren*1 and Frédérick Madore*2 / 1 King’s College London – Royaume-Uni'
				},
				{
					url: 'https://github.com/fmadore/stias-dh-ai-workshop-2026/blob/affa349febbfc360ec7504ad8e3e8bb25c2aef9d/src/lib/data/organizers.ts',
					label: 'Organizer website source',
					quote:
						"name: 'Vincent Hiribarren',\n\t\trole: { en: 'Organiser', fr: 'Organisateur' },\n\t\taffiliation: {\n\t\t\ten: \"King's College London\""
				}
			],
			institutionId: 'kings-college-london',
			reviewNote:
				'Attested for the 2026 paper via its explicit link to participant affiliations. The DOI-resolved publisher post dated 2026-03-31 names Vincent Hiribarren with King’s College London in its description of the February 2026 workshop. This directly supports the March 2026 publication; it does not verify 2018 or 2025. The organiser’s public participant biography corroborates this institution in the 2026 workshop context. Do not transfer verification to earlier conference years or infer continuous employment. Affiliation explicitly listed by the 2026 workshop organizer; evidence supports 2026 only, not an open-ended appointment. Evidence is a same-year workshop biography, not this communication’s own program.'
		}
	]
};
