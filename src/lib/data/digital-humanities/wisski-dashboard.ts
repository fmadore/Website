import type { DigitalHumanitiesProject } from '$lib/types/digitalHumanities';

export const wisskiDashboard: DigitalHumanitiesProject = {
	id: 'wisski-dashboard',
	title: 'WissKI Dashboard',
	years: '2026-',
	shortDescription:
		'Interactive dashboard for exploring the Africa Multiple Cluster of Excellence research data — projects, people, institutions, and 2,900+ research items across four partner universities.',
	description:
		'<p>The <a href="https://www.africamultiple.uni-bayreuth.de/" target="_blank" rel="noopener noreferrer">Africa Multiple Cluster of Excellence</a> holds research data on projects, people, institutions, and 2,900+ research items across four partner universities — but <a href="https://www.wisski.uni-bayreuth.de/" target="_blank" rel="noopener noreferrer">WissKI</a> at the University of Bayreuth, the knowledge-base front end, offers limited options for visual exploration. This dashboard makes the underlying data browsable, filterable, and comparable through interactive charts, maps, and network graphs.</p>' +
		'<h3>What you can explore</h3>' +
		'<ul>' +
		'<li><strong>Research sections and projects:</strong> Browse the six thematic areas (Affiliations, Arts &amp; Aesthetics, Knowledges, Learning, Mobilities, Moralities) with Gantt timelines and beeswarm charts showing project distribution by section and year</li>' +
		'<li><strong>Research items:</strong> Full-text search over 2,900+ research items with faceted filtering (subjects, tags, countries, projects, languages) and per-item knowledge graphs</li>' +
		'<li><strong>People and institutions:</strong> Researcher directory with profiles linking to projects and items; institution pages showing partnerships and contributor roles</li>' +
		'<li><strong>Geography:</strong> Country, region, and city browsing with interactive maps and item counts</li>' +
		'<li><strong>Cross-collection comparison:</strong> Side-by-side visualisations (timelines, subject distributions, resource types) for any two universities or projects</li>' +
		'</ul>' +
		'<h3>Visualisations</h3>' +
		'<p>Sixteen chart types — stacked timelines, bar and pie charts, word clouds, heatmaps, Sankey flow diagrams, sunburst hierarchies, chord diagrams, and force-directed network graphs — are available across the dashboard. All entities are deeply cross-linked: clicking a person, project, subject, or location badge navigates to its detail page, and optional deep-links connect items back to their source records in WissKI.</p>' +
		'<h3>Architecture</h3>' +
		'<p>Built with SvelteKit 5, ECharts 6, and Tailwind CSS 4, the interface reads MongoDB exports and university collection metadata to provide two main modes: <strong>Browse</strong> (searchable directories for projects, research items, people, institutions, locations, languages, subjects, resource types, and genres) and <strong>Visualise</strong> (an overview dashboard, per-collection explorer, side-by-side comparison, and force-directed network graphs).</p>',
	imageUrl: `/images/digital-humanities/wisski-dashboard.webp`,
	order: 1,
	skills: [
		'SvelteKit',
		'Svelte 5',
		'TypeScript',
		'ECharts',
		'Tailwind CSS',
		'MongoDB',
		'Data visualization',
		'Network graphs'
	],
	embeddableContent: [
		{
			type: 'iframe',
			id: 'wisski-dashboard-main-embed',
			src: 'https://am-digital-research-environment.github.io/WissKI-dashboard/',
			scrolling: 'yes',
			allowfullscreen: true,
			showTitle: true,
			containerClass: 'iframe-container-aspect iframe-container-aspect-16-9'
		}
	]
};
