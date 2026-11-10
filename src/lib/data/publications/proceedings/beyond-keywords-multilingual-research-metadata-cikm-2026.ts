import type { Publication } from '#lib/types/index.ts';

export const beyondKeywordsMultilingualResearchMetadataCikm2026: Publication = {
	id: 'beyond-keywords-multilingual-research-metadata-cikm-2026',
	wikidataId: 'Q142098283',
	type: 'conference-proceedings',
	title: 'Beyond Keywords: Training-Free Entity Linking for Multilingual Research Metadata',
	authors: [
		{ name: 'Jiayu Yang', personId: 'jiayu-yang' },
		{ name: 'Durgesh Nandini', personId: 'durgesh-nandini' },
		'Frédérick Madore',
		{ name: 'Neeraj Thandayan Viswajith', personId: 'neeraj-thandayan-viswajith' },
		{ name: 'Oliver Baumann', personId: 'oliver-baumann' },
		{ name: 'Mirco Schönfeld', personId: 'mirco-schonfeld' }
	],
	date: '2026',
	dateISO: '2026-11-06',
	year: 2026,
	proceedingsTitle:
		'Proceedings of the 35th ACM International Conference on Information and Knowledge Management',
	conferenceName:
		'35th ACM International Conference on Information and Knowledge Management (CIKM ’26)',
	conferenceLocation: 'Rome, Italy',
	placeOfPublication: 'New York, NY',
	publisher: 'Association for Computing Machinery',
	publisherLocation: 'United States',
	pages: '8034-8039',
	language: 'English',
	doi: '10.1145/3799682.3840034',
	abstract: `Research collections in the humanities and social sciences describe overlapping subjects under divergent cataloguing practices, so records that belong together stay unconnected across databases. Stable identifiers would make the overlap machine-readable, but assigning them means disambiguating keywords that are short, multilingual, and largely without context. We present Context-Aware Routing for Entity Linking (CAREL), a training-free pipeline that links research metadata keywords to Wikidata QIDs through a four-layer cascade. Its core is Cross-lingual Retrieval Consensus (CRC), a novel signal that turns the agreement of retrieval ranks across language-specific queries into a measure of linking confidence without requiring annotated data. Rule-based layers resolve the clear cases, and only genuinely ambiguous keywords reach a locally deployed open-source large language model (LLM), which bounds inference cost and avoids sending research metadata to external services. On two manually verified benchmarks from multilingual African studies metadata, subject headings anchored in the Library of Congress Subject Headings (LCSH) and researcher-supplied tags, CAREL reaches 89.8% and 90.9% accuracy on the headings with Gemma4-31B-it and Qwen3.5-27B, and holds 88.8% and 89.5% on the anchor-free tags. It also detects the keywords for which no Wikidata entity exists, at an F1 of 88 on the tags.`,
	tags: [
		'Entity Linking',
		'Entity Disambiguation',
		'NIL Detection',
		'Wikidata',
		'Metadata',
		'Large Language Models',
		'Multilingualism',
		'Digital Libraries',
		'AMIRA',
		'Africa Multiple'
	],
	url: 'https://doi.org/10.1145/3799682.3840034',
	openAccess: true,
	project: 'Digital Research Environment (University of Bayreuth)'
};
