import type { DigitalHumanitiesProject } from '$lib/types/digitalHumanities';

export const amira: DigitalHumanitiesProject = {
	id: 'amira',
	title: 'Africa Multiple Interactive Research Atlas (AMIRA)',
	years: '2026-',
	shortDescription:
		'Interactive research atlas for the Africa Multiple Cluster of Excellence — browse, filter, and compare projects, people, institutions, and research items across partner centres in Africa, Brazil, and Germany.',
	description:
		'<p>AMIRA turns the research metadata of the <a href="https://www.africamultiple.uni-bayreuth.de/" target="_blank" rel="noopener noreferrer">Africa Multiple Cluster of Excellence</a> into something you can explore. Based at the <a href="https://www.uni-bayreuth.de/en" target="_blank" rel="noopener noreferrer">University of Bayreuth</a>, the Cluster works with <a href="https://www.africamultiple.uni-bayreuth.de/en/1_1-About-Us/african-cluster-centres/index.html" target="_blank" rel="noopener noreferrer">Africa Multiple Research Centres</a> across Africa, Brazil, and Germany to reconfigure African Studies. Trace how researchers collaborate across partner institutions, follow a subject through decades and countries, or surface items whose content clusters together even when no shared tag connects them.</p>' +
		"<p>The Cluster's knowledge-base front end offers limited options for visual exploration. This dashboard makes the underlying data browsable, filterable, and comparable through interactive charts, maps, and network graphs. Every entity is cross-linked: click a person, project, subject, or location badge to open its detail page.</p>" +
		'<h3>What you can explore</h3>' +
		'<ul>' +
		'<li><strong>Who</strong>: Researchers, groups, and institutions — linked through their projects and co-authored items</li>' +
		'<li><strong>Where</strong>: Research items mapped by country, region, and city, with side-by-side comparison across universities</li>' +
		"<li><strong>When</strong>: Project timelines across the Cluster's thematic sections</li>" +
		'<li><strong>What</strong>: Faceted search on subject, language, resource type, and tag</li>' +
		'<li><strong>Collections</strong>: Photo and multimedia showcases viewable as a masonry grid, a clustered map, or a zoomable timeline</li>' +
		'<li><strong>Connections</strong>: Per-item knowledge graphs show how a record connects to others; weighted network graphs reveal co-authorship, institutional ties, and the discursive communities that cut across the archive</li>' +
		'</ul>' +
		'<h3>Interface</h3>' +
		'<p>Dark mode, URL-shareable filter state, and a PNG export button on every chart.</p>',
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
