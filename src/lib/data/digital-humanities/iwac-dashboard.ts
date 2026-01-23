import type { DigitalHumanitiesProject } from '$lib/types/digitalHumanities';

export const iwacDashboard: DigitalHumanitiesProject = {
	id: 'iwac-dashboard',
	title: 'Islam West Africa Dashboard',
	years: '2025',
	shortDescription:
		'Interactive visualization platform for exploring the Islam West Africa Collection — a dataset of 14,700+ documents on Islam and Muslims in West Africa.',
	description:
		'<p>At 14,500+ documents spanning six decades and six countries, the <a href="https://islam.zmo.de/s/westafrica/" target="_blank" rel="noopener noreferrer">Islam West Africa Collection</a> exceeds what traditional reading methods can navigate. This interactive dashboard enables exploration at scale—revealing patterns, connections, and trends that would remain invisible through close reading alone.</p>' +
		'<p>Through maps, timelines, networks, and word clouds, the interface invites you to filter by country, newspaper, or date range and discover patterns on your own terms.</p>' +
		'<h3>What you can explore</h3>' +
		'<ul>' +
		'<li><strong>Where:</strong> See which countries and cities appear most frequently, and track where specific people or organizations are mentioned</li>' +
		'<li><strong>When:</strong> Visualize how coverage grew over time, compare newspaper publication spans, and watch an animated chart showing how key terms evolved decade by decade</li>' +
		'<li><strong>Who and what:</strong> Browse a network graph connecting people, organizations, and events that appear together in articles</li>' +
		'<li><strong>Language patterns:</strong> Generate word clouds filtered by country and year, explore topic clusters, and examine which terms appear alongside each other</li>' +
		'</ul>' +
		'<h3>Interface</h3>' +
		'<p>Bilingual (English/French), with dark mode support. Filter states are saved in the URL, so you can bookmark or share specific views.</p>',
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
