import type { Communication } from '$lib/types/communication';

export const beyondKeywordsAiIwacMcp2026: Communication = {
	id: 'beyond-keywords-ai-iwac-mcp-2026',
	title:
		'Beyond Keywords: AI-Mediated Access to the Islam West Africa Collection through an MCP Server and Agent Skill',
	authors: ['Frédérick Madore'],
	date: '15 June 2026',
	dateISO: '2026-06-15',
	year: 2026,
	conference: 'Eighth Conference on Digital Humanities and Digital History',
	location: 'University of Luxembourg',
	country: 'Luxembourg',
	type: 'conference',
	language: 'English',
	abstract:
		'Over the past two years, AI has transformed the development of the Islam West Africa Collection (IWAC), an open-access database of over 14,500 documents covering Muslim public life in six West African countries. Built and maintained by a single researcher without dedicated staff, IWAC now relies on LLMs for tasks that would otherwise require a full team: from OCR on degraded scans to named entity recognition. This paper turns to the next challenge: using AI not only to help process the collection, but to mediate access to it.' +
		'\n\n' +
		'Keyword search, the default entry point, falters with a corpus of this kind. The term "hadj" retrieves both articles about the pilgrimage to Mecca and those mentioning individuals bearing the honorific "El Hadj." A single imam appears under more than twenty spelling variants. Searches miss synonyms and conceptual relationships: a query for "hajj" will not surface documents discussing "pilgrimage to Mecca" unless those exact words appear. OCR noise from newspapers further obscures the corpus.' +
		'\n\n' +
		"IWAC's audience extends well beyond specialists: journalists, students, civil society actors, and diaspora communities all stand to benefit. Yet these keyword-dependent barriers demand domain expertise to navigate. Democratising the archive means building entry points that meet users where they are. This paper presents two complementary, experimental AI-mediated approaches developed to open IWAC to broader publics." +
		'\n\n' +
		"1. A Model Context Protocol (MCP) server, an open standard for connecting AI assistants to external data sources, provides structured, read-only access through sixteen tools for searching articles, querying authority records, and retrieving sentiment analysis from three AI models. Following Cohen's (2025) analogy, MCP does for AI what IIIF does for images: a decentralised standard that preserves institutional data sovereignty while enabling discovery." +
		'\n\n' +
		"2. An agent skill, a modular instruction set written in Markdown, encodes the domain knowledge that transforms raw tool access into methodical research. The skill structures the AI's reasoning into a five-phase workflow inspired by archival research practice: scoping coverage; systematic searching with French-language variants and Arabic-Islamic transliteration alternatives; deep reading of individual sources; triangulating across subsets; and synthesising findings with confidence grading. It also documents collection bias. If the MCP server provides the plumbing, the skill provides the intelligence: the curator's methodological expertise made transferable, versionable, and inspectable." +
		'\n\n' +
		'This architecture offers an ethical framework for connecting commercial LLMs to open-access digital collections. Whereas initiatives such as "Small Models for GLAM" pursue specialised models fine-tuned on cultural heritage data, MCP offers a complementary path: a standardised interface that lets any LLM — commercial or open-source — query a collection without retraining. Rather than surrendering data to extractive training pipelines, MCP keeps the collection on its own infrastructure while the AI queries it through defined tools, and the skill layer makes every assumption transparent. For African digital collections, historically subject to extractive knowledge practices, this preserves sovereignty while enabling AI-enhanced access. The planned next step is a conversational assistant on the IWAC website, powered by an open-source LLM and these same tools. The paper speaks to Topic 1 (methods for analysing historical sources) and Topic 2 (transforming everyday research workflows).',
	tags: [
		'AI',
		'Digital Humanities',
		'IWAC',
		'MCP',
		'Large Language Models',
		'Archives',
		'Islam',
		'West Africa'
	],
	coordinates: {
		latitude: 49.5018, // Maison des Sciences humaines, Esch-sur-Alzette
		longitude: 5.9485
	},
	project:
		"Islam's 'Peripheries': Digital Humanities, Algorithmic Analysis, and AI in West Africa and Central Asia"
};
