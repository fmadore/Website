import type { DigitalHumanitiesProject } from '$lib/types/digitalHumanities';

export const iwacMcpServer: DigitalHumanitiesProject = {
	id: 'iwac-mcp-server',
	title: 'IWAC MCP Server',
	years: '2026-',
	shortDescription:
		'A Model Context Protocol server and companion agent skill that give AI assistants structured, read-only access to the Islam West Africa Collection — overcoming the limitations of keyword search through structured, AI-mediated access to the corpus.',
	description:
		'<p>Keyword search, the default entry point for most digital collections, struggles with a corpus like the <a href="https://islam.zmo.de/s/westafrica/" target="_blank" rel="noopener noreferrer"><em>Islam West Africa Collection</em></a>. The term "hadj" retrieves both articles about the pilgrimage to Mecca and those mentioning individuals bearing the honorific "El Hadj." A single imam may appear under more than twenty spelling variants. Searches miss synonyms and conceptual relationships: a query for "hajj" will not surface documents discussing "pilgrimage to Mecca" unless those exact words appear.</p>' +
		'<p>This <a href="https://modelcontextprotocol.io/docs/getting-started/intro" target="_blank" rel="noopener noreferrer">Model Context Protocol</a> (MCP) server and its companion <a href="https://platform.claude.com/docs/en/agents-and-tools/agent-skills/overview" target="_blank" rel="noopener noreferrer">agent skill</a> address these barriers by giving AI assistants structured, read-only access to the entire IWAC through the <a href="https://modelcontextprotocol.io/" target="_blank" rel="noopener noreferrer">Model Context Protocol</a> — an open standard that does for AI what the <a href="https://iiif.io/" target="_blank" rel="noopener noreferrer">International Image Interoperability Framework</a> (IIIF) does for images: a decentralised interface that preserves institutional data sovereignty while enabling discovery.</p>' +
		'<h3>What the server provides</h3>' +
		'<p>Sixteen read-only tools let any MCP-compatible AI assistant — Claude, ChatGPT, or open-source models — search and retrieve data from the collection without API credentials. The tools cover:</p>' +
		'<ul>' +
		'<li><strong>Article search:</strong> Find newspaper articles by keyword, country, newspaper, subject, date range, or any combination</li>' +
		'<li><strong>Full article retrieval:</strong> Access complete metadata and OCR text for individual articles</li>' +
		'<li><strong>Authority records:</strong> Query the index of persons, places, organisations, events, and subjects, with frequency statistics and date ranges</li>' +
		'<li><strong>Sentiment analysis:</strong> Retrieve and compare polarity, centrality, and subjectivity assessments from three AI models (Gemini, ChatGPT, Mistral) for any article</li>' +
		'<li><strong>Collection statistics:</strong> Get aggregate data on corpus size, newspaper coverage, and cross-country comparisons</li>' +
		'</ul>' +
				'<h3>The agent skill: from plumbing to intelligence</h3>' +
		'<p>A server alone provides plumbing — raw access to data. The companion <a href="https://github.com/fmadore/iwac-mcp-server/tree/main/.claude/skills/iwac-mcp" target="_blank" rel="noopener noreferrer">agent skill</a>, a modular instruction set written in Markdown, encodes the domain knowledge that transforms tool access into methodical research. It structures the AI\'s reasoning into a five-phase workflow inspired by archival research practice:</p>' +
		'<ol>' +
		'<li><strong>Scoping:</strong> Assess collection coverage for a given topic across countries, newspapers, and time periods</li>' +
		'<li><strong>Systematic searching:</strong> Deploy French-language variants and Arabic-Islamic transliteration alternatives to overcome the vocabulary problem</li>' +
		'<li><strong>Deep reading:</strong> Retrieve and analyse full-text articles, comparing sentiment assessments across AI models</li>' +
		'<li><strong>Triangulation:</strong> Cross-reference findings across subsets — articles, index entries, publications, references — to build a fuller picture</li>' +
		'<li><strong>Synthesis:</strong> Produce structured findings with source attribution and confidence grading</li>' +
		'</ol>' +
		'<p>The skill also documents collection biases — which countries and decades have stronger coverage, which newspapers are over- or under-represented — so that the AI can contextualise its findings rather than present them as exhaustive.</p>' +
		'<h3>Why MCP rather than fine-tuning?</h3>' +
		'<p>Approaches like fine-tuning or retrieval-augmented generation require surrendering data to external training pipelines. MCP takes a different path: the collection stays on its own infrastructure while AI assistants query it through defined, inspectable tools. For African digital collections, historically subject to extractive knowledge practices, this matters. The institution retains full control over its data. The skill layer makes every assumption transparent and versionable. And because MCP is an open standard, any AI model — commercial or open-source — can use the same tools without vendor lock-in.</p>' +
		'<p><a href="https://github.com/fmadore/iwac-mcp-server" target="_blank" rel="noopener noreferrer" class="btn btn-primary">View on GitHub</a></p>',
	imageUrl: '/images/digital-humanities/iwac-mcp-server.webp',
	order: 0,
	skills: [
		'Python',
		'Model Context Protocol',
		'LLM',
		'Prompt Engineering',
		'pandas',
		'Hugging Face',
		'JSON',
		'Omeka S API'
	],
	seoKeywords: [
		'Model Context Protocol',
		'MCP server',
		'AI assistants',
		'digital humanities',
		'Islam West Africa',
		'IWAC',
		'semantic search',
		'agent skill',
		'data sovereignty',
		'open standard',
		'Claude',
		'archival research'
	]
};
