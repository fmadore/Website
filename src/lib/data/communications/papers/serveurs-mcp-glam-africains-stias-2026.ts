import type { Communication } from '$lib/types/communication';

export const serveursMcpGlamAfricainsStias2026: Communication = {
	id: 'serveurs-mcp-glam-africains-stias-2026',
	title: "Les serveurs MCP pour les GLAM africains : une voie d'avenir à l'ère de l'IA ?",
	authors: ['Frédérick Madore'],
	date: '23 September 2026',
	dateISO: '2026-09-23',
	year: 2026,
	conference:
		'Humanités numériques et intelligence artificielle en études africaines : vers des pratiques durables et équitables',
	location: 'Stellenbosch Institute for Advanced Study (STIAS), Stellenbosch',
	country: 'South Africa',
	type: 'workshop',
	language: 'French',
	abstract: `Depuis trois ans, les collections numériques ouvertes des galeries, bibliothèques, archives et musées (les « GLAM ») subissent une double pression. Des robots les moissonnent pour entraîner des modèles d'IA commerciaux tandis que le public délaisse de plus en plus la recherche par mots-clés et par facettes sur les sites et les bases de données au profit des chatbots.

Cette communication présente une troisième voie à partir de deux serveurs Model Context Protocol (MCP), norme ouverte qui expose des outils à tout assistant IA sans céder les données. Le premier dessert la Collection Islam Afrique de l'Ouest (CIAO), près de 15 000 documents. Le second dessert l'Africa Multiple Interactive Research Atlas (AMIRA), la plateforme du Cluster Africa Multiple de l'Université de Bayreuth, et ses quelque 4 000 items (données de recherche, publications, podcasts et vidéos YouTube).

Au-delà de la recherche, ces outils exposent la structure de la base de données : vocabulaires de sujets, de lieux et de personnes, agrégats qui décrivent un ensemble entier, outils relationnels qui remontent depuis une entité tout ce qui lui est associé. Plusieurs d'entre eux peuvent s'afficher sous forme de graphiques. L'assistant IA saisit ainsi l'organisation de la collection et répond de façon contextualisée. Chaque résultat porte le lien vers sa notice ce qui limite fortement les hallucinations et les réponses génériques.

Reste la question que l'atelier doit poser. Une telle médiation protège-t-elle la souveraineté des collections africaines ou déplace-t-elle la dépendance vers quelques fournisseurs de modèles ?`,
	tags: [
		'MCP',
		'AI',
		'Digital Humanities',
		'GLAM',
		'IWAC',
		'AMIRA',
		'Data Sovereignty',
		'Archives',
		'STIAS'
	],
	slidesUrl: 'https://slides.frederickmadore.com/talks/2026-09-23-stellenbosch-mcp-glam-africains/',
	url: 'https://fmadore.github.io/stias-dh-ai-workshop-2026/',
	urlLabel: 'Workshop Website',
	image: 'images/communications/point-sud-logo.svg',
	coordinates: {
		latitude: -33.9321,
		longitude: 18.8602
	},
	project: 'Digital Humanities and AI in African Studies'
};

export default serveursMcpGlamAfricainsStias2026;
