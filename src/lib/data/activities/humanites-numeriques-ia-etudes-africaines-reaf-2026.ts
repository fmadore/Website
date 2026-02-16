import type { Activity } from '$lib/types';
import { formatDisplayDate } from '$lib/utils/date-formatter';

export const activity: Activity = {
	id: 'humanites-numeriques-ia-etudes-africaines-reaf-2026',
	title: 'Humanités numériques (DH) et IA dans les études africaines - REAF 2026',
	dateISO: '2025-09-29',
	date: formatDisplayDate('2025-09-29'),
	year: 2025,
	description:
		'Call for papers for the panel "Humanités numériques (DH) et IA dans les études africaines" at the 9th Rencontre des Études Africaines en France (REAF) 2026.',
	content: `
        <p>I am pleased to announce that the panel proposal "Humanités numériques (DH) et IA dans les études africaines" submitted by Vincent Hiribarren and myself has been accepted for the 9th Rencontre des Études Africaines en France (REAF). The conference will be held in Paris in June-July 2026.</p>
        
        <h3>Call for papers</h3>
        <p>Alors que le « tournant numérique » dans les études africaines prend de l'ampleur, ce panel explore le potentiel de transformation et les défis critiques des humanités numériques (DH) et de l'intelligence artificielle (IA) dans ce domaine. Nous examinons leur impact sur la production, la diffusion et l'interprétation des connaissances sur l'Afrique, en abordant tout particulièrement l'anglocentrisme persistant et la « fracture numérique ».</p>
        
        <p>Nous invitons les auteurs à présenter des applications innovantes des méthodes numériques dans les études africaines. Les sujets peuvent inclure :</p>
        
        <h4>1. Innovations méthodologiques</h4>
        <ul>
            <li>Approches numériques pour explorer les appartenances africaines, afropolitaines et afropéennes à travers l'analyse textuelle et visuelle;</li>
            <li>Analyse par l'IA de contenus africains numérisés (par exemple, traitement du langage naturel, reconnaissance des entités nommées);</li>
            <li>Enseignement de l'histoire africaine à l'aide d'outils numériques.</li>
        </ul>
        
        <h4>2. Perspectives critiques</h4>
        <ul>
            <li>Aborder l'« impérialisme numérique » (Breckenridge 2014) et le « complexe du sauveur numérique » (Shringarpure 2020) en relation avec la positionalité et la construction des connaissances;</li>
            <li>Considérations éthiques dans l'application des méthodes de DH à des contextes culturellement sensibles.</li>
        </ul>
        
        <h4>3. Production et diffusion des connaissances</h4>
        <ul>
            <li>Plates-formes numériques pour la production de connaissances alternatives et publiques axée sur les perspectives africaines;</li>
            <li>Stratégies pour surmonter la numérisation sélective et les hiérarchies coloniales dans l'archivage numérique;</li>
            <li>Projets numériques collaboratifs transnationaux et transcontinentaux qui remettent en question les paradigmes établis dans le Nord.</li>
        </ul>
        
        <p>Ce panel organisé par Frédérick Madore et Vincent Hiribarren fait suite à la réflexion entamée à l'ECAS2025. Il vise à présenter des recherches transdisciplinaires de pointe dans le monde francophone qui utilisent des méthodes numériques pour explorer les complexités des réalités, des identités et des systèmes de connaissance africains. En encourageant le dialogue sur le potentiel et les pièges des approches numériques, nous souhaitons contribuer à un paysage numérique plus inclusif, plus diversifié et plus critique dans les études africaines.</p>
        
        <h3>Soumission</h3>
        <p>Veuillez envoyer le titre et le résumé de votre communication (en français ou en anglais, 2500 signes maximum) avant le <strong>15 novembre 2025</strong> à :</p>
        <ul>
            <li>Frédérick Madore, Leibniz-Zentrum Moderner Orient, Berlin, frederick.madore@zmo.de</li>
            <li>Vincent Hiribarren, King's College London, Londres, vincent.hiribarren@kcl.ac.uk</li>
        </ul>
    `,
	tags: ['REAF', 'Digital Humanities', 'AI', 'Methodology', 'Panel', 'Call for Papers', 'African Studies', 'Conference'],
	type: 'conference',
	image: 'images/communications/reaf-2026.webp',
	heroImage: {
		src: 'images/communications/reaf-2026-hero.webp',
		alt: '9ème édition Rencontres des Études Africaines en France'
	},
    pdfPath: 'files/humanites-numeriques-ia-etudes-africaines-reaf-2026.pdf',
    pdfTitle: 'Appel à propositions - Humanités numériques (DH) et IA et dans les études africaines (REAF 2026)',
	panelType: 'conference'
};
