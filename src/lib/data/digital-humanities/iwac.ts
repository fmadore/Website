import type { DigitalHumanitiesProject } from '#lib/types/digitalHumanities.ts';

export const iwac: DigitalHumanitiesProject = {
	id: 'iwac',
	title: 'Islam West Africa Collection',
	years: '2023-',
	shortDescription:
		"An open-access archive of nearly 21,000 newspapers, Islamic publications, recordings and documents on Islam and Muslims in Benin, Burkina Faso, Côte d'Ivoire, Niger, Nigeria and Togo.",
	description: `
		<p>How have Muslim communities in West Africa written about themselves, and how has the press written about them? The <em>Islam West Africa Collection</em> (IWAC) gathers the sources that answer that question: newspapers, Islamic magazines and pamphlets, archival documents, audiovisual recordings and photographs from Benin, Burkina Faso, Côte d'Ivoire, Niger, Nigeria and Togo, from the 1960s to today.</p>
		<p>Much of this print culture is fragile and hard to consult, even in the countries that produced it. IWAC puts it online without paywalls or registration. It now holds nearly 21,000 items from 86 newspapers and 24 archives, in ten languages, most of them in French. More than 32 million words are searchable in full, an index of over 5,000 people, places, organisations, events and topics ties the materials together, and a bibliography of 867 references points to the wider scholarship.</p>
		<p>I direct and develop the collection, which is hosted by the <a href="https://www.zmo.de/en" target="_blank" rel="noopener noreferrer">Leibniz-Zentrum Moderner Orient (ZMO)<span class="sr-only"> (opens in new tab)</span></a> in Berlin. It grew out of the award-winning <a href="/digital-humanities/islam-burkina-faso-collection">Islam Burkina Faso Collection</a> I launched in 2021.</p>

		<h2>Finding your way in</h2>
		<p>The search is built to forgive. It ignores accents, so "Cote d'Ivoire" finds the same documents as "Côte d'Ivoire", and it matches meaning as well as words: a search for "laïcité au Burkina" surfaces relevant articles even when those exact words never appear. Results filter by country, newspaper, person, place, subject and year, can be shown on a map, and keep their own web address, so any search can be bookmarked, shared or cited.</p>

		<h2>Seeing patterns</h2>
		<p>Interactive dashboards turn the archive into something you can read at a distance:</p>
		<ul>
			<li><strong>Overviews</strong> of how the collection has grown, which countries and languages it covers, and which newspapers were published when</li>
			<li><strong>Topics and words over time</strong>: thirty themes traced across the decades, the vocabulary that sets each newspaper apart, and a calendar that follows the Islamic months</li>
			<li><strong>Press attitudes</strong>: how several AI models read the tone of coverage of Islam, compared side by side in a <a href="/digital-humanities/iwac-sentiment-analysis">dedicated study</a></li>
			<li><strong>Networks and maps</strong> of the people, organisations and places written about together</li>
			<li><strong>A page of charts for every record</strong>: when and where a person or place appears, what it connects to, the closest articles, and the academic works that discuss the same subject</li>
		</ul>

		<h2>Ask with AI</h2>
		<p>Researchers can also explore IWAC by putting questions to an AI assistant they already use, in any language. The <a href="/digital-humanities/iwac-mcp-server">IWAC MCP server</a> gives the assistant read-only access to the collection, and every answer links back to the records it draws on, so you can check the sources yourself. The collection's <a href="https://islam.zmo.de/s/westafrica/page/ai-access" target="_blank" rel="noopener noreferrer">Ask with AI page<span class="sr-only"> (opens in new tab)</span></a> explains how to connect.</p>

		<h2>How it's built</h2>
		<p>IWAC runs on <a href="https://omeka.org/s/" target="_blank" rel="noopener noreferrer">Omeka S<span class="sr-only"> (opens in new tab)</span></a>, an open-source platform for digital collections, self-hosted at ZMO. I wrote the custom parts, all released as open source:</p>
		<ul>
			<li><strong><a href="https://github.com/fmadore/IWAC-theme" target="_blank" rel="noopener noreferrer">IWAC-theme<span class="sr-only"> (opens in new tab)</span></a></strong>: the bilingual French and English interface, with light and dark modes</li>
			<li><strong><a href="https://github.com/fmadore/IwacSearch" target="_blank" rel="noopener noreferrer">IwacSearch<span class="sr-only"> (opens in new tab)</span></a></strong>: the search, powered by Typesense</li>
			<li><strong><a href="https://github.com/fmadore/IwacVisualizations" target="_blank" rel="noopener noreferrer">IwacVisualizations<span class="sr-only"> (opens in new tab)</span></a></strong>: the charts, maps and networks</li>
			<li><strong><a href="https://github.com/fmadore/IWAC-SEO" target="_blank" rel="noopener noreferrer">IWAC-SEO<span class="sr-only"> (opens in new tab)</span></a></strong>: the metadata that helps search engines find each record and lets Zotero or Google Scholar cite it properly</li>
			<li><strong><a href="https://github.com/fmadore/iwac-vocabulary" target="_blank" rel="noopener noreferrer">iwac-vocabulary<span class="sr-only"> (opens in new tab)</span></a></strong>: a small vocabulary that records which AI model produced each transcription, summary or reading of tone</li>
		</ul>
		<p>Much of the transcription, indexing and summarising runs through <a href="/digital-humanities/iwac-ai-pipelines">AI pipelines</a>, and their results are written back into the archive alongside the name of the model that produced them.</p>

		<h2>The collection as a dataset</h2>
		<p>Omeka S is built for browsing a collection, not for computing over one. A Python pipeline therefore republishes IWAC on <a href="https://huggingface.co/datasets/fmadore/islam-west-africa-collection" target="_blank" rel="noopener noreferrer">Hugging Face<span class="sr-only"> (opens in new tab)</span></a> as seven citable tables, each loadable in a single line of code. They also carry what the archive itself does not: embeddings that capture meaning, topics, word counts, Islamic-calendar dates and the AI models' readings of tone. The dashboards read these same columns, so a figure on the site and a figure computed by an outside researcher rest on the same numbers.</p>
		<p>Rights vary item by item, so the public dataset withholds the full text wherever the source is restricted. That leaves the text of a little under half the newspaper articles and most Islamic publications, while the computed columns are released for every public item. What is open tends to follow publisher and period, so counts from the dataset describe what can be shared rather than everything the collection holds.</p>
	`,
	imageUrl: `/images/digital-humanities/IWAC.webp`,
	featured: true,
	order: 1,
	links: [
		// Two parallel editions, as the description explains — both are entry
		// points, and the French one was the page's original call to action.
		{ url: 'https://islam.zmo.de/s/westafrica' },
		{ url: 'https://islam.zmo.de/s/afrique_ouest' },
		{ url: 'https://github.com/fmadore/IwacSearch', label: 'IwacSearch', type: 'code' },
		{
			url: 'https://github.com/fmadore/IwacVisualizations',
			label: 'IwacVisualizations',
			type: 'code'
		},
		{ url: 'https://github.com/fmadore/IWAC-SEO', label: 'IWAC-SEO', type: 'code' },
		{ url: 'https://github.com/fmadore/IWAC-theme', label: 'IWAC-theme', type: 'code' },
		{ url: 'https://github.com/fmadore/iwac-vocabulary', label: 'iwac-vocabulary', type: 'code' },
		{
			url: 'https://github.com/fmadore/IWAC-Hugging-Face',
			label: 'IWAC-Hugging-Face',
			type: 'code'
		},
		{ url: 'https://huggingface.co/datasets/fmadore/islam-west-africa-collection', type: 'data' }
	],
	reviews: [
		{
			text: 'Anaïs Wion, "Islam West Africa Collection: Dataset, Distant Reading, and Uses of AI for Discourse Analysis", <em>The Digital Orientalist</em> 23 September 2025.',
			url: 'https://digitalorientalist.com/2025/09/23/islam-west-africa-collection-dataset-distant-reading-and-uses-of-ai-for-discourse-analysis/',
			quote:
				'On the one hand, it is a database providing access to material that is difficult to access and highly specific, which can be reused by others and addressed with other research questions. But it is also an exemplary project that can inspire researchers to use the open access tools available to create their own platforms for analyzing and sharing their data. The care taken to comply with open access best practices is truly admirable.'
		}
	],
	skills: [
		'Omeka S',
		'PHP',
		'Python',
		'TypeScript',
		'Svelte 5',
		'Typesense',
		'Semantic search',
		'ECharts',
		'D3.js',
		'MapLibre GL',
		'OCR',
		'OpenRefine',
		'Metadata Standards',
		'Linked Data',
		'IIIF',
		'Docker',
		'Linux',
		'Nginx',
		'Rclone',
		'spaCy',
		'pandas',
		'Hugging Face',
		'Embeddings',
		'Topic Modelling',
		'Web scraping'
	]
};
