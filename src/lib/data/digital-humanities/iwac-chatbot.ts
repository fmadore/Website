import type { DigitalHumanitiesProject } from '$lib/types/digitalHumanities';

export const iwacChatbot: DigitalHumanitiesProject = {
	id: 'iwac-chatbot',
	title: 'IWAC Chatbot',
	years: '2025-',
	shortDescription:
		'A chatbot that uses Retrieval Augmented Generation (RAG) to enable semantic exploration of the Islam West Africa Collection. Users can ask complex questions in natural language and receive answers grounded in the archive\'s newspaper articles.',
	description:
		'<p>The IWAC Chatbot offers a new way to explore the <a href="https://islam.zmo.de/s/westafrica/" target="_blank" rel="noopener noreferrer"><em>Islam West Africa Collection</em></a> (IWAC) through natural language conversation. Instead of relying on exact keywords, users can ask complex questions and receive synthesized answers drawn directly from the collection\'s newspaper articles.</p><h3>Why a Chatbot?</h3><p>Keyword searches have significant limitations for historical research. They miss synonyms, struggle with historical vocabulary and OCR errors, and cannot capture conceptual relationships. A search for "hajj" won\'t find documents discussing "pilgrimage to Mecca" unless those exact words appear.</p><p>The chatbot overcomes these barriers using semantic search. It understands meaning beyond surface terms, recognizing that documents about "hijab" may be relevant to questions about "veiling practices"—even without keyword overlap.</p><h3>How It Works</h3><p>The system uses Retrieval-Augmented Generation (RAG) to connect a Large Language Model to the IWAC\'s document collection. When you ask a question like "What were the difficulties of organising the pilgrimage to Mecca in Togo?", it retrieves the most relevant articles based on meaning, then generates a response grounded exclusively in those sources—with citations and links for verification.</p><p>This approach addresses a common problem with AI: the tendency to invent information. By anchoring responses in actual documents, every answer can be traced back to its sources.</p><h3>Features</h3><ul><li><strong>Natural language queries:</strong> Ask complex questions without mastering specialized search techniques</li><li><strong>Semantic connections:</strong> Discover thematic links that keyword searches would miss</li><li><strong>Filtering options:</strong> Narrow results by date, newspaper, location, or subject</li><li><strong>Full transparency:</strong> Every response includes citations and direct links to IWAC documents</li></ul><h3>Try It Now</h3><p>While the custom chatbot is being finalized, an <a href="https://notebooklm.google.com/notebook/2378f15e-0cd1-4e1a-9b42-8301046b163f" target="_blank" rel="noopener noreferrer">IWAC workspace is available in Google NotebookLM</a>. Over 11,500 newspaper articles have been loaded as sources. Users can chat in multiple languages and generate summaries, audio overviews, and structured reports—all grounded in the IWAC corpus.</p><p>The chatbot prototype is <a href="https://github.com/fmadore/IWAC-RAG" target="_blank" rel="noopener noreferrer">available on GitHub</a>.</p>',
	imageUrl: '/images/digital-humanities/iwac-chatbot.webp',
	order: 5,
	skills: [
		'RAG',
		'LLM',
		'Ollama',
		'Docker',
		'Semantic Search',
		'Embeddings',
		'Vector Database',
		'Chroma',
		'JSON',
		'Prompt Engineering',
		'Google NotebookLM'
	]
};
