import type { Activity } from '$lib/types';

const volkswagenFoundationGrantIslamsPeripheries: Activity = {
	id: 'volkswagen-foundation-grant-islams-peripheries',
	title: "VolkswagenStiftung grant: Islam's 'Peripheries': Digital Humanities, Algorithmic Analysis, and AI in West Africa and Central Asia",
	date: '10 December 2025',
	dateISO: '2025-12-10',
	year: 2025,
	type: 'Grant',
    heroImage: {
		src: 'images/activities/VolkswagenStiftung-logo.webp',
		alt: 'VolkswagenStiftung logo',
	},
	description: 'Awarded a grant under the Volkswagen Foundation\'s "Open Up" programme for a collaboration with Aksana Ismailbekova on AI-driven comparative history of Islamic archives in West Africa and Central Asia.',
	tags: ['Grant', 'Digital Humanities', 'AI', 'West Africa', 'Central Asia', 'Volkswagen Foundation'],
	content: `
<p>I am delighted to announce that the <a href="https://www.volkswagenstiftung.de/en" target="_blank" rel="noopener noreferrer">Volkswagen Foundation</a> is supporting my research for the second time this year.</p>

<p>This latest grant, awarded under the <a href="https://www.volkswagenstiftung.de/en/funding/funding-offer/open-new-research-spaces-humanities-and-cultural-studies" target="_blank" rel="noopener noreferrer">"Open Up – New Research Spaces for the Humanities and Cultural Studies"</a> programme, backs a new collaboration with <a href="https://www.zmo.de/en/people/dr-aksana-ismailbekova" target="_blank" rel="noopener noreferrer">Aksana Ismailbekova</a>: "Islam's 'Peripheries': Digital Humanities, Algorithmic Analysis, and AI in West Africa and Central Asia."</p>

<h3>The Collections</h3>
<p>Our work will focus on two unique, multilingual digital collections housed at <a href="https://www.zmo.de/en" target="_blank" rel="noopener noreferrer">Leibniz-Zentrum Moderner Orient (ZMO)</a>:</p>
<ul>
    <li>The <a href="https://islam.zmo.de/s/westafrica/" target="_blank" rel="noopener noreferrer"><em>Islam West Africa Collection</em></a>: Covering post-1960s Islamic discourse and public engagement.</li>
    <li>The <a href="https://www.zmo.de/en/library/special-collection-1/translate-to-english-reinhard-eisener-bestand" target="_blank" rel="noopener noreferrer"><em>Reinhard Eisener Collection</em></a>: Documenting colonial and early Soviet governance in Central Asia, including materials from the Tajik civil war.</li>
</ul>

<p>Containing thousands of documents across languages including Arabic, Hausa, French, Russian, and Tajik, these collections offer rare insights into how Islamic communities navigated modernity and state-building. However, their volume and linguistic diversity present a significant challenge for traditional comparative analysis.</p>

<h3>The Method: AI-Driven Comparative History</h3>
<p>To bridge these regions, we are developing specific AI workflows that go beyond simple keyword searches. By employing <strong>Retrieval Augmented Generation (RAG)</strong> and context-aware entity extraction, we aim to:</p>
<ol>
    <li><strong>Structure the Unstructured:</strong> Transform scanned images into structured data, revealing connections between actors and concepts that would otherwise remain hidden in the archives.</li>
    <li><strong>Democratise Access:</strong> We are prioritising open-source, low-resource AI models. This ensures the technology remains accessible to researchers in West Africa and Central Asia, rather than being locked behind high-resource institutional walls.</li>
    <li><strong>Synthesise Across Languages:</strong> Build a query tool that allows researchers to ask questions in natural language and receive answers drawn from documents in multiple languages.</li>
</ol>

<h3>Looking Ahead</h3>
<p>The project is not just about extracting data; it is about building a sustainable network. We will conclude with a workshop specifically targeting scholars and archivists from both regions. By involving local experts in the refinement of these tools, we aim to ensure the digital infrastructure we build serves the communities it studies long after the project concludes.</p>
`
};

export default volkswagenFoundationGrantIslamsPeripheries;
