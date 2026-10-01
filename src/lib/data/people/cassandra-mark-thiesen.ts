import type { Person } from '$lib/types/person';

export const person: Person = {
	id: 'cassandra-mark-thiesen',
	name: 'Cassandra Mark-Thiesen',
	affiliations: [
		{
			institution: 'University of Regensburg',
			years: [2026],
			confidence: 'verified',
			sources: [
				{
					url: 'https://github.com/fmadore/dh-ai-african-studies-2026/blob/main/src/lib/data/participants/cassandra-mark-thiesen.ts',
					label:
						'Charting New Territory: Digital Humanities and AI in African Studies — participant record',
					quote:
						'affiliation: \'University of Regensburg\'\nCassandra Mark-Thiesen is currently serving as Acting Chair of Transregional Cultures of Knowledge at DIMAS. She previously led the junior research group "African Knowledges and the History of Publication" at the Africa Multiple Cluster of Excellence at the University of Bayreuth. She was also a lecturer in global and African history at the University of Basel. Her research focuses on the social history of labor, technology, and knowledge transfer in the 19th and 20th centuries; media archaeology; and African historical cultures.'
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
