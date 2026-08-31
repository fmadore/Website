import type { Communication } from '$lib/types/communication';

export const responsibleAiAccessMcpServer2026: Communication = {
	id: 'responsible-ai-access-mcp-server-2026',
	title: 'Responsible AI Access to Research Repositories: An MCP Server for African Studies Data',
	authors: [
		'Frédérick Madore',
		'Oliver Baumann',
		'Durgesh Nandini',
		'Neeraj Thandayan Viswajith',
		'Jiayu Yang',
		'Mirco Schönfeld'
	],
	date: '25 September 2026',
	dateISO: '2026-09-25',
	year: 2026,
	conference: 'AI Day 2026, Research Center for AI in Science and Society (RAIS²)',
	location: 'University of Bayreuth',
	country: 'Germany',
	type: 'poster',
	language: 'English',
	abstract: `As large language models (LLMs) increasingly mediate access to digital repositories, institutions face a choice between blocking AI access entirely and surrendering their data to unrestricted extraction. We argue for a third position, mediated openness, and demonstrate it through an open-source Model Context Protocol (MCP) server built for the Africa Multiple Interactive Research Atlas (AMIRA), the multilingual research-data platform for African studies developed within the “Africa Multiple” Cluster of Excellence. The server lets conversational AI assistants query AMIRA’s metadata on the institution’s own terms: read-only, provenance-preserving, and governed by the underlying data reconciliation infrastructure rather than by model inference. Twenty-six tools cover structured search, record retrieval, full-text and transcript search, and relational discovery; the signature tool, FindRelated, operationalises co-occurrence across people, places, subjects, projects and formats, turning a static metadata graph into something an LLM can reason over responsibly. We evaluate the system along the two axes most relevant to trustworthy AI-mediated research access: response stability and source fidelity across repeated sessions. Identical queries posed in independent sessions returned identical, correctly ordered result sets, and even a misspelled query was resolved correctly rather than producing a fabricated answer. MCP does not resolve the political economy of AI data extraction, but it offers institutions a concrete, sovereignty-preserving architecture that keeps governance, provenance and epistemic authority with the data holder rather than the model.`,
	tags: [
		'MCP',
		'AMIRA',
		'Africa Multiple',
		'Large Language Models',
		'AI',
		'Data Sovereignty',
		'Metadata',
		'Digital Humanities',
		'African Studies'
	],
	url: 'https://www.rais2.uni-bayreuth.de/en/events/ai_day_2026/index.html',
	urlLabel: 'Event Website',
	image: 'images/communications/responsible-ai-access-mcp-server-2026.webp',
	heroImage: {
		src: 'images/communications/responsible-ai-access-mcp-server-2026.webp',
		alt: 'Social card for the AI Day 2026 of the University of Bayreuth: an aerial photograph of the campus, its buildings and lawns seen from above, with a green band across the foot carrying the title “AI Day 2026 der Universität Bayreuth” and the subtitle “Towards Responsible and Sovereign AI for Industry”. The RAIS² logo sits at the top left and the University of Bayreuth logo at the top right.'
	},
	coordinates: {
		latitude: 49.9427,
		longitude: 11.5674
	},
	project: 'Digital Research Environment (University of Bayreuth)'
};
