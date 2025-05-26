import type { Communication } from '$lib/types/communication';

export const aiArchivesHumanistica: Communication = {
	id: 'ai-archives-humanistica-2025',
	title:
		"Intelligence artificielle et traitement des archives numériques : applications et enjeux dans la Collection Islam Afrique de l'Ouest",
	authors: ['Frédérick Madore'],
	date: '24 April 2025',
	dateISO: '2025-04-24',
	year: 2025,
	conference: 'Colloque annuel Humanistica 2025',
	location: 'Cheikh Anta Diop University',
	country: 'Senegal',
	type: 'conference',
	language: 'French',
	abstract: `La démocratisation récente des technologies d'intelligence artificielle (IA), caractérisée par une baisse spectaculaire des coûts et l'émergence de modèles open-source performants tels que Llama, transforme profondément les pratiques d'analyse des archives numériques. Cette communication propose d'examiner les applications concrètes et les enjeux de ces outils dans le cadre de la Collection Islam Afrique de l'Ouest (https://islam.zmo.de/s/afrique_ouest/), une base de données en libre accès regroupant plus de 10 000 documents sur l'islam et les musulmans dans six pays d'Afrique de l'Ouest.

Face à l'augmentation considérable du corpus au cours des dernières années (20 millions de mots), le traitement et l'indexation auparavant effectués manuellement sont désormais impossibles pour un projet piloté par une seule personne, ce qui nécessite une transformation profonde des façons de procéder. Les modèles "standards" de traitement du langage naturel, conçus principalement pour des contextes occidentaux, présentent des performances limitées pour la reconnaissance des entités africaines, ce qui compromet la fiabilité des analyses. Cette communication présentera des solutions innovantes basées sur l'IA et développées pour répondre à ces défis.

La présentation s'articulera autour de trois axes principaux :

1. L'élaboration de pipelines Python combinant différentes API de modèles d'IA pour automatiser le traitement des documents, notamment la reconnaissance optique de caractères (ROC), l'analyse des mises en page complexes d'articles de presse, qui est souvent problématique pour les outils traditionnels de ROC, ainsi que la reconnaissance d'entités nommées. Cette étape est cruciale pour toute analyse computationnelle en humanités numériques, car la qualité et la fiabilité des résultats dépendent directement de la précision de ces traitements initiaux. Un accent particulier sera mis sur l'optimisation des "prompts" pour chaque tâche spécifique, démontrant comment l'ajustement minutieux des paramètres permet d'obtenir des données structurées de meilleure qualité, qui sont essentielles pour les analyses ultérieures.

2. Les implications méthodologiques et éthiques de l'automatisation seront abordées, notamment les stratégies de validation, l'importance de la supervision humaine et les considérations éthiques liées au traitement d'archives sensibles. La discussion abordera également les défis techniques rencontrés et les solutions mises en place.

3. Le développement d'un chatbot basé sur une architecture de Retrieval Augmented Generation (RAG) peut transformer radicalement l'accès aux archives numériques. Alors que les recherches traditionnelles par mots-clés nécessitent une connaissance préalable du vocabulaire exact et limitent l'exploration aux correspondances strictes, ce système permet aux utilisateurs de formuler des questions complexes en langage naturel. L'architecture RAG ne se contente pas de rechercher des occurrences : elle analyse le contexte sémantique, établit des connexions entre les documents et génère des réponses synthétiques et documentées. Cette approche facilite la découverte de relations thématiques subtiles et de tendances historiques qui échapperaient aux méthodes de recherche conventionnelles, tout en maintenant une rigueur scientifique grâce à la référence systématique aux sources primaires.

Cette approche ouvre la voie à des analyses computationnelles à grande échelle permettant d'identifier des tendances et des relations qui seraient difficilement détectables manuellement. S'inscrivant dans l'axe "Intelligence artificielle (IA) : pratiques et cas d'usages en SHS" du colloque, elle propose un retour d'expérience concret sur l'utilisation de l'IA pour le traitement d'archives numériques dans un contexte africain.`,
	tags: ['AI', 'digital humanities', 'Islam', 'IWAC', 'Humanistica'],
	image: 'images/communications/humanistica-2025.webp',
	heroImage: {
		src: 'images/communications/humanistica-2025-hero.webp',
		alt: "Intelligence artificielle et traitement des archives numériques : applications et enjeux dans la Collection Islam Afrique de l'Ouest"
	},
	coordinates: {
		latitude: 14.6937,
		longitude: -17.4665
	},
	project: 'Mining the Islam West Africa Collection'
};
