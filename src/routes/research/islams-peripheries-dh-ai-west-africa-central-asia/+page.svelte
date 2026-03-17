<script lang="ts">
	import ResearchProjectLayout from '$lib/components/research/ResearchProjectLayout.svelte';
	import RelevantGrants from '$lib/components/panels/RelevantGrants.svelte';
</script>

<ResearchProjectLayout
	title="Islam's 'Peripheries': Digital Humanities, Algorithmic Analysis, and AI in West Africa and Central Asia"
	shortTitle="Islam's 'Peripheries'"
	slug="islams-peripheries-dh-ai-west-africa-central-asia"
	years="2026-2027"
	imageSrc="islams-peripheries.webp"
	imageAlt="Islam's 'Peripheries': Digital Humanities, Algorithmic Analysis, and AI in West Africa and Central Asia"
	seoDescription="A research project using AI to unlock historical collections about Islamic communities in West Africa and Central Asia, focusing on comparative analysis of Islamic discourse and responses to modernity."
	seoKeywords="Digital Humanities, AI, West Africa, Central Asia, Islam, Archives, Comparative History, Algorithmic Analysis"
	projectName="Islam's 'Peripheries': Digital Humanities, Algorithmic Analysis, and AI in West Africa and Central Asia"
>
	<p class="lead">
		This research project (2026-2027), co-directed with <a
			href="https://www.zmo.de/en/people/dr-aksana-ismailbekova"
			target="_blank"
			rel="noopener noreferrer">Aksana Ismailbekova</a
		>, uses artificial intelligence (AI) to unlock valuable historical collections about Islamic
		communities in West Africa and Central Asia. These archives contain thousands of documents in
		multiple languages (including Russian, Arabic, Hausa, and Tajik) that have remained largely
		inaccessible due to their volume and complexity.
	</p>

	<p>
		The project focuses on two often-overlooked regions: West Africa (post-1960s) and Central Asia
		(colonial/early Soviet era and documents from the Tajik civil war, 1992-97). By comparing these
		regions, we explore how Islamic discourse and responses to modernity developed in different
		contexts.
	</p>

	<h2>Three Innovations</h2>
	<ol>
		<li>
			<strong>From raw documents to structured data.</strong> Current multimodal LLMs (notably Gemini)
			now outperform specialised OCR/HTR systems, even on low-resource languages and diverse scripts (Hausa,
			Arabic, Cyrillic, Old Tatar, Tajik). Combined with context-aware named entity extraction, these
			workflows transform raw documents into structured, interconnected data.
		</li>
		<li>
			<strong>AI-mediated access via MCP and a chatbot.</strong> A
			<a href="https://modelcontextprotocol.io/" target="_blank" rel="noopener noreferrer"
				>Model Context Protocol</a
			> (MCP) server provides a standardised interface for any AI assistant to query both collections,
			while an AI "skill" encodes curatorial expertise (search strategies, transliteration variants, bias
			documentation). A researcher can ask a single question in natural language and interrogate both
			archives simultaneously &mdash; no need to master eight languages. The planned deliverable is a
			conversational assistant on the project website, powered by an open-source LLM.
		</li>
		<li>
			<strong>Equitable, accessible, sustainable.</strong> Open-source, low-resource AI models run
			locally without expensive infrastructure. A human-in-the-loop approach (e.g. the
			<a
				href="https://github.com/fmadore/AI-NER-Validator"
				target="_blank"
				rel="noopener noreferrer">AI-NER-Validator</a
			>) ensures domain experts retain final authority. All code, data, and publications released as
			open access (FAIR principles).
		</li>
	</ol>

	<p>
		This approach will reveal previously hidden connections and demonstrate how diverse Islamic
		communities navigated major historical transitions. All findings and tools will be made freely
		available, benefiting researchers worldwide, especially in West Africa and Central Asia.
	</p>

	<h2>Unlocking "Peripheral" Archives</h2>
	<p>
		Our work focuses on two unique, multilingual archives housed at <a
			href="https://www.zmo.de/en"
			target="_blank"
			rel="noopener noreferrer">Leibniz-Zentrum Moderner Orient (ZMO)</a
		>:
	</p>
	<ul>
		<li>
			The <a href="https://islam.zmo.de/s/westafrica/" target="_blank" rel="noopener noreferrer"
				><em>Islam West Africa Collection</em></a
			>: 14,500+ items (newspapers, Islamic publications, 9,315 minutes of Hausa audio, photographs)
			covering Islam and Muslim communities in six West African countries from the 1960s onward.
		</li>
		<li>
			The <a
				href="https://www.zmo.de/en/library/special-collection-1/translate-to-english-reinhard-eisener-bestand"
				target="_blank"
				rel="noopener noreferrer"><em>Reinhard Eisener Collection</em></a
			>: 1,546 documents across 50 archival boxes in eight languages (Russian, Uzbek, Tajik,
			Persian, Turki, English, German, French), documenting the Emirate of Bukhara (1917&ndash;30),
			early Soviet governance, and the Tajik civil war (1992&ndash;97).
		</li>
	</ul>

	<p>
		By combining expertise in regional studies, history, and AI, this project will uncover important
		historical insights while creating new methods for studying complex archives globally.
	</p>

	<RelevantGrants
		projectName="Islam's 'Peripheries': Digital Humanities, Algorithmic Analysis, and AI in West Africa and Central Asia"
	/>
</ResearchProjectLayout>
