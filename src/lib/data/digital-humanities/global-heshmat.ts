import type { DigitalHumanitiesProject } from '$lib/types/digitalHumanities';

export const globalHeshmat: DigitalHumanitiesProject = {
	id: 'global-heshmat',
	title: 'Global Heshmat',
	years: '2026',
	shortDescription:
		'An interactive map tracing the public artworks of the Egyptian sculptor Hassan Heshmat across ten countries, developed for the Leibniz-Zentrum Moderner Orient (ZMO). Built with SvelteKit and MapLibre GL JS.',
	description: `
		<p><a href="https://heshmat.zmo.de/" target="_blank" rel="noopener noreferrer">Global Heshmat</a> is an interactive map that follows the Egyptian sculptor <strong>Hassan Heshmat</strong> and his artworks in public spaces around the world. It is a team project of the <a href="https://www.zmo.de/en" target="_blank" rel="noopener noreferrer">Leibniz-Zentrum Moderner Orient (ZMO)</a> in Berlin; I developed the website.</p>

		<p>Heshmat was an internationally celebrated artist committed to the idea of "Art for All" (<em>Kunst für alle</em>). After training as a sculptor in Cairo, he travelled to Selb in Bavaria on a DAAD scholarship in 1957 to study porcelain, a medium that let him cast affordable multiples for a wide public. His monuments, reliefs, and sculptures still stand in parks, museums, and squares across several countries, and in 2000 he received Egypt's State Appreciation Award.</p>

		<h3>What you can explore</h3>
		<p>The map brings together 28 located works, most of them in Egypt and others in Germany, Poland, Sweden, Belgium, and the Netherlands, alongside 11 more that are documented but not yet located. In all it spans ten countries, and a "to be found" filter turns the gaps into an open call: visitors who recognise a Heshmat work in a public space are invited to report it.</p>
		<ul>
			<li><strong>Map</strong>: a WebGL vector-tile basemap with marker clustering that expands on zoom</li>
			<li><strong>Filter and search</strong>: filter by country or status, plus real-time search across artwork names, cities, and addresses</li>
			<li><strong>Relocations</strong>: works that have moved are drawn with a dashed line to a "ghost" marker at their former site</li>
			<li><strong>Detail panel</strong>: a multi-image gallery with a full-screen lightbox, metadata, source links, and embedded video</li>
			<li><strong>Deep linking</strong>: the selected artwork is synced to the URL, so any view can be shared</li>
		</ul>

		<h3>How it's built</h3>
		<p>Global Heshmat is a static <a href="https://svelte.dev/" target="_blank" rel="noopener noreferrer">SvelteKit</a> site (Svelte 5 runes, TypeScript) with the map rendered by <a href="https://maplibre.org/" target="_blank" rel="noopener noreferrer">MapLibre GL JS</a> over vector tiles. Each artwork lives in its own typed data file that is auto-discovered at build time, so adding a new work is a one-file edit. Per-page Open Graph, Twitter Card, and Schema.org JSON-LD metadata support sharing and search. The interface is fully responsive, with keyboard navigation throughout.</p>

		<h3>Credits</h3>
		<p>Global Heshmat is a collaborative project of the Leibniz-Zentrum Moderner Orient (ZMO):</p>
		<ul>
			<li><strong>Concept</strong>: <a href="https://www.zmo.de/en/people/dr-sonja-hegasy" target="_blank" rel="noopener noreferrer">Dr Sonja Hegasy</a></li>
			<li><strong>Configuration</strong>: Jan Purtzel</li>
			<li><strong>Development</strong>: Frédérick Madore</li>
			<li><strong>Contributor</strong>: Samar Heshmat</li>
		</ul>

		<p>The site complements ZMO's <a href="https://www.zmo.de/en/knowledgetransfer/h-heshmat-digital" target="_blank" rel="noopener noreferrer">audiovisual exhibition on Hassan Heshmat</a>.</p>

		<p><a href="https://heshmat.zmo.de/" target="_blank" rel="noopener noreferrer" class="btn btn-primary">Visit Global Heshmat →</a></p>
	`,
	imageUrl: `/images/digital-humanities/global-heshmat.webp`,
	order: 3,
	skills: [
		'Svelte 5',
		'SvelteKit',
		'TypeScript',
		'MapLibre GL',
		'WebGL',
		'Interactive mapping',
		'Data visualization'
	]
};
