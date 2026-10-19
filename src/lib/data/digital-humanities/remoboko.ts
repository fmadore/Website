import type { DigitalHumanitiesProject } from '$lib/types/digitalHumanities';

export const remoboko: DigitalHumanitiesProject = {
	id: 'remoboko',
	title: 'Remoboko Visualisations',
	years: '2018-2024',
	shortDescription:
		"Interactive maps, a timeline and charts for the Remoboko research group: companions to my book on religious activism on campuses in Togo and Benin, and a portrait of the group's publications and collaborators.",
	description: `
		<p>I built the interactive figures for <a href="https://remoboko.hypotheses.org/" target="_blank" rel="noopener noreferrer">Remoboko</a> (<em>Religion, Morality and Boko in West Africa: Students Training for a Good Life</em>), a Leibniz Junior Research Group at the Leibniz-Zentrum Moderner Orient (ZMO) in Berlin that ran from 2018 to 2024. The project studied Salafism and Pentecostalism on four university campuses in Niger, Nigeria, Togo and Benin, and how students seeking a degree, and with it a better life, both embrace and reject secular education (<em>boko</em>, in Hausa). All the figures are gathered in <a href="https://fmadore.github.io/Remoboko/" target="_blank" rel="noopener noreferrer">one gallery</a>, and each can be embedded on its own.</p>

		<h2>Companions to the book</h2>
		<p>Three figures accompany my book <a href="/publications/religious-activism-campuses"><em>Religious Activism on Campuses in Togo and Benin</em></a> (De Gruyter, 2025):</p>
		<ul>
			<li><strong>Points of interest</strong>: a searchable map of 33 churches, mosques, schools, universities and campus landmarks around Abomey-Calavi and Lomé</li>
			<li><strong>Universities</strong>: the public universities of Benin and Togo studied in the book</li>
			<li><strong>Timeline</strong>: 37 key moments in religion, education and politics in Togo and Benin from 1960 to 2010, with Benin above the axis and Togo below, filterable by theme</li>
		</ul>

		<h2>The group at a glance</h2>
		<p>Over its lifetime, Remoboko worked with 93 researchers from 24 countries and produced 181 publications and activities. The figures from its final report show:</p>
		<ul>
			<li><strong>Outputs</strong> by type, language and year, as a zoomable treemap and as a timeline</li>
			<li><strong>Collaborators</strong> by country, by gender, and by institution on a world map of 56 institutions</li>
			<li><strong>Word clouds</strong> in French and English, drawn from the abstracts of the group's work</li>
		</ul>
		<p>Every chart offers a table view and a CSV download, and exports as PNG or SVG. The maps fall back to a readable table when they cannot load.</p>

		<h2>How it's built</h2>
		<p>The charts are drawn with <a href="https://d3js.org/" target="_blank" rel="noopener noreferrer">D3</a> and the maps with <a href="https://maplibre.org/" target="_blank" rel="noopener noreferrer">MapLibre GL</a> over free OpenFreeMap tiles, with no build step and no API key. Each figure reads its data from the repository as it loads, so a correction goes live as soon as it is pushed. The code is MIT and the data and figures are CC BY 4.0.</p>
	`,
	imageUrl: `/images/digital-humanities/remoboko.webp`,
	order: 7,
	// The two book companions lead, then the group's visualisation hub. Labelled
	// because three github.io paths this deep would fill the row with directory
	// names rather than telling a reader what each one is.
	links: [
		{
			url: 'https://fmadore.github.io/Remoboko/Book_DeGruyter/Maps/points_of_interest.html',
			label: 'Book: points of interest map'
		},
		{
			url: 'https://fmadore.github.io/Remoboko/Book_DeGruyter/Timeline/',
			label: 'Book: timeline'
		},
		{ url: 'https://fmadore.github.io/Remoboko/', label: 'All figures' },
		{ url: 'https://remoboko.hypotheses.org/visualisations' },
		{ url: 'https://github.com/fmadore/Remoboko', label: 'Remoboko', type: 'code' }
	],
	skills: [
		'Data Visualisation',
		'pandas',
		'Python',
		'NLTK',
		'D3.js',
		'MapLibre GL',
		'Interactive mapping'
	],
	embeddableContent: [
		{
			type: 'iframe',
			id: 'remoboko-poi-map',
			src: 'https://fmadore.github.io/Remoboko/Book_DeGruyter/Maps/points_of_interest.html',
			title: 'Points of interest map',
			description:
				"<p>The churches, mosques, schools, universities and campus landmarks around Abomey-Calavi and Lomé that appear in my book <a href='/publications/religious-activism-campuses'><em>Religious Activism on Campuses in Togo and Benin</em></a>.</p>",
			showTitle: true,
			variant: 'responsive'
		},
		{
			type: 'iframe',
			id: 'remoboko-collaborators-gender',
			src: 'https://fmadore.github.io/Remoboko/Final%20report/collaborators_gender.html',
			title: 'Collaborators by gender',
			description: '<p>The share of women among the 93 Remoboko collaborators.</p>',
			showTitle: true,
			variant: 'responsive'
		},
		{
			type: 'iframe',
			id: 'remoboko-collaborators-country',
			src: 'https://fmadore.github.io/Remoboko/Final%20report/collaborators_by_country.html',
			title: 'Collaborators by country',
			description: '<p>The 93 Remoboko collaborators across 24 countries.</p>',
			showTitle: true,
			variant: 'responsive'
		},
		{
			type: 'iframe',
			id: 'remoboko-collaborators-map',
			src: 'https://fmadore.github.io/Remoboko/Final%20report/collaborators_map.html',
			title: 'Collaborators by affiliation',
			description: '<p>The 93 collaborators located at their 56 institutions on a world map.</p>',
			showTitle: true,
			variant: 'responsive'
		},
		{
			type: 'iframe',
			id: 'remoboko-activities-time',
			src: 'https://fmadore.github.io/Remoboko/Final%20report/activities_type_over_time.html',
			title: 'Publications and activities over time',
			description:
				"<p>Remoboko's 181 publications and activities, stacked by type, per quarter or per year.</p>",
			showTitle: true,
			variant: 'responsive'
		},
		{
			type: 'iframe',
			id: 'remoboko-treemap',
			src: 'https://fmadore.github.io/Remoboko/Final%20report/treemap_chart.html',
			title: 'Publications and activities by type and language',
			description:
				'<p>The same outputs as a zoomable treemap: by type, then language, then year.</p>',
			showTitle: true,
			variant: 'responsive'
		},
		{
			type: 'image',
			id: 'remoboko-wordcloud-en',
			src: 'https://raw.githubusercontent.com/fmadore/Remoboko/master/Final%20report/WordClouds/english_wordcloud.png',
			alt: 'Word cloud of English terms related to Remoboko research',
			title: 'Word clouds',
			description:
				"<p>The most common terms in the abstracts of the group's publications and activities, in English and in French.</p>",
			showTitle: true,
			containerClass: 'image-embed-container'
		},
		{
			type: 'image',
			id: 'remoboko-wordcloud-fr',
			src: 'https://raw.githubusercontent.com/fmadore/Remoboko/master/Final%20report/WordClouds/french_wordcloud.png',
			alt: 'Nuage de mots des termes français liés à la recherche Remoboko',
			showTitle: true,
			containerClass: 'image-embed-container'
		}
	]
};
