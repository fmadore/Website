import type { Communication } from '$lib/types/communication';

export const beyondKeywordsEntityLinkingCikm2026: Communication = {
	id: 'beyond-keywords-entity-linking-cikm-2026',
	title: 'Beyond Keywords: Training-Free Entity Linking for Multilingual Research Metadata',
	authors: [
		'Jiayu Yang',
		'Durgesh Nandini',
		'Mirco Schönfeld',
		'Frédérick Madore',
		'Neeraj Thandayan Viswajith',
		'Oliver Baumann'
	],
	date: '9 November 2026',
	dateISO: '2026-11-09',
	year: 2026,
	conference:
		'35th International ACM Conference on Knowledge and Information Management (CIKM 2026)',
	location: 'Auditorium Parco della Musica, Rome',
	country: 'Italy',
	type: 'conference',
	language: 'English',
	abstract: `Research databases accumulate rich metadata, including subject keywords, themes, geographic and cultural references, but much of this data remains largely isolated, making it difficult to retrieve and reuse across different databases. The key problem is semantic grounding: without stable identifiers, multiple databases describing the same cultural practice or geographic region have no way to know it, even if there is a semantic overlap in the underlying subjects.

We present CAREL (Context-Aware Routing for Entity Linking), a training-free, cost-efficient pipeline that links research metadata keywords to Wikidata QIDs. These stable identifiers are the basis for semantically grounded cross-database search and, in the longer term, knowledge graph construction. CAREL processes heterogeneous keywords through a four-layer cascade. The first three layers rely entirely on rule-based processing and statistical signals, including a novel Cross-lingual Retrieval Consensus (CRC) signal that exploits rank-distribution agreement across language-specific API queries as a proxy for linking confidence, without requiring annotated data. Only genuinely ambiguous keywords are routed to the final layer, where locally deployed open-source LLMs reason agentically via tool use. This cost-aware design keeps inference costs compatible with modest institutional GPU resources.

We evaluate the pipeline on a benchmark constructed from our multilingual African studies research metadata, a domain characterised by culturally embedded concepts and significant cross-institutional vocabulary variation. We deploy locally hosted open-source LLMs to assess whether such LLMs can support the task without relying on commercial APIs. This matters for research data that should not be sent to external services. CAREL achieves an end-to-end linking accuracy of 89.8% with Gemma-4-31B-it (92.1% on resolvable entities).`,
	tags: [
		'Entity Linking',
		'Named Entity Recognition',
		'Wikidata',
		'Metadata',
		'Knowledge Graph',
		'Large Language Models',
		'Multilingualism',
		'AMIRA',
		'Africa Multiple'
	],
	url: 'https://cikm2026.diag.uniroma1.it/',
	urlLabel: 'Conference Website',
	image: 'images/communications/cikm-2026.webp',
	heroImage: {
		src: 'images/communications/cikm-2026-hero.webp',
		alt: 'Logo of CIKM 2026 in Rome: the Colosseum, Trajan’s Column and the shell of the Auditorium Parco della Musica stand side by side beneath an arc of network nodes and edges in the green, white and red of the Italian flag, with the wordmark “CIKM 2026” set below in heavy black capitals.'
	},
	coordinates: {
		latitude: 41.9289,
		longitude: 12.4739
	},
	project: 'Digital Research Environment (University of Bayreuth)'
};
