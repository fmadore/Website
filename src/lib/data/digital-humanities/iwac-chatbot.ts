import type { DigitalHumanitiesProject } from '$lib/types/digitalHumanities';

export const iwacChatbot: DigitalHumanitiesProject = {
	id: 'iwac-chatbot',
	title: 'IWAC Chatbot',
	years: '2025-',
	shortDescription:
		'A chatbot that uses Retrieval Augmented Generation (RAG) to enable semantic exploration of the Islam West Africa Collection. Users can ask complex questions in natural language and receive answers that are grounded in the documents in the collection.',
	description:
		'<p>The IWAC Chatbot introduces an innovative approach to exploring the <em>Islam West Africa Collection</em> (IWAC) through semantic search, leveraging Retrieval Augmented Generation (RAG). This allows users to move beyond traditional keyword searches and engage with the archive in a more intuitive way, asking complex questions in natural language.</p><p><strong>Core Principle:</strong> The chatbot connects a Large Language Model (LLM) to the specific knowledge base of the IWAC collection at the moment of response generation. This aims to address the inherent limitations of LLMs, such as fixed knowledge cutoffs, potential for hallucinations, and lack of domain-specific depth, by grounding them in reliable documentary sources from the Collection.</p><p><strong>Benefits include:</strong></p><ul><li>Querying the Collection for concepts, nuances, and contexts that are difficult to capture with keywords.</li><li>Revealing subtle thematic connections between documents, even without shared vocabulary.</li><li>Receiving summarized information drawn from multiple archive sources, with references provided for scholarly rigor.</li><li>Enhancing accessibility to the Collection\'s wealth of information for a broader audience, less reliant on traditional archival research expertise.</li></ul><p>The chatbot operates through a three-stage process:</p><ol><li><strong>Preliminary Preparation (One-time):</strong><ul><li>Documents from the collection (e.g., JSON files) are ingested and digitally cleaned.</li><li>Content is segmented into logical chunks (e.g., paragraphs).</li><li>Each chunk is assigned a unique semantic "signature" (vector embedding) representing its meaning.</li><li>These chunks and their embeddings are stored in a specialized vector database (e.g., Chroma) for efficient similarity searching.</li></ul></li><li><strong>Real-time Information Retrieval (Per Question):</strong><ul><li>The user\'s question is also converted into a semantic embedding.</li><li>The system compares this question embedding against the stored document chunk embeddings to find the closest matches.</li><li>The most relevant text segments are selected.</li></ul></li><li><strong>Response Generation:</strong><ul><li>A comprehensive prompt is constructed for the LLM, combining the original question with the retrieved relevant text segments.</li><li>The LLM generates a natural language response based on this contextualized information.</li><li>Critically, the response is founded on information extracted directly from the IWAC documents, and the sources used are listed with links for verification.</li></ul></li></ol><p>The quality of the instructional prompt given to the chatbot is fundamental to its performance.</p>',
	imageUrl: '/images/digital-humanities/iwac-chatbot.webp',
	order: 6,
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
		'Prompt Engineering'
	]
};
