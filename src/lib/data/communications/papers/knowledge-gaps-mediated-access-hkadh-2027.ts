import type { Communication } from '#lib/types/communication.ts';

export const knowledgeGapsMediatedAccessHkadh2027: Communication = {
	id: 'knowledge-gaps-mediated-access-hkadh-2027',
	title:
		'Knowledge Gaps and Mediated Access: AI Infrastructure and Practice for African Research Data',
	authors: [
		'Frédérick Madore',
		{ name: 'Jiayu Yang', personId: 'jiayu-yang' },
		{ name: 'Oliver Baumann', personId: 'oliver-baumann' },
		{ name: 'Neeraj Thandayan Viswajith', personId: 'neeraj-thandayan-viswajith' },
		{ name: 'Durgesh Nandini', personId: 'durgesh-nandini' },
		{ name: 'Mirco Schönfeld', personId: 'mirco-schonfeld' }
	],
	date: '21 January 2027',
	dateISO: '2027-01-21',
	year: 2027,
	conference:
		'3rd Annual Conference of the Hong Kong Association for Digital Humanities (HKADH 2027), "Model/Making: Toward Generative Humanities"',
	location: 'The Education University of Hong Kong, Tai Po Campus',
	country: 'Hong Kong',
	type: 'conference',
	language: 'English',
	abstract: `This paper addresses a practical problem in AMIRA, the Africa Multiple Interactive Research Atlas, the research-data platform of the Africa Multiple Cluster of Excellence at the University of Bayreuth (Germany). Its catalogue connects research materials through subjects, concepts and named entities, many of them linked to Library of Congress Subject Headings or Wikidata identifiers. These links identify what a record concerns, but readers may also need an explanation of a concept and of how it is used in the research catalogued in AMIRA.

One option is to retrieve existing Wikidata descriptions or Library of Congress scope notes where available; another is to ask generative AI to draft definitions. Both risk reproducing Western-centred categories and assumptions that may obscure how concepts are understood and debated in African contexts. We propose instead to ground the explanations primarily in the Cluster's own publications, supplemented by podcast and video transcripts and by the research items used in its projects, including recordings, photographs, documents and artworks. This approach brings Africa Multiple's agenda of world-making from the vantage point of Africa into catalogue practice: research from and on Africa informs the explanations through which readers encounter the collection.

The workflow builds on AMIRA's Model Context Protocol (MCP) server, which allows AI assistants to search the collection and retrieve source material. Agents select concepts according to their frequency in the catalogue and curatorial priorities, retrieve relevant passages, and draft concise explanations supported by references. The Cluster's publications provide the main basis for these explanations, drawing on how its researchers define, use and debate the selected concepts. The resulting texts enrich AMIRA's catalogue and direct readers to the publications on which they are based.

We present a small pilot comparing existing catalogue entries, Wikidata descriptions and Library of Congress scope notes where available, generic AI explanations, and explanations grounded in the Cluster's publications. Worked examples show the supporting passages and allow us to assess factual support, attention to context and the usefulness of references. The pilot also includes cases where the evidence is insufficient to produce an explanation. In a subsequent phase, contributing researchers and subject specialists will be invited to assess and revise the drafts, giving them a say in how their work is represented.

In relation to Model/Making, the paper examines how AI-generated descriptions shape readers' understanding of collections, and discusses the potential of locally deployed models to reduce reliance on services operated by major US technology companies. The outcome is a workflow adaptable to other collections.`,
	tags: [
		'AMIRA',
		'Africa Multiple',
		'Digital Humanities',
		'Artificial Intelligence',
		'Large Language Models',
		'AI Agents',
		'MCP',
		'Metadata',
		'Wikidata',
		'Data Sovereignty'
	],
	url: 'https://2027.hkadh.org/',
	urlLabel: 'Conference Website',
	image: 'images/communications/hkadh-2027.webp',
	heroImage: {
		src: 'images/communications/hkadh-2027-hero.webp',
		alt: 'Logo of HKADH 2027: the lowercase letters “hk” in white inside a solid blue circle, followed by “adh” in large blue lowercase letters and “2027” in smaller blue numerals, on a white ground.'
	},
	coordinates: {
		latitude: 22.4686,
		longitude: 114.1946
	},
	project: 'Digital Research Environment (University of Bayreuth)'
};
