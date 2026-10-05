import type { Person } from '$lib/types/person';

export const person: Person = {
	id: 'britta-frede',
	name: 'Britta Frede',
	affiliations: [
		{
			institution: 'University of Bayreuth',
			years: [2025],
			confidence: 'uncertain',
			sources: [
				{
					url: 'https://github.com/fmadore/Website/blob/250c6bce6209ccaee96e7c136251a969bfc97ae8/src/lib/data/communications/panels/ecas-2025.ts#L48',
					label: 'Event record (this site’s data)',
					quote: "name: 'Britta Frede', affiliation: 'University of Bayreuth'"
				}
			],
			institutionId: 'university-of-bayreuth',
			reviewNote:
				'Affiliation appears in the existing website record; the original event programme or an independent source for this event year has not been inspected.'
		},
		{
			institution: 'University of Bayreuth',
			years: [2026],
			confidence: 'verified',
			sources: [
				{
					url: 'https://github.com/fmadore/dh-ai-african-studies-2026/blob/a08ebaa9be96a6513a3208d74fe9cf37b62ddcd4/src/lib/data/participants/britta-frede.ts',
					label:
						'Charting New Territory: Digital Humanities and AI in African Studies, participant record',
					quote:
						"affiliation: 'University of Bayreuth'\nSince 2019, Britta Frede has been a researcher in Islamic Studies at the Africa Multiple Cluster of Excellence, University of Bayreuth."
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
			institutionId: 'university-of-bayreuth',
			reviewNote:
				'Attested for the 2026 paper via its explicit link to participant affiliations. The organiser’s public participant biography corroborates this institution in the 2026 workshop context. Do not transfer verification to earlier conference years or infer continuous employment. Affiliation explicitly listed by the 2026 workshop organizer; evidence supports 2026 only, not an open-ended appointment.'
		}
	]
};
