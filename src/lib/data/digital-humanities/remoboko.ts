import type { DigitalHumanitiesProject } from '$lib/types/digitalHumanities';

export const remoboko: DigitalHumanitiesProject = {
	id: 'remoboko',
	title: 'Remoboko Visualizations',
	years: '2018-2024',
	shortDescription:
		'Interactive visualizations for the Remoboko research group, including a points of interest map for my book and charts documenting the group\'s publications, activities, and collaborative network.',
	description:
		'<p>I created a series of interactive visualizations for <a href="https://remoboko.hypotheses.org/" target="_blank" rel="noopener noreferrer">Remoboko</a> (<em>Religion, Morality and Boko in West Africa: Students Training for a Good Life</em>), a Leibniz Junior Research Group based at the Zentrum Moderner Orient (ZMO) that ran from 2018 to 2023. The project examined the presence of Salafism and Pentecostalism on university campuses in Niger, Nigeria, Togo, and Benin. <a href="https://remoboko.hypotheses.org/visualisations" target="_blank" rel="noopener noreferrer">These visualizations</a> make the group\'s research outputs and collaborative network more accessible.</p><h3>Book: Points of Interest Map</h3><p>This interactive map accompanies my book <a href="/publications/religious-activism-campuses"><em>Religious Activism on Campuses in Togo and Benin</em></a> (De Gruyter, 2025), part of the Remoboko project. It plots the geographic locations mentioned throughout the book—universities, mosques, churches, headquarters of religious associations, and other significant sites in Togo, Benin, and the broader West African region.</p><h3>Research Group Outputs</h3><p>Over its five-year lifespan, Remoboko collaborated with 93 researchers from 24 countries, producing over 180 publications and activities. I created visualizations to document this collective output:</p><h4>Publications and Activities at a Glance</h4><ul><li><strong>Stacked bar chart and treemap</strong> showing the evolution and breakdown of publications and activities from 2018 to 2024, categorized by type (journal articles, book chapters, conference papers, lectures, PhD dissertations, etc.)</li><li><strong>Word clouds</strong> (French and English) generated from abstracts, highlighting the key themes and concepts across the group\'s work</li></ul><h4>Collaborators at a Glance</h4><ul><li><strong>Gender distribution</strong> — pie chart showing the breakdown of collaborators (37.6% female, 62.4% male)</li><li><strong>Geographic distribution</strong> — bar chart of collaborators by country, with Germany, USA, Niger, and Nigeria among the most represented</li><li><strong>Institutional affiliations</strong> — overview of the universities and research centers involved</li></ul>',
	imageUrl: `/images/digital-humanities/remoboko.webp`,
	order: 6,
	skills: ['Data Visualization', 'pandas', 'Plotly', 'Python', 'Folium', 'NLTK', 'Leaflet', 'D3.js'],
	embeddableContent: [
		{
			type: 'iframe',
			id: 'remoboko-poi-map',
			src: 'https://fmadore.github.io/Remoboko/Book_DeGruyter/Maps/points_of_interest.html',
			title: 'Points of Interest Map',
			description:
				"<p>Interactive map showing the main locations mentioned in my recent book <a href='/publications/religious-activism-campuses' target='_blank' rel='noopener noreferrer'>Religious Activism on University Campuses in West Africa</a>.</p>",
			scrolling: 'yes',
			allowfullscreen: true,
			showTitle: true,
			containerClass: 'iframe-container-aspect iframe-container-aspect-16-9'
		},
		{
			type: 'image',
			id: 'remoboko-collaborators-gender-chart',
			src: 'https://raw.githubusercontent.com/fmadore/Remoboko/master/Final%20report/collaborators_gender.png',
			alt: 'Chart showing gender distribution of Remoboko collaborators',
			title: 'Collaborators by Gender',
			showTitle: true,
			containerClass: 'image-embed-container'
		},
		{
			type: 'iframe',
			id: 'remoboko-collaborators-country',
			src: 'https://fmadore.github.io/Remoboko/Final%20report/collaborators_by_country.html',
			title: 'Collaborators by Country',
			description:
				'<p>Geographical distribution of the 93 Remoboko research group collaborators across 24 different countries.</p>',
			scrolling: 'yes',
			allowfullscreen: true,
			showTitle: true,
			containerClass: 'iframe-container-aspect iframe-container-aspect-16-9'
		},
		{
			type: 'iframe',
			id: 'remoboko-collaborators-map',
			src: 'https://fmadore.github.io/Remoboko/Final%20report/collaborators_map.html',
			title: 'Collaborators Affiliations Map',
			description:
				'<p>Map displaying the institutional affiliations of Remoboko research group collaborators.</p>',
			scrolling: 'yes',
			allowfullscreen: true,
			showTitle: true,
			containerClass: 'iframe-container-aspect iframe-container-aspect-16-9'
		},
		{
			type: 'iframe',
			id: 'remoboko-activities-time',
			src: 'https://fmadore.github.io/Remoboko/Final%20report/activities_type_over_time.html',
			title: 'Publications and Activities Over Time',
			description:
				"<p>This stacked bar chart illustrates the evolution of Remoboko's scientific publications and activities from 2018 to 2024. It categorises publications and activities by type, showing the diverse contributions of members and collaborators across different formats each year.</p>",
			scrolling: 'yes',
			allowfullscreen: true,
			showTitle: true,
			containerClass: 'iframe-container-aspect iframe-container-aspect-16-9'
		},
		{
			type: 'iframe',
			id: 'remoboko-treemap',
			src: 'https://fmadore.github.io/Remoboko/Final%20report/treemap_chart.html',
			title: 'Publications and Activities Treemap',
			description:
				'<p>This treemap provides a proportional breakdown of all Remoboko publications and activities by type, showing the relative weight of each category within the group\'s total output.</p>',
			scrolling: 'yes',
			allowfullscreen: true,
			showTitle: true,
			containerClass: 'iframe-container-aspect iframe-container-aspect-16-9'
		},
		{
			type: 'image',
			id: 'remoboko-wordcloud-en',
			src: 'https://raw.githubusercontent.com/fmadore/Remoboko/master/Final%20report/WordClouds/english_wordcloud.png',
			alt: 'Word cloud of English terms related to Remoboko research',
			title: 'Word Clouds',
			description:
				'<p>These word clouds provide an insight into the work of the Remoboko research group, derived from the available abstracts of all publications and activities of members and collaborators. Presented in French and English, they highlight the most common terms and provide a visual summary of the key themes and concepts that define our research.</p>',
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
