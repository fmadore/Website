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
					url: 'https://github.com/fmadore/Website/blob/main/src/lib/data/communications/panels/ecas-2025.ts#L48',
					label: 'Existing site data',
					quote: "name: 'Britta Frede', affiliation: 'University of Bayreuth'"
				}
			],
			institutionId: 'university-of-bayreuth',
			note: 'Evidence supports 2025; continuous employment is not inferred. Affiliation appears in the existing website record; the original event programme or an independent source for this event year has not been inspected.'
		},
		{
			institution: 'University of Bayreuth',
			years: [2026],
			confidence: 'verified',
			sources: [
				{
					url: 'https://github.com/fmadore/dh-ai-african-studies-2026/blob/main/src/lib/data/participants/britta-frede.ts',
					label:
						'Charting New Territory: Digital Humanities and AI in African Studies — participant record',
					quote:
						"affiliation: 'University of Bayreuth'\nSince 2019, Britta Frede has been a researcher in Islamic Studies at the Africa Multiple Cluster of Excellence, University of Bayreuth. She is coordinating the design and development of a data research repository on Islamic Africa (Islamic Cultural Archive (ICA)). From April 2022 to March 2025, she served as a substitute for the Chair of Islamic Studies in Bayreuth. Before she has been involved in several research projects conducted at the Leibniz Centre of Oriental Studies (ZMO), the Berlin Graduate School for Muslim Cultures and Societies (BGSMCS), and Humboldt University, focusing on various aspects of Islam in Africa since the 1800s. Based on her multi-disciplinary background in Islamic Studies and African History, she has published several journal articles on Sufism, Islamic education, and Female authority in African Islamic scholarly culture."
				},
				{
					url: 'https://doi.org/10.58144/20260827-000',
					label: 'Publication DOI'
				},
				{
					url: 'https://github.com/fmadore/dh-ai-african-studies-2026/blob/main/src/lib/data/position-paper-meta.ts',
					label: 'Published paper affiliation statement',
					quote:
						'Affiliations and short biographies of all workshop participants are available on the workshop website: https://fmadore.github.io/dh-ai-african-studies-2026/participants.'
				}
			],
			institutionId: 'university-of-bayreuth',
			note: 'Evidence supports 2026; continuous employment is not inferred. Attested for the 2026 paper via its explicit link to participant affiliations. Start/end delimit supported year only, not employment tenure. The organiser’s public participant biography corroborates this institution in the 2026 workshop context. Do not transfer verification to earlier conference years or infer continuous employment. Affiliation explicitly listed by the 2026 workshop organizer; evidence supports 2026 only, not an open-ended appointment.'
		}
	]
};
