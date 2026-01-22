import type { DigitalHumanitiesProject } from '$lib/types/digitalHumanities';

export const iwacDashboard: DigitalHumanitiesProject = {
	id: 'iwac-dashboard',
	title: 'Islam West Africa Dashboard',
	years: '2025',
	shortDescription:
		'Interactive visualization platform for exploring the Islam West Africa Collection — a dataset of 14,700+ documents on Islam and Muslims in West Africa.',
	description:
		'<p>The <em>Islam West Africa Collection</em> Dashboard is an interactive visualization platform for exploring a dataset of documents on Islam and Muslims in West Africa. It offers spatial analysis (country distribution, world map, entity geographic footprints showing where persons, organizations, and events appear), network analysis (entity co-occurrence graph), temporal analysis (collection growth, newspaper coverage spans), and advanced textual analysis including word frequency clouds, ML-based topic modeling (71 discovered topics), co-occurrence matrices, and a "Scary Words" tracker with animated bar chart race visualizing how terms like extremism, fundamentalism, and radicalization evolved over time. The bilingual interface (English/French) covers 79 newspapers from Côte d\'Ivoire, Burkina Faso, Benin, Togo, Niger, and Nigeria (1960–present).</p>',
	imageUrl: `/images/digital-humanities/iwac-overview.webp`,
	order: 3,
	skills: ['SvelteKit', 'Svelte 5', 'TypeScript', 'D3.js', 'Leaflet', 'Sigma.js', 'Data visualization'],
	embeddableContent: [
		{
			type: 'iframe',
			id: 'iwac-dashboard-main-embed',
			src: 'https://fmadore.github.io/iwac-dashboard/?lang=en&theme=light',
			scrolling: 'yes',
			allowfullscreen: true,
			showTitle: true,
			containerClass: 'iframe-container-aspect iframe-container-aspect-16-9'
		}
	]
};
