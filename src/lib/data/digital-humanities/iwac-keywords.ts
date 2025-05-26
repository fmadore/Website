import type { DigitalHumanitiesProject } from '$lib/types/digitalHumanities';

export const iwacKeywords: DigitalHumanitiesProject = {
	id: 'iwac-keywords',
	title: 'IWAC Keywords Dashboard',
	years: '2024',
	shortDescription:
		'This Shiny application allows users to explore the thematic evolution of the IWAC database by displaying frequent and comparable keywords in the form of visualisations, as well as offering dynamic filters and Dublin Core-based results.',
	description:
		'<p>This Shiny application provides two complementary visualisations to explore the <a href="https://islam.zmo.de/s/westafrica/page/home" target="_blank" rel="noopener noreferrer"><em>Islam West Africa Collection</em></a> (IWAC): (1) a graph showing the most frequently used keywords, and (2) a tool for comparing selected keywords. Using dynamic filters such as country, press title, time range, keyword category and maximum number of terms, users can explore the thematic evolution of the corpus at various scales and then refine their analytical focus with a single click. The results are based on the Dublin Core <i>Subject</i> and <i>Spatial Coverage</i> fields. Therefore, they serve as an exploratory entry point that should be supplemented by a qualitative analysis of the documents.</p>',
	imageUrl: `/images/digital-humanities/iwac-keywords.webp`,
	order: 7,
	skills: ['Shiny for Python', 'Plotly'],
	embeddableContent: [
		{
			type: 'iframe',
			id: 'iwac-keywords-dashboard-embed',
			src: 'https://fmadore.shinyapps.io/iwac_keywords/',
			title: 'IWAC Keywords Dashboard',
			scrolling: 'yes',
			allowfullscreen: true,
			showTitle: true,
			containerClass: 'iframe-container-aspect iframe-container-aspect-16-9'
		}
	]
};
