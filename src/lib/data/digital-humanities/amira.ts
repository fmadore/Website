import type { DigitalHumanitiesProject } from '$lib/types/digitalHumanities';

export const amira: DigitalHumanitiesProject = {
	id: 'amira',
	title: 'Africa Multiple Interactive Research Atlas (AMIRA)',
	years: '2026-',
	shortDescription:
		'Interactive research atlas for the Africa Multiple Cluster of Excellence — browse, filter, and compare projects, people, institutions, and research items across partner centres in Africa, Brazil, and Germany.',
	description:
		'<p>AMIRA turns the <a href="https://www.africamultiple.uni-bayreuth.de/" target="_blank" rel="noopener noreferrer">Africa Multiple Cluster of Excellence</a>\'s research metadata into a browsable atlas of people, projects, places, and the connections between them. Based at the <a href="https://www.uni-bayreuth.de/en" target="_blank" rel="noopener noreferrer">University of Bayreuth</a>, the Cluster works with four <a href="https://www.africamultiple.uni-bayreuth.de/en/1_1-About-Us/african-cluster-centres/index.html" target="_blank" rel="noopener noreferrer">Africa Multiple Research Centres</a> (Moi University, the University of Lagos, Université Joseph Ki-Zerbo, and Rhodes University) alongside its privileged partner, the Federal University of Bahia. The dashboard covers nearly 4,000 research items, 92 projects, 1,400 contributors, and 28 languages across 42 countries.</p>' +
		"<p>AMIRA is a discovery and visualisation layer for the Cluster's research metadata. Charts, maps, and network views make the data browsable, filterable, and comparable across people, projects, places, and time. Every entity is cross-linked — click a person, project, subject, or location to open its detail page.</p>" +
		'<h3>What you can explore</h3>' +
		'<ul>' +
		'<li><strong>Who</strong>: researchers, groups, and institutions, linked through their projects and co-authored items</li>' +
		'<li><strong>Where</strong>: items mapped by country, region, and city, with side-by-side university comparisons and country-level choropleths</li>' +
		'<li><strong>When</strong>: project timelines across 13 research sections (Phase 1 active, Phase 2 launching June 2026), and a "What\'s New" view for the last 3, 6, or 12 months</li>' +
		'<li><strong>What</strong>: faceted search on subject, tag, language, resource type, genre, and country</li>' +
		'<li><strong>Collections</strong>: photo and multimedia showcases viewable as a masonry grid, a clustered map, or a zoomable timeline</li>' +
		'<li><strong>Compare</strong>: side-by-side profiles for any two universities, projects, people, institutions, subjects, or languages</li>' +
		'<li><strong>Connections</strong>: per-item knowledge graphs and weighted network graphs reveal co-authorship, institutional ties, and the thematic communities that cut across the archive</li>' +
		'<li><strong>Semantic map</strong>: every item projected into 2D using Gemini embeddings — surface neighbours that share content even when no tag connects them</li>' +
		'</ul>' +
		'<h3>Interface</h3>' +
		'<p>Dark mode, shareable links for any filter combination, a PNG export button on every chart, and an installable progressive web app with an offline shell so the dashboard runs on patchy connections.</p>',
	imageUrl: `/images/digital-humanities/amira.webp`,
	order: 1,
	skills: [
		'SvelteKit',
		'Svelte 5',
		'TypeScript',
		'ECharts',
		'MapLibre GL',
		'Tailwind CSS',
		'MongoDB',
		'Data visualization',
		'Network graphs'
	],
	embeddableContent: [
		{
			type: 'iframe',
			id: 'amira-main-embed',
			src: 'https://am-digital-research-environment.github.io/amira/',
			scrolling: 'yes',
			allowfullscreen: true,
			showTitle: true,
			containerClass: 'iframe-container-aspect iframe-container-aspect-16-9'
		}
	]
};
