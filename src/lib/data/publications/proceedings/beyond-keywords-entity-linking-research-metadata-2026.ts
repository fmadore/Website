import type { Publication } from '$lib/types';

export const beyondKeywordsEntityLinkingResearchMetadata2026: Publication = {
	id: 'beyond-keywords-entity-linking-research-metadata-2026',
	wikidataId: 'Q141709850',
	type: 'conference-proceedings',
	title:
		'Beyond Keywords: Training-Free Entity Linking for Research Metadata via Cross-Lingual Retrieval Consensus',
	authors: [
		{ name: 'Jiayu Yang', personId: 'jiayu-yang' },
		{ name: 'Durgesh Nandini', personId: 'durgesh-nandini' },
		'Frédérick Madore',
		{ name: 'Oliver Baumann', personId: 'oliver-baumann' },
		{ name: 'Neeraj Thandayan Viswajith', personId: 'neeraj-thandayan-viswajith' },
		{ name: 'Mirco Schoenfeld', personId: 'mirco-schonfeld' }
	],
	date: '2026',
	dateISO: '2026-10-13',
	year: 2026,
	proceedingsTitle: 'Proceedings of the 26th ACM/IEEE Joint Conference on Digital Libraries',
	conferenceName: '2026 ACM/IEEE Joint Conference on Digital Libraries (JCDL ’26)',
	conferenceLocation: 'Frisco, Texas, United States',
	placeOfPublication: 'New York, NY',
	publisher: 'Association for Computing Machinery',
	publisherLocation: 'United States',
	pages: '1-12',
	language: 'English',
	doi: '10.1145/3805696.3846031',
	abstract: `Research databases accumulate rich metadata, including subject keywords, themes, geographic and cultural references, but much of this data remains largely isolated, making it difficult to retrieve and reuse across different databases. The key problem is semantic grounding: without stable identifiers, databases that describe the same cultural practice or geographic region cannot recognise that they do so.

We present Context-Aware Routing for Entity Linking (CAREL), a training-free, cost-efficient pipeline that links research metadata keywords to Wikidata QIDs. These stable identifiers support semantically grounded cross-database search and provide a basis for future knowledge graph construction. CAREL processes heterogeneous keywords through a four-layer cascade built around a novel Cross-lingual Retrieval Consensus (CRC) signal, which turns the agreement among language-conditioned retrieval ranks into a measure of linking confidence without requiring annotated data. Routing through the layers follows the ambiguity of each keyword: rule-based layers resolve the clear cases, and keywords not resolved by the rule-based stages reach a locally deployed open-source large language model (LLM), which bounds inference cost.

We evaluate the pipeline on two benchmarks constructed from our multilingual African studies research metadata, a domain characterised by culturally embedded concepts and cross-institutional vocabulary variation: subject headings anchored in the Library of Congress Subject Headings (LCSH) and researcher-supplied tags. We deploy locally hosted open-source LLMs to assess whether such LLMs can support the task without relying on commercial APIs. This matters for research data that should not be sent to external services, and for institutions that want to keep control over how their data is used. CAREL reaches 89.8% and 90.9% end-to-end accuracy on the LCSH benchmark with Gemma4-31B-it and Qwen3.5-27B, holds 88.8% and 89.5% on the tag benchmark, and stays above 86% on both with Gemma4-E4B-it, a model with 4.5B effective parameters that runs on a consumer GPU. It detects keywords with no Wikidata entity at an F1 of 88. A stratified evaluation of frequent headings shows similar accuracy across record-context quality tiers.`,
	tags: [
		'Entity Linking',
		'Wikidata',
		'Metadata',
		'Large Language Models',
		'Multilingualism',
		'Digital Libraries',
		'AMIRA',
		'Africa Multiple'
	],
	url: 'https://doi.org/10.1145/3805696.3846031',
	openAccess: true,
	project: 'Digital Research Environment (University of Bayreuth)'
};
