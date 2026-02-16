import type { Publication } from '$lib/types';

export const acteursReligieuxNumerique: Publication = {
	id: 'acteurs-religieux-numerique',
	type: 'special-issue',
	title: "Les acteurs religieux africains à l'ère du numérique",
	authors: ['Pamela Millet-Mouity', 'Frédérick Madore'],
	editors: 'Pamela Millet-Mouity, Frédérick Madore',
	date: '2017',
	dateISO: '2017',
	year: 2017,
	journal: 'Émulations',
	publisher: 'Presses universitaires de Louvain',
	publisherLocation: 'Belgium',
	issue: '24',
	language: 'French',
	abstract: `Ce dossier d’Émulations entend porter un regard pluridisciplinaire sur les nouvelles réalités induites par l’irruption des médias numériques dans la sphère religieuse en Afrique subsaharienne. À partir de terrains inédits, les auteur·e·s ont cherché à réfléchir à l’utilisation des médias numériques par des groupes religieux et des figures charismatiques de différentes confessions dans cinq pays (Burkina Faso, Sénégal, Côte d’Ivoire, Cameroun, République démocratique du Congo). Chaque contribution questionne les multiples bricolages, ramifications, circulations et conflictualités qui travaillent le « religieux africain » à l’ère du numérique, tant au niveau des discours et des représentations que des pratiques. Le numéro propose également un entretien avec Rosalind I. J. Hackett, une des pionnières dans les recherches sur les religions et les médias en Afrique, en plus d’une conclusion de Katrien Pype. Ce numéro spécial se veut donc une contribution originale à une région qui est quelque peu restée en marge des Digital Religion Studies.`,
	tags: ['Religion', 'Digital Media', 'Social Media', 'Religious Authority', 'Technology', 'Africa'],
	url: 'https://doi.org/10.14428/emulations.024',
	doi: '10.14428/emulations.024',
	image: 'images/publications/acteurs-religieux-numerique.webp',
	heroImage: {
		src: 'images/publications/acteurs-religieux-numerique-hero.webp',
		alt: 'Cover of Émulations, issue 24'
	},
	isEditedWork: true,
	tableOfContents: [
		{
			title: "Pour de nouvelles études sur les acteurs religieux africains à l'ère du numérique",
			authors: ['Pamela Millet-Mouity', 'Frédérick Madore']
		},
		{
			title: "Mouvement interreligieux et usages d'Internet au Burkina Faso. Le cas de l'Union fraternelle des croyants (UFC) de Dori",
			authors: ['Koudbi Kaboré']
		},
		{
			title: "Le Sénégal à l'heure des médias numériques confessionnels. Le Hizbut-Tarqiyyah et son site Internet, comme reflets de nouveaux lieux de culte virtuels",
			authors: ['Serigne Sylla']
		},
		{
			title: "Les musulmans de Facebook en Côte d'Ivoire : nouvelle voie de socialisation, de da'wa et de mobilisation communautaire",
			authors: ['Issouf Binaté']
		},
		{
			title: "Médias 2.0 et Églises chrétiennes au Burkina Faso. Évangélisation numérique et contrôle du message",
			authors: ['Louis Audet Gosselin']
		},
		{
			title: "« Modernité néo-pentecôtiste » au travers de pratiques virtuelles camerounaises",
			authors: ['Sariette Batibonak', 'Abia Batibonak']
		},
		{
			title: "De l'utilisation d'Internet en République démocratique du Congo. Un outil de mobilisation politique et religieuse",
			authors: ['Didier Makal Kanteng']
		},
		{
			title: 'Interview with Rosalind I. J. Hackett on Religion and Digital Media Trends in Africa',
			authors: ['Rosalind I.J. Hackett', 'Frédérick Madore', 'Pamela Millet-Mouity']
		},
		{
			title: 'Pratiques religieuses africaines et médias numériques. Prolonger la réflexion',
			authors: ['Katrien Pype']
		}
	]
};
