import type { Person } from '$lib/types/person';

export const person: Person = {
	id: 'johannes-sibeko',
	name: 'Johannes Sibeko',
	affiliations: [
		{
			institution: 'Nelson Mandela University',
			years: [2026],
			confidence: 'verified',
			sources: [
				{
					url: 'https://github.com/fmadore/dh-ai-african-studies-2026/blob/main/src/lib/data/participants/johannes-sibeko.ts',
					label:
						'Charting New Territory: Digital Humanities and AI in African Studies — participant record',
					quote:
						"affiliation: 'Nelson Mandela University'\nJohannes Sibeko is the coordinator of Nelson Mandela University's Digital Humanities Hub and editor-in-chief of the Journal of the Digital Humanities Association of Southern Africa. His research focuses on corpus linguistics, particularly in readability studies, and on developing foundational language resources to support research in this area. He is also involved in a project scoping the landscape of Digital Humanities in Southern Africa, mapping opportunities, practices, and resources across the region."
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
			note: 'Evidence supports 2026; continuous employment is not inferred. Attested for the 2026 paper via its explicit link to participant affiliations. Start/end delimit supported year only, not employment tenure. Institutional coordinates are unresolved; this affiliation remains unpinned. Affiliation explicitly listed by the 2026 workshop organizer; evidence supports 2026 only, not an open-ended appointment.'
		}
	]
};
