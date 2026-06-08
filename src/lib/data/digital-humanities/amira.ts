import type { DigitalHumanitiesProject } from '$lib/types/digitalHumanities';

export const amira: DigitalHumanitiesProject = {
	id: 'amira',
	title: 'Africa Multiple Interactive Research Atlas (AMIRA)',
	years: '2026',
	shortDescription:
		'Interactive research atlas for the Africa Multiple Cluster of Excellence — browse, filter, and compare projects, people, institutions, and research items across partner centres in Africa, Brazil, and Germany.',
	description: `
		<p>The Africa Multiple Interactive Research Atlas (AMIRA) is the public access point for the research metadata of the <a href="https://www.africamultiple.uni-bayreuth.de/" target="_blank" rel="noopener noreferrer">Africa Multiple Cluster of Excellence</a>. Built on <a href="https://omeka.org/s/" target="_blank" rel="noopener noreferrer">Omeka S</a> and hosted at <a href="https://data.africamultiple.uni-bayreuth.de/s/amira" target="_blank" rel="noopener noreferrer">data.africamultiple.uni-bayreuth.de/s/amira</a>, it makes the collections of the <a href="https://www.africamultiple.uni-bayreuth.de/en/1_1-About-Us/african-cluster-centres/index.html" target="_blank" rel="noopener noreferrer">Africa Multiple Research Centres</a> (AMRCs) — Université Joseph Ki-Zerbo in Ouagadougou, the University of Lagos, Moi University, and Rhodes University — and their partners searchable from one place. The Cluster is based at the <a href="https://www.uni-bayreuth.de/en" target="_blank" rel="noopener noreferrer">University of Bayreuth</a> and works with these four centres alongside its privileged partner, the Federal University of Bahia.</p>

		<p>The atlas covers nearly 4,000 research items, more than 90 projects, around 1,400 associated people, and nearly 600 organisations and institutions, in 28 languages across 42 countries. Alongside the research items, it also brings together the Cluster's publications and other outputs, such as podcasts.</p>

		<h3>The DRE behind AMIRA</h3>
		<p>AMIRA is the visible layer of work carried out by the <a href="https://www.africamultiple.uni-bayreuth.de/en/1_5-Digital-Solutions1/index.html" target="_blank" rel="noopener noreferrer">Digital Research Environment (DRE)</a>, the digital infrastructure unit of the Cluster. The DRE designs and maintains the data systems that connect researchers across the AMRCs and partner institutions, grounded in the FAIR and CARE principles and a commitment to multiple knowledge systems.</p>
		<p>Two principles shape the atlas. Curation is a joint effort: each centre describes the data it knows best, and the DRE runs the shared infrastructure that connects them. And storage stays distributed by default — data remains in its local repository, while Bayreuth holds the metadata layer that points to it. Research data becomes findable without being relocated. AMIRA is where that metadata comes together.</p>

		<h3>How it's built</h3>
		<p>AMIRA is built from three components I developed for Omeka S. They share one design system, so the search, the charts, and the pages all follow the same brand and the same light/dark theme:</p>
		<ul>
			<li><strong><a href="https://github.com/AM-Digital-Research-Environment/DRE-theme" target="_blank" rel="noopener noreferrer">DRE-theme</a></strong> — a custom Omeka S theme. A "Scholarly Modernism" design system in the Cluster's Uni-Grün identity, built on OKLCH design tokens, with first-class light and dark modes.</li>
			<li><strong><a href="https://github.com/AM-Digital-Research-Environment/DRESearch" target="_blank" rel="noopener noreferrer">DRE Search</a></strong> — a Typesense-backed search layer. Full-text search with autocomplete and faceted filtering across ten corpora (research items, projects, publications, people, research sections, organisations, genres, languages, locations, and subjects &amp; tags), plus a single federated search bar that queries all of them at once and groups suggestions by type.</li>
			<li><strong><a href="https://github.com/fmadore/ResourceVisualizations" target="_blank" rel="noopener noreferrer">Resource Visualizations</a></strong> — an Omeka S module that adds interactive charts, maps, and network graphs (ECharts and MapLibre GL) to every resource page and to collection-wide overviews. These are the same visualisations developed for the Cluster's research dashboard, ported to Omeka S.</li>
		</ul>

		<h3>What you can explore</h3>
		<ul>
			<li><strong>Search</strong>: full-text search with autocomplete and per-corpus facets, plus a federated search that spans every corpus at once</li>
			<li><strong>Who</strong>: the people associated with the collections, and nearly 600 organisations (institutions and groups), linked through their projects, roles, affiliations, and co-authorships</li>
			<li><strong>Where</strong>: items mapped by place of origin and current location, photo collections on a clustered map, and country-level choropleths</li>
			<li><strong>When</strong>: project and research-section timelines, Gantt views of project spans, and a "What's New" feed for the last 3, 6, or 12 months</li>
			<li><strong>What</strong>: browse and filter by resource type, genre, language, subject, tag, and target audience</li>
			<li><strong>Collections</strong>: image-rich item sets viewable as a masonry grid, a clustered map, or a timeline, all sharing one lightbox</li>
			<li><strong>Compare</strong>: side-by-side profiles for any two projects, people, institutions, subjects, or languages</li>
			<li><strong>Connections</strong>: per-item knowledge graphs, collaboration networks, and "discursive communities" that cluster the subjects appearing together across the archive</li>
			<li><strong>Publications</strong>: bibliographic analytics over the Cluster's bibliography — authors, venues, keywords, and co-authorship networks</li>
		</ul>

		<h3>Interface</h3>
		<p>Light and dark modes, a public Omeka S REST API behind every page, and a save-as-image button on each chart.</p>

		<p><a href="https://data.africamultiple.uni-bayreuth.de/s/amira" target="_blank" rel="noopener noreferrer" class="btn btn-primary">Visit AMIRA →</a></p>
	`,
	imageUrl: `/images/digital-humanities/amira.webp`,
	featured: true,
	order: 2,
	skills: [
		'Omeka S',
		'Typesense',
		'Docker',
		'Nginx',
		'Svelte 5',
		'TypeScript',
		'ECharts',
		'MapLibre GL',
		'MongoDB',
		'Data visualization',
		'Network graphs'
	]
};
