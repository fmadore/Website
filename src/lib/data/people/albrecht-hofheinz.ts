import type { Person } from '$lib/types/person';

export const person: Person = {
	id: 'albrecht-hofheinz',
	name: 'Albrecht Hofheinz',
	affiliations: [
		{
			institution: 'University of Oslo',
			years: [2025],
			confidence: 'uncertain',
			sources: [
				{
					url: 'https://github.com/fmadore/Website/blob/main/src/lib/data/communications/panels/ecas-2025.ts#L82',
					label: 'Existing site data',
					quote: "name: 'Albrecht Hofheinz', affiliation: 'University of Oslo'"
				}
			],
			institutionId: 'university-of-oslo',
			note: 'Uncertain affiliation considered for 2025; continuous employment is not inferred. Affiliation appears in the existing website record; the original event programme or an independent source for this event year has not been inspected.'
		},
		{
			institution: 'University of Oslo',
			years: [2026],
			confidence: 'verified',
			sources: [
				{
					url: 'https://github.com/fmadore/dh-ai-african-studies-2026/blob/main/src/lib/data/participants/albrecht-hofheinz.ts',
					label:
						'Charting New Territory: Digital Humanities and AI in African Studies — participant record',
					quote:
						'affiliation: \'University of Oslo\'\nAlbrecht Hofheinz is Associate Professor of Arab Studies at the University of Oslo, with decades-long research and humanitarian experience in the Sudan and other African contexts. He has published on Sufism, Islamic reform movements and local history in the Sudan; Arabic manuscript cultures in Africa; and social media and sociocultural dynamics in the contemporary Arab world. Among larger cooperative projects, he co-edited Brill\'s "Arabic Literature of Africa" and led the digitisation and cataloguing unit of the "Timbuktu Manuscripts Project" (2000-2009). Combining traditional philological expertise with innovative digital methods, he recently turned to developing AI-powered approaches for analysing Arabic manuscripts from the Sudan, addressing both opportunities and challenges of applying these technologies to endangered African archives.'
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
			institutionId: 'university-of-oslo',
			note: 'Evidence supports 2026; continuous employment is not inferred. Attested for the 2026 paper via its explicit link to participant affiliations. Start/end delimit supported year only, not employment tenure. The organiser’s public participant biography corroborates this institution in the 2026 workshop context. Do not transfer verification to earlier conference years or infer continuous employment. Affiliation explicitly listed by the 2026 workshop organizer; evidence supports 2026 only, not an open-ended appointment.'
		}
	]
};
