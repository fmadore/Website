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
					url: 'https://github.com/fmadore/dh-ai-african-studies-2026/blob/main/src/lib/data/participants/irene-mwendwa.ts',
					label:
						'Charting New Territory: Digital Humanities and AI in African Studies — participant record',
					quote:
						"affiliation: 'Sulwe Labs'\nIrene is a lawyer creating safer digital futures through research and advocacy in human rights and tech policy. She is an experienced legal professional with extensive experience in innovative collaborations across public, private, and civil society sectors. Irene structures and executes projects that deliver better policies and legal frameworks on public policy issues such as elections and technology. Irene is a builder of liberatory futures, rooted in integrity, imagination, and justice."
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
			note: 'Evidence supports 2026; continuous employment is not inferred. Attested for the 2026 paper via its explicit link to participant affiliations. Start/end delimit supported year only, not employment tenure. Institutional coordinates are unresolved; this affiliation remains unpinned. Affiliation explicitly listed by the 2026 workshop organizer; evidence supports 2026 only, not an open-ended appointment. Do not copy personal/work city coordinates from workshop website. No public institutional address has been verified for this distributed entity/project or independent scholar.'
		}
	]
};
