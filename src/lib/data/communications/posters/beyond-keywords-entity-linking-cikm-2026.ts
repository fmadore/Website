import type { Communication } from '#lib/types/communication.ts';

export const beyondKeywordsEntityLinkingCikm2026: Communication = {
	id: 'beyond-keywords-entity-linking-cikm-2026',
	title: 'Beyond Keywords: Training-Free Entity Linking for Multilingual Research Metadata',
	authors: [
		{ name: 'Jiayu Yang', personId: 'jiayu-yang' },
		{ name: 'Durgesh Nandini', personId: 'durgesh-nandini' },
		'Frédérick Madore',
		{ name: 'Neeraj Thandayan Viswajith', personId: 'neeraj-thandayan-viswajith' },
		{ name: 'Oliver Baumann', personId: 'oliver-baumann' },
		{ name: 'Mirco Schönfeld', personId: 'mirco-schonfeld' }
	],
	date: '10 November 2026',
	dateISO: '2026-11-10',
	year: 2026,
	conference:
		'35th ACM International Conference on Information and Knowledge Management (CIKM 2026)',
	location: 'Auditorium Parco della Musica, Rome',
	country: 'Italy',
	type: 'poster',
	language: 'English',
	abstract: `Research collections in the humanities and social sciences describe overlapping subjects under divergent cataloguing practices, so records that belong together stay unconnected across databases. Stable identifiers would make the overlap machine-readable, but assigning them means disambiguating keywords that are short, multilingual, and largely without context. We present Context-Aware Routing for Entity Linking (CAREL), a training-free pipeline that links research metadata keywords to Wikidata QIDs through a four-layer cascade. Its core is Cross-lingual Retrieval Consensus (CRC), a novel signal that turns the agreement of retrieval ranks across language-specific queries into a measure of linking confidence without requiring annotated data. Rule-based layers resolve the clear cases, and only genuinely ambiguous keywords reach a locally deployed open-source large language model (LLM), which bounds inference cost and avoids sending research metadata to external services. On two manually verified benchmarks from multilingual African studies metadata, subject headings anchored in the Library of Congress Subject Headings (LCSH) and researcher-supplied tags, CAREL reaches 89.8% and 90.9% accuracy on the headings with Gemma4-31B-it and Qwen3.5-27B, and holds 88.8% and 89.5% on the anchor-free tags. It also detects the keywords for which no Wikidata entity exists, at an F1 of 88 on the tags.`,
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
