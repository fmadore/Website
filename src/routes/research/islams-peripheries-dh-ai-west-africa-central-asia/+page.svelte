<script lang="ts">
	import ResearchProjectLayout from '$lib/components/research/ResearchProjectLayout.svelte';
	import { researchProject } from '$lib/data/research';
	import RelevantGrants from '$lib/components/panels/RelevantGrants.svelte';
</script>

<ResearchProjectLayout {...researchProject('islams-peripheries-dh-ai-west-africa-central-asia')}>
	<p class="lead">
		Co-directed with <a
			href="https://www.zmo.de/en/people/dr-aksana-ismailbekova"
			target="_blank"
			rel="noopener noreferrer">Aksana Ismailbekova</a
		>, this project tests what artificial intelligence (AI) can do with two multilingual collections
		on Islamic communities in West Africa and Central Asia. Between them they hold thousands of
		documents whose volume and range of languages have kept most of the material out of reach.
	</p>

	<p>
		Both regions sit at the edge of how Islamic history is usually written: West Africa since the
		1960s, Central Asia across the colonial and early Soviet periods and the Tajik civil war of
		1992&ndash;97. Reading them against each other compares Islamic discourse and responses to
		modernity under two different secular orders: <em>laïcité</em> in francophone West Africa, Soviet
		and post-Soviet secularism in Central Asia.
	</p>

	<h2>Three Aims</h2>
	<ol>
		<li>
			<strong>From documents to structured data.</strong> Multimodal LLMs now outperform specialised OCR
			and HTR systems on low-resource languages and unfamiliar scripts: Hausa, Arabic, Cyrillic, Old Tatar,
			Tajik. Paired with context-aware entity extraction, we expect them to turn scanned pages into records
			that can be queried and linked.
		</li>
		<li>
			<strong>Access through MCP and a chatbot.</strong> We plan a
			<a href="https://modelcontextprotocol.io/" target="_blank" rel="noopener noreferrer"
				>Model Context Protocol</a
			> (MCP) server that gives any AI assistant a single interface onto both collections, with a companion
			"skill" that encodes curatorial judgement: search strategies, transliteration variants, documented
			bias. A researcher should then be able to put one question in natural language to both collections
			at once, without reading every language in them. The intended deliverable is a conversational assistant
			on the project website, running on an open-source LLM.
		</li>
		<li>
			<strong>Open, local, reviewable.</strong> What the project builds is pipelines: code that
			calls existing LLMs to run OCR, handwriting recognition, and entity extraction. They are
			designed for open-source models small enough to run locally, without costly infrastructure.
			Domain experts keep the final say through
			<a
				href="https://github.com/fmadore/AI-NER-Validator"
				target="_blank"
				rel="noopener noreferrer">human-in-the-loop validation</a
			>, and all code, data, and publications are to be released open access under FAIR principles.
		</li>
	</ol>

	<h2>Two "Peripheral" Collections</h2>
	<p>
		Both are held at <a href="https://www.zmo.de/en" target="_blank" rel="noopener noreferrer"
			>Leibniz-Zentrum Moderner Orient (ZMO)</a
		>:
	</p>
	<ul>
		<li>
			The <a href="https://islam.zmo.de/s/westafrica/" target="_blank" rel="noopener noreferrer"
				><em>Islam West Africa Collection</em></a
			>: 14,700+ items (newspapers, Islamic publications, 9,315 minutes of Hausa audio, photographs)
			covering Islam and Muslim communities in six West African countries from the 1960s onward.
		</li>
		<li>
			The <a
				href="https://www.zmo.de/en/library/special-collection-1/translate-to-english-reinhard-eisener-bestand"
				target="_blank"
				rel="noopener noreferrer"><em>Reinhard Eisener Collection</em></a
			>: 1,546 documents across 50 archival boxes in eight languages (Russian, Uzbek, Tajik,
			Persian, Turki, English, German, French), on the Emirate of Bukhara (1917&ndash;30), early
			Soviet governance, and the Tajik civil war (1992&ndash;97).
		</li>
	</ul>

	<p>
		If the methods hold across two collections this different, they should transfer to any
		collection that is large, multilingual, and under-described.
	</p>

	<RelevantGrants
		projectName="Islam's 'Peripheries': Digital Humanities, Algorithmic Analysis, and AI in West Africa and Central Asia"
	/>
</ResearchProjectLayout>
