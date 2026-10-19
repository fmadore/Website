import type { DigitalHumanitiesProject } from '$lib/types/digitalHumanities';

export const globalHeshmat: DigitalHumanitiesProject = {
	id: 'global-heshmat',
	title: 'Global Heshmat',
	years: '2026',
	shortDescription:
		'An interactive map and archive following the public artworks of the Egyptian sculptor Hassan Heshmat across ten countries, and the people who shaped his career. Developed for the Leibniz-Zentrum Moderner Orient (ZMO).',
	description: `
		<p><a href="https://heshmat.zmo.de/" target="_blank" rel="noopener noreferrer">Global Heshmat</a> follows the Egyptian sculptor <strong>Hassan Heshmat</strong> (1920–2006) and his artworks in public spaces around the world. It is a team project of the <a href="https://www.zmo.de/en" target="_blank" rel="noopener noreferrer">Leibniz-Zentrum Moderner Orient (ZMO)</a> in Berlin; I developed the website.</p>

		<p>Heshmat was an internationally celebrated artist committed to the idea of "Art for All" (<em>Kunst für alle</em>). After training as a sculptor in Cairo, he travelled to Selb in Bavaria on a DAAD scholarship in 1957 to study porcelain, a medium that let him cast affordable multiples for a wide public. His monuments, reliefs and sculptures still stand in parks, museums and squares across several countries, and in 2000 he received Egypt's State Appreciation Award.</p>

		<h2>What you can explore</h2>
		<p>The site gathers 40 works and sites, most of them in Egypt and others across Europe, the United States and China. Twenty-six are located; the other 14 are documented but not yet found. A "to be found" filter turns those gaps into an open call: visitors who recognise a Heshmat work in a public space are invited to report it.</p>
		<ul>
			<li><strong>Map</strong>: the works clustered by place, alongside the homes he lived in, with a dashed line tracing any work that has moved from its former site</li>
			<li><strong>Collection</strong>: 156 photographs, browsable as a gallery or a list, with a fieldbook for saving works and an export</li>
			<li><strong>People</strong>: 31 profiles from Sonja Hegasy's research into the sponsors, curators, collectors and friends around Heshmat. Mapping them has already revealed a cluster that had gone unnoticed: his ties to the Armenian community in Cairo</li>
			<li><strong>Detail pages</strong> with images, sources and video, each with its own web address for sharing</li>
		</ul>

		<h2>How it's built</h2>
		<p>Global Heshmat is a static <a href="https://svelte.dev/" target="_blank" rel="noopener noreferrer">SvelteKit</a> site (Svelte 5 runes, TypeScript) with the map rendered by <a href="https://maplibre.org/" target="_blank" rel="noopener noreferrer">MapLibre GL JS</a> over vector tiles. Each artwork and each person lives in its own typed data file that is discovered at build time, so adding a new entry is a one-file edit. Metadata on every page makes each work easy to share and to find in search engines, and the interface works on any screen size and from the keyboard.</p>

		<h2>Credits</h2>
		<p>Global Heshmat is a collaborative project of the Leibniz-Zentrum Moderner Orient (ZMO):</p>
		<ul>
			<li><strong>Concept</strong>: <a href="https://www.zmo.de/en/people/dr-sonja-hegasy" target="_blank" rel="noopener noreferrer">Dr Sonja Hegasy</a></li>
			<li><strong>Configuration</strong>: Jan Purtzel</li>
			<li><strong>Development</strong>: Frédérick Madore</li>
			<li><strong>Contributor</strong>: Samar Heshmat</li>
		</ul>

		<p>The site complements ZMO's <a href="https://www.zmo.de/en/knowledgetransfer/h-heshmat-digital" target="_blank" rel="noopener noreferrer">audiovisual exhibition on Hassan Heshmat</a>.</p>
	`,
	imageUrl: `/images/digital-humanities/global-heshmat.webp`,
	order: 3,
	links: [
		{ url: 'https://heshmat.zmo.de/' },
		{ url: 'https://github.com/ZMO-Berlin/Global-Heshmat', label: 'Global-Heshmat', type: 'code' }
	],
	skills: [
		'Svelte 5',
		'SvelteKit',
		'TypeScript',
		'MapLibre GL',
		'WebGL',
		'Interactive mapping',
		'Prosopography',
		'Data visualisation'
	],
	embeddableContent: [
		{
			type: 'iframe',
			id: 'global-heshmat-embed',
			src: 'https://heshmat.zmo.de/',
			title: 'The map',
			description:
				'<p>The 26 located works, the 14 still to be found and the places Heshmat lived. Filter by country, status or type, search works, places and people, and select a marker for its images, metadata and sources.</p>',
			showTitle: true,
			variant: 'responsive'
		}
	]
};
