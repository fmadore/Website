import type { DigitalHumanitiesProject } from '$lib/types/digitalHumanities';

export const iwacMcpServer: DigitalHumanitiesProject = {
	id: 'iwac-mcp-server',
	title: 'IWAC MCP Server',
	years: '2026-',
	shortDescription:
		'An open-source connector that lets AI assistants such as Claude and ChatGPT search, read and analyse the Islam West Africa Collection, with every answer linked back to its sources.',
	description: `
		<p>Search the <a href="https://islam.zmo.de/s/westafrica/" target="_blank" rel="noopener noreferrer"><em>Islam West Africa Collection</em></a> for "hadj" and you get articles about the pilgrimage to Mecca mixed with every man honoured as "El Hadj". A single imam can appear under more than twenty spellings. And a search for "hajj" misses articles that only say "pèlerinage à La Mecque". Keyword search, the default way into most digital archives, struggles with a corpus like this one.</p>
		<p>The IWAC MCP server offers another way in. It lets an AI assistant you already use, such as Claude or ChatGPT, query the collection on your behalf, in any language. The assistant translates your question into suitable searches, reads the relevant records and writes a synthesis in which every claim links back to its source in IWAC, so you can check it yourself.</p>

		<h2>What an assistant can do with it</h2>
		<p>The server works through the <a href="https://modelcontextprotocol.io/" target="_blank" rel="noopener noreferrer">Model Context Protocol</a> (MCP), an open standard for connecting AI assistants to outside sources. It offers nearly forty read-only tools, which let an assistant:</p>
		<ul>
			<li><strong>Search</strong> newspaper articles, Islamic publications, archives, recordings, photographs and academic references, by keyword or by meaning</li>
			<li><strong>Read</strong> full texts and transcriptions, or just the passages around a keyword</li>
			<li><strong>Count and compare</strong>: coverage across countries, newspapers and decades, the topics and places a set of articles dwells on, and even how coverage rises in Ramadan and around Tabaski</li>
			<li><strong>Weigh press attitudes</strong>: how five AI models read the tone of each article, and where they disagree (all five agree on fewer than a third)</li>
			<li><strong>Export</strong> a selection as a bibliography for Zotero or BibTeX</li>
		</ul>
		<p>In Claude, many of these answers appear as interactive charts rather than tables of figures.</p>

		<h2>A method, not only data</h2>
		<p>The server gives access; a companion <a href="https://github.com/fmadore/iwac-mcp-server/tree/main/.agents/skills/iwac-mcp" target="_blank" rel="noopener noreferrer">research skill</a> teaches the assistant how to use it well. It works like an archivist's checklist: first establish what the collection holds, then search French sources with their spelling and transliteration variants (Maouloud, Mawlid), read the key records closely, compare different kinds of material, and report the evidence with its limits. The skill also tells the assistant where the collection is thin, so it does not present partial coverage as the whole story.</p>

		<h2>Connecting, and its limits</h2>
		<p>Anyone can add the hosted connector to Claude or ChatGPT without a download, sign-up or API key; the collection's <a href="https://islam.zmo.de/s/westafrica/page/ai-access" target="_blank" rel="noopener noreferrer">Ask with AI page</a> walks through the setup. Claude Desktop users can also install it in one click, with semantic search running on their own computer.</p>
		<p>The server's own guarantees are modest. It only reads, so it cannot change the archive, and by default it serves only the public dataset, which leaves out the full text IWAC may not redistribute. Every answer points back to its source records.</p>
		<p>Beyond that, control stops at the server. Whatever the assistant retrieves travels to the company that runs it, and whether that company keeps or trains on the conversation depends on its terms and the user's settings, not on IWAC. The public dataset is openly downloadable in any case, by researchers and AI developers alike. Because MCP is an open standard, the same tools also work with open-weight models run locally, the one set-up in which the conversation never leaves the user's computer. For African collections, long subject to extractive knowledge practices, those trade-offs need saying plainly.</p>
	`,
	imageUrl: '/images/digital-humanities/iwac-mcp-server.webp',
	order: 0,
	links: [
		{ url: 'https://islam.zmo.de/s/westafrica/page/ai-access' },
		{ url: 'https://github.com/fmadore/iwac-mcp-server', type: 'code' },
		{ url: 'https://doi.org/10.5281/zenodo.21805837', label: 'Software DOI (Zenodo)', type: 'code' }
	],
	skills: [
		'TypeScript',
		'Model Context Protocol',
		'LLM',
		'Prompt Engineering',
		'Agent skills',
		'DuckDB',
		'Hugging Face',
		'Embeddings',
		'Semantic search',
		'Docker'
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
		'open standard',
		'Claude',
		'ChatGPT',
		'archival research'
	]
};
