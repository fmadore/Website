import type { DigitalHumanitiesProject } from '#lib/types/digitalHumanities.ts';

export const iwacBibliographicDataWikidata: DigitalHumanitiesProject = {
	id: 'iwac-bibliographic-data-wikidata',
	title: 'IWAC Bibliographic Data on Wikidata',
	years: '2023-',
	shortDescription:
		'The bibliography of the Islam West Africa Collection on Wikidata: nearly all of its 867 references, open to SPARQL queries and drawn as automatic Scholia profiles of the field.',
	description: `
		<p>The <a href="/digital-humanities/iwac">Islam West Africa Collection</a> (IWAC) includes a bibliography of 867 references on Islam in West Africa. In 2023, in the spirit of open science and the <a href="https://meta.wikimedia.org/wiki/WikiCite" target="_blank" rel="noopener noreferrer">WikiCite</a> initiative, I began publishing it on <a href="https://www.wikidata.org/" target="_blank" rel="noopener noreferrer">Wikidata</a>, the free knowledge base behind Wikipedia and its sister projects. Today 846 of those references have a Wikidata item, and each IWAC record links to it.</p>
		<p>On Wikidata the references join a shared web of linked data, in which their authors, journals, publishers and subjects connect to everything else in the knowledge base. That makes the bibliography easier to find and reuse, and open to questions a printed list cannot answer: who writes about Islam in Niger, with whom, and in which journals. Anyone can ask them with a SPARQL query.</p>

		<h2>Visualisations with Scholia</h2>
		<p>Wikidata also powers <a href="https://scholia.toolforge.org/" target="_blank" rel="noopener noreferrer">Scholia</a>, which draws a scholarly profile of any topic automatically. The profile of <a href="https://qlever.scholia.wiki/topic/Q3081878" target="_blank" rel="noopener noreferrer">Islam in Burkina Faso</a>, for example, shows:</p>
		<ul>
			<li><strong>Publications per year</strong> on the topic</li>
			<li><strong>The authors</strong> who publish on it, ranked by output and by citations</li>
			<li><strong>Co-author networks</strong> showing who works with whom</li>
			<li><strong>Related topics</strong>, as a graph and on a map</li>
			<li><strong>Citations</strong>: the works and authors cited most often</li>
			<li><strong>A map</strong> of the institutions involved</li>
		</ul>
		<p>These profiles update themselves as Wikidata grows. The links on this page use Scholia's QLever mirror: since Wikidata moved scholarly articles into a separate database in 2026, the main Scholia site sees only part of the data, about half of the 326 works on Islam in Burkina Faso.</p>
	`,
	imageUrl: `/images/digital-humanities/iwac-bibliographic-data-wikidata.svg`,
	order: 8,
	// Scholia topic profiles built from the uploaded references — one per country
	// the collection covers. Labelled, since a bare /topic/Q3081878 says nothing.
	// The QLever mirror, not scholia.toolforge.org: since the 2026 Wikidata graph
	// split, the Toolforge instance sees only the main graph (164 of 326 works on
	// Islam in Burkina Faso in October 2026).
	links: [
		{ url: 'https://qlever.scholia.wiki/topic/Q3155361', label: 'Islam in Benin', type: 'data' },
		{
			url: 'https://qlever.scholia.wiki/topic/Q3081878',
			label: 'Islam in Burkina Faso',
			type: 'data'
		},
		{
			url: 'https://qlever.scholia.wiki/topic/Q4119820',
			label: "Islam in Côte d'Ivoire",
			type: 'data'
		},
		{ url: 'https://qlever.scholia.wiki/topic/Q3087639', label: 'Islam in Niger', type: 'data' },
		{ url: 'https://qlever.scholia.wiki/topic/Q522809', label: 'Islam in Togo', type: 'data' }
	],
	skills: [
		'Wikidata',
		'WikiCite',
		'OpenRefine',
		'Scholia',
		'SPARQL',
		'Linked Data',
		'Metadata Standards'
	],
	seoKeywords: [
		'Wikidata',
		'WikiCite',
		'Scholia',
		'SPARQL',
		'linked open data',
		'bibliography',
		'open science',
		'Islam West Africa',
		'IWAC',
		'digital humanities'
	]
};
