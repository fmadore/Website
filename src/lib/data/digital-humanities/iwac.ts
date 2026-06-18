import type { DigitalHumanitiesProject } from '$lib/types/digitalHumanities';

export const iwac: DigitalHumanitiesProject = {
	id: 'iwac',
	title: 'Islam West Africa Collection',
	years: '2023-',
	shortDescription:
		"An open-access archive of over 14,700 items on Islam and Muslims in Benin, Burkina Faso, Côte d'Ivoire, Niger, Nigeria, and Togo.",
	description: `
		<p>The <em>Islam West Africa Collection</em> (IWAC) is an open-access archive of the print and recorded culture of Muslim communities in West Africa: newspapers, Islamic magazines, pamphlets, archival documents, audiovisual recordings, and photographs. It brings together more than 14,700 items from Benin, Burkina Faso, Côte d'Ivoire, Niger, Nigeria, and Togo, most in French and also in Hausa, Arabic, Dendi, and English. Optical character recognition makes every document full-text searchable, an index of more than 4,600 people, places, organisations, events, and topics ties the materials together, and a bibliography of more than 850 references points to the wider scholarship.</p>

		<p>Much of this print culture is fragile and hard to consult, even inside the countries that produced it. IWAC puts it online without paywalls or registration, giving researchers in West Africa and elsewhere an alternative to archives that are often difficult to reach. I direct and develop the collection, which is hosted by the <a href="https://www.zmo.de/en" target="_blank" rel="noopener noreferrer">Leibniz-Zentrum Moderner Orient (ZMO)</a> and grows out of the award-winning <a href="/digital-humanities/islam-burkina-faso-collection">Islam Burkina Faso Collection</a> I launched in 2021.</p>

		<h3>How it is built</h3>
		<p>IWAC runs on <a href="https://omeka.org/s/" target="_blank" rel="noopener noreferrer">Omeka S</a>, an open-source platform for digital collections, deployed as a self-hosted Docker installation at ZMO. To make a corpus of this size usable, I have written four custom modules that extend Omeka S well past its defaults. They cover discovery, visualisation, findability, and the bilingual interface, and each is released as open source.</p>

		<h4>Searching the collection</h4>
		<p>A faceted full-text search built on <a href="https://typesense.org/" target="_blank" rel="noopener noreferrer">Typesense</a> replaces Omeka's default search across the public site. Suggestions appear as you type, and results filter by type, country, newspaper, mentioned people, places, organisations, and subject, with a slider for narrowing by year.</p>
		<p>Two design choices make it forgiving. Search ignores accents, so "Cote d'Ivoire" finds the same documents as "Côte d'Ivoire"; on the live index, that one accent is the difference between a handful of results and nearly four hundred. And every query is hybrid: alongside ordinary keyword matching, the engine also compares the meaning of the words against the text, so a search for "laïcité au Burkina" surfaces relevant articles even when those exact words never appear. Each search view has its own web address, so any filtered result set can be bookmarked, shared, or cited.</p>

		<h4>Seeing the collection</h4>
		<p>A second module turns the archive into interactive dashboards, built with <a href="https://echarts.apache.org/" target="_blank" rel="noopener noreferrer">ECharts</a> and <a href="https://maplibre.org/" target="_blank" rel="noopener noreferrer">MapLibre</a>. They fall into four kinds:</p>
		<ul>
			<li><strong>Corpus overviews</strong> chart how the collection has grown, which languages and countries it covers, and which newspapers were published when.</li>
			<li><strong>Semantic and AI views</strong> place every newspaper article on a single map by similarity of content, trace thirty machine-derived themes across the decades, and compare how three AI models read the tone of coverage of Islam, with a fourth arbitrating where they disagree.</li>
			<li><strong>Networks and maps</strong> show which people, organisations, and places are written about together, and where the collection's geography concentrates.</li>
			<li><strong>Per-record dashboards</strong> give every person, place, organisation, event, article, and magazine issue its own set of charts: when and where it appears, what it connects to, and which items sit closest to it.</li>
		</ul>
		<p>Every chart follows the page's language and its light or dark setting, and takes its colours from the theme, so the visualisations always match the site around them.</p>

		<h4>Making it findable and citable</h4>
		<p>Out of the box, Omeka S tells search engines and reference managers very little about a page. A third module closes that gap. It adds structured data typed by what each item actually is (a person, a place, a newspaper article, a thesis), publishes an XML sitemap of the whole site, and embeds citation metadata so that the Zotero Connector or Google Scholar capture an item as a properly formed reference rather than a generic web page. Because IWAC is published as two parallel sites, one French and one English, the module also tells search engines that each page has a counterpart in the other language.</p>

		<h4>A bilingual, adaptable interface</h4>
		<p>The site itself is a custom Omeka S theme with a light/dark toggle and full French/English switching. It defines its colours and typography as a single set of design tokens, which the search and visualisation modules read as they run. A change to the site's brand colour then flows through to every chart and control without any change to their code.</p>

		<p><a href="https://islam.zmo.de/s/afrique_ouest/page/accueil" target="_blank" rel="noopener noreferrer" class="btn btn-primary">Explore the collection →</a></p>
	`,
	imageUrl: `/images/digital-humanities/IWAC.webp`,
	featured: true,
	order: 1,
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
		'Typesense',
		'ECharts',
		'MapLibre',
		'OpenRefine',
		'Metadata Standards',
		'Docker',
		'Linux',
		'Nginx',
		'Python',
		'Tesseract',
		'IIIF',
		'Linked Data',
		'Rclone',
		'spaCy',
		'pandas',
		'Web scraping'
	]
};
