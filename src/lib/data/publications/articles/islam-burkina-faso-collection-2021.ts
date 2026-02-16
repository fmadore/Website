import type { Publication } from '$lib/types';

export const islamBurkinaCollection: Publication = {
	id: 'islam-burkina-faso-collection-2021',
	type: 'article',
	title: 'La Collection Islam Burkina Faso : promesses et défis des humanités numériques',
	authors: ['Frédérick Madore'],
	date: '2021',
	dateISO: '2021-12-15',
	year: 2021,
	journal: "Revue d'Histoire Contemporaine de l'Afrique",
	publisher: 'University of Geneva',
	publisherLocation: 'Switzerland',
	pageCount: 15,
	language: 'French',
	doi: '10.51185/journals/rhca.2021.e610',
	abstract:
		"Cet article propose une réflexion sur les possibilités inédites qu'offre le numérique pour développer de nouvelles méthodes de recherche et de diffusion de données sur l'histoire de l'islam en Afrique de l'Ouest, ainsi que quelques considérations méthodologiques, technologiques et éthiques soulevées par de telles initiatives. Au centre de ces considérations se trouve la Collection Islam Burkina Faso. Ce projet de base de données numérique en libre accès, que j'ai lancé en 2021 et qui est hébergée par les bibliothèques George A. Smathers de l'Université de Floride (UF), contient actuellement plus de 2 500 documents d'archives, articles de la presse généraliste, publications islamiques sous diverses formes et photographies, en plus de 200 références bibliographiques liées à l'islam et aux musulmans du Burkina Faso (https://islam.domains.uflib.ufl.edu/s/bf-fr). Le texte propose également un bref état des lieux des humanités numériques dans le champ des études africanistes et plus spécifiquement sur l'islam.",
	tags: ['Burkina Faso', 'Digital Humanities', 'Islam', 'Collection', 'Research Methodology', 'West Africa', 'IWAC'],
	url: 'https://doi.org/10.51185/journals/rhca.2021.e610',
	image: 'images/publications/revue-d-histoire-contemporaine-de-l-afrique.webp',
	heroImage: {
		src: 'images/publications/revue-d-histoire-contemporaine-de-l-afrique-hero.webp',
		alt: "Cover of Revue d'Histoire Contemporaine de l'Afrique"
	},
	country: ['Burkina Faso'],
	project: 'Digital Humanities and AI in African Studies',
	citedBy: [
		{
			authors: ['Issouf Binaté'],
			year: 2023,
			title: "La transmission des savoirs islamiques au prisme du beïtu en Côte d'Ivoire",
			source: 'Archipélies, no. 15 (2023)',
			url: 'https://www.archipelies.org/1498'
		},
		{
			authors: ['Philipp Eisenhuth', 'Myriel Fichtner', 'Britta Frede', 'Rüdiger Seesemann'],
			year: 2023,
			title:
				'Developing Crosslingual Ontologies in WissKI: Transcontinental Research Collaboration in the Africa Multiple Cluster of Excellence',
			source: 'Modern Languages Open, no. 1 (2023): 39.',
			url: 'https://doi.org/10.3828/mlo.v0i0.445'
		},
		{
			authors: ['Véronique Ginouvès', 'Ibrahim Moussa'],
			year: 2024,
			title:
				"De la cassette au fichier numérique : enjeux de l'archivage, du partage et de la restitution des archives orales enregistrées au Niger",
			source: 'Revue des mondes musulmans et de la Méditerranée, no. 156 (2024).',
			url: 'https://doi.org/10.4000/130fv'
		},
		{
			authors: ['Vincent Hiribarren'],
			year: 2022,
			title: "Review of Frédérick Madore 'Islam Burkina Faso Collection'",
			source: 'Mande Studies 24 (2022): 325-27.',
			url: 'https://doi.org/10.2979/mnd.2022.a908483'
		}
	]
};
