import type { DigitalHumanitiesProject } from '$lib/types/digitalHumanities';

export const raisPublications: DigitalHumanitiesProject = {
	id: 'rais-publications',
	title: 'RAIS Publications',
	years: '2026',
	shortDescription:
		"Embeddable visualisations of the publications of the University of Bayreuth's Research Center for AI in Science and Society (RAIS): a semantic map, keyword and co-author networks, and a dashboard, rebuilt every week from the university repository.",
	description: `
		<p>What does a research centre on artificial intelligence actually write about, and who writes with whom? <a href="https://fmadore.github.io/RAIS-Publications/" target="_blank" rel="noopener noreferrer">RAIS Publications</a> answers from the centre's own record. It takes every publication that the <a href="https://eref.uni-bayreuth.de/view/divisions/310022.html" target="_blank" rel="noopener noreferrer">Research Center for AI in Science and Society (RAIS)</a> at the University of Bayreuth has registered in ERef Bayreuth, the university's repository, and draws it four ways. I built it in October 2026.</p>

		<h2>Four views</h2>
		<ul>
			<li><strong>Semantic map</strong>: each publication placed by what its title, keywords and abstract say, so related work sits together across journals and disciplines, grouped into topics, with each publication's nearest neighbours one click away</li>
			<li><strong>Keyword network</strong>: the authors' own keywords, linked when they appear on the same publication</li>
			<li><strong>Co-author network</strong>: who publishes with whom, inside and beyond the University of Bayreuth</li>
			<li><strong>Dashboard</strong>: publications by year, type, topic, keyword and author, with the full list</li>
		</ul>
		<p>It currently covers 196 publications by 640 authors, from 2022 onwards.</p>

		<h2>Made to be embedded</h2>
		<p>Each view stands on its own and can be dropped into any web page: the centre's site, a project page or a presentation. A "Copy embed code" button captures the current filters, so an embedded view can open on a single author, keyword, topic or period, in light or dark. The pages load no outside services and need no server or database.</p>

		<h2>How it's built</h2>
		<p>A Python pipeline reads ERef's export, merges variant spellings of keywords and author names, places each publication with Google's open EmbeddingGemma 2 model and lays out the networks. The result is a static site that GitHub Actions rebuilds every week, processing only what is new. The charts use <a href="https://echarts.apache.org/" target="_blank" rel="noopener noreferrer">ECharts</a> and the maps and networks <a href="https://maplibre.org/" target="_blank" rel="noopener noreferrer">MapLibre GL</a>. The visualisations are adapted from the ones I built for <a href="/digital-humanities/amira">AMIRA</a>, here reading a simple data file instead of a database.</p>
	`,
	imageUrl: '/images/digital-humanities/rais-publications.webp',
	order: 2,
	links: [
		{ url: 'https://fmadore.github.io/RAIS-Publications/' },
		{
			url: 'https://github.com/fmadore/RAIS-Publications',
			label: 'RAIS-Publications',
			type: 'code'
		},
		{
			url: 'https://eref.uni-bayreuth.de/view/divisions/310022.html',
			label: 'RAIS publications in ERef Bayreuth',
			type: 'data'
		}
	],
	skills: [
		'Python',
		'Embeddings',
		'UMAP',
		'Network graphs',
		'ECharts',
		'MapLibre GL',
		'Data Visualisation',
		'Bibliometrics',
		'GitHub Actions'
	],
	embeddableContent: [
		{
			type: 'iframe',
			id: 'rais-semantic-map-embed',
			src: 'https://fmadore.github.io/RAIS-Publications/semantic-map.html?header=0',
			title: 'Semantic map',
			description:
				'<p>The RAIS publications placed by what they say. Colour them by type or topic, filter by year, keyword or author, and select a dot to see its nearest neighbours.</p>',
			showTitle: true,
			variant: 'responsive'
		},
		{
			type: 'iframe',
			id: 'rais-coauthor-network-embed',
			src: 'https://fmadore.github.io/RAIS-Publications/coauthor-network.html?header=0',
			title: 'Co-author network',
			description:
				'<p>Authors linked by their joint publications, coloured by University of Bayreuth affiliation or by group. Search an author to see their collaborators.</p>',
			showTitle: true,
			variant: 'responsive'
		}
	],
	seoKeywords: [
		'RAIS',
		'Research Center for AI in Science and Society',
		'University of Bayreuth',
		'artificial intelligence',
		'semantic map',
		'co-authorship network',
		'bibliometrics',
		'embeddings',
		'data visualisation',
		'digital humanities'
	]
};
