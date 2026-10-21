import type { DigitalHumanitiesProject } from '#lib/types/digitalHumanities.ts';

export const amira: DigitalHumanitiesProject = {
	id: 'amira',
	title: 'Africa Multiple Interactive Research Atlas (AMIRA)',
	years: '2026',
	shortDescription:
		'The research-data platform of the Africa Multiple Cluster of Excellence: one place to search, map and connect thousands of research items, projects, people, publications, podcasts and videos from partner centres in Africa, Brazil and Germany.',
	description: `
		<p>What recordings, photographs, manuscripts and datasets do the Cluster's research projects work with, and who can tell you more about them? The Africa Multiple Interactive Research Atlas (AMIRA) answers that from one place. It is the research-data platform of the <a href="https://www.africamultiple.uni-bayreuth.de/" target="_blank" rel="noopener noreferrer">Africa Multiple Cluster of Excellence</a> at the <a href="https://www.uni-bayreuth.de/en" target="_blank" rel="noopener noreferrer">University of Bayreuth</a>, and it is open to anyone, with no account needed.</p>
		<p>The atlas describes nearly 3,800 research items in 28 languages, from more than 90 projects, linked to over 2,000 people and nearly 700 organisations. It also gathers the Cluster's publications, podcasts and recorded talks, with their transcripts searchable. AMIRA is a catalogue: the material itself usually stays with the researchers, archives and libraries that look after it, and every record says whom to ask for access.</p>

		<h2>Shared curation, distributed storage</h2>
		<p>AMIRA is the public face of the Cluster's <a href="https://www.africamultiple.uni-bayreuth.de/en/1_5-Digital-Solutions1/index.html" target="_blank" rel="noopener noreferrer">Digital Research Environment (DRE)</a>. Curation is a joint effort with the <a href="https://www.africamultiple.uni-bayreuth.de/en/1_1-About-Us/african-cluster-centres/index.html" target="_blank" rel="noopener noreferrer">Africa Multiple Research Centres</a> at Université Joseph Ki-Zerbo in Ouagadougou, the University of Lagos, Moi University and Rhodes University, alongside the Federal University of Bahia. Each centre describes the collections it knows best.</p>
		<p>Storage stays distributed. Data remains in its local repository, while Bayreuth holds the descriptions that point to it, so research data becomes findable without being moved. The FAIR and CARE principles guide the whole design: data should be easy to find and reuse, and governed together with the communities it comes from.</p>

		<h2>What you can explore</h2>
		<ul>
			<li><strong>Search</strong>: one search bar across twelve collections, from research items and publications to people, places and podcast transcripts, each with its own filters</li>
			<li><strong>Maps</strong>: where items were made, where they are held today, and where the Cluster's publications appeared</li>
			<li><strong>Networks</strong>: a knowledge graph on every record that you can drag and explore, and maps of who works with whom across projects, institutions and publications</li>
			<li><strong>Dashboards</strong>: charts and timelines for every project, person, place and subject, and a feed of what is new</li>
			<li><strong>Comparisons</strong>: any two projects, people, institutions, subjects or languages side by side</li>
			<li><strong>Related content</strong>: a semantic map that groups publications, projects, podcasts and videos by meaning across languages, and suggestions of similar records on each page</li>
			<li><strong>Collections</strong>: photo collections as a grid, a map or a timeline</li>
		</ul>

		<h2>How it's built</h2>
		<p>AMIRA runs on <a href="https://omeka.org/s/" target="_blank" rel="noopener noreferrer">Omeka S</a>, extended by modules I developed. They share one design system, with light and dark modes:</p>
		<ul>
			<li><strong><a href="https://github.com/AM-Digital-Research-Environment/DRE-theme" target="_blank" rel="noopener noreferrer">DRE-theme</a></strong>: the look and feel, in the Cluster's green</li>
			<li><strong><a href="https://github.com/AM-Digital-Research-Environment/DRESearch" target="_blank" rel="noopener noreferrer">DRE Search</a></strong>: fast filtered search across all twelve collections</li>
			<li><strong><a href="https://github.com/AM-Digital-Research-Environment/DRE-Visualizations" target="_blank" rel="noopener noreferrer">DRE Visualizations</a></strong>: the charts, maps, networks and semantic map</li>
			<li><strong><a href="https://github.com/AM-Digital-Research-Environment/DRE-LinkedData" target="_blank" rel="noopener noreferrer">DRE Linked Data</a></strong>: a permanent address for every record that machines can read as well as people, linked to Wikidata, the German National Library and the Library of Congress, with the whole dataset available to download</li>
			<li><strong><a href="https://github.com/AM-Digital-Research-Environment/DRE-SEO" target="_blank" rel="noopener noreferrer">DRE SEO</a></strong>: the metadata that helps search engines find each record and lets Zotero cite it</li>
		</ul>
		<p>Behind the scenes, the Cluster's research data lives in a MongoDB database. A sync pipeline publishes it to AMIRA and keeps it up to date, together with the Cluster's publication repository and its YouTube channel. The site itself is hosted with my <a href="/digital-humanities/omeka-s-docker">Omeka S Docker template</a>.</p>

		<h2>Ask AMIRA through an AI assistant</h2>
		<p>More and more researchers start with a question to an AI assistant rather than a catalogue search. The <a href="https://github.com/AM-Digital-Research-Environment/amira-mcp-server" target="_blank" rel="noopener noreferrer">AMIRA MCP server</a> lets an assistant query the atlas directly through the open <a href="https://modelcontextprotocol.io/" target="_blank" rel="noopener noreferrer">Model Context Protocol</a>. It can search records, read podcast and video transcripts, and follow connections across the collection, all in plain language. Every answer links back to the AMIRA page it came from.</p>
		<p>The server is read-only and serves AMIRA's public records, and a bundled snapshot keeps it working even when the site is offline. What the assistant retrieves still reaches the company behind that assistant, under its own terms.</p>
	`,
	imageUrl: `/images/digital-humanities/amira.webp`,
	featured: true,
	order: 2,
	links: [
		{ url: 'https://data.africamultiple.uni-bayreuth.de/s/amira' },
		{
			url: 'https://github.com/AM-Digital-Research-Environment/DRE-theme',
			label: 'DRE-theme',
			type: 'code'
		},
		{
			url: 'https://github.com/AM-Digital-Research-Environment/DRESearch',
			label: 'DRESearch',
			type: 'code'
		},
		{
			url: 'https://github.com/AM-Digital-Research-Environment/DRE-Visualizations',
			label: 'DRE-Visualizations',
			type: 'code'
		},
		{
			url: 'https://github.com/AM-Digital-Research-Environment/DRE-LinkedData',
			label: 'DRE-LinkedData',
			type: 'code'
		},
		{
			url: 'https://github.com/AM-Digital-Research-Environment/DRE-SEO',
			label: 'DRE-SEO',
			type: 'code'
		},
		{
			url: 'https://github.com/AM-Digital-Research-Environment/omeka-s-docker',
			label: 'omeka-s-docker',
			type: 'code'
		},
		{
			url: 'https://github.com/AM-Digital-Research-Environment/amira-mcp-server',
			label: 'amira-mcp-server',
			type: 'code'
		}
	],
	skills: [
		'Omeka S',
		'PHP',
		'Python',
		'TypeScript',
		'Svelte 5',
		'MongoDB',
		'Typesense',
		'Docker',
		'ECharts',
		'D3.js',
		'MapLibre GL',
		'Linked Open Data',
		'Wikidata',
		'Semantic search',
		'Model Context Protocol',
		'Data visualisation'
	]
};
