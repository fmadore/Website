import type { Activity } from '$lib/types';
import { formatDisplayDate } from '$lib/utils/date-formatter';

// Define the ISO date first
const activityDateISO = "2025-03-04";

export const etablirFaitiereIslamique: Activity = {
    id: "etablir-une-faitiere-islamique",
    title: "Établir une faîtière islamique à l'échelle nationale: le cas de 4 pays d'Afrique de l'Ouest francophone",
    dateISO: activityDateISO,
    date: formatDisplayDate(activityDateISO),
    year: 2025,
    description: "Comparative analysis of national Islamic umbrella organizations in four West African countries.",
    content: `
        <p>On 4 March, I had the opportunity to present my paper, "<a href="/communications/etablir-faitiere-islamique">L'ambition fédératrice à l'épreuve de la diversité: étude comparative des faîtières islamiques au Burkina Faso, Togo, Bénin et Côte d'Ivoire</a>", at the workshop <em>Religiosités et vies associatives en Afrique: entre stratégies d'organisation et vies en mouvement</em>.</p>
        
        <p>Held at the Crêt-Bérard Monastery in Puidoux, Switzerland, the workshop provided a great setting for engaging discussions on the governance and structures of religious associations in West Africa. Grateful for the insightful contributions of the participants and the stimulating atmosphere throughout the workshop.</p>
        
        <p>Many thanks to André Chappatte and the entire team of the research project "The Contemporary Expansion of Corporate Islam in Rural West Africa" (CECIRWA) for organising such a wonderful event.</p>
    `,
    tags: ["Workshop", "Benin", "Burkina Faso", "Côte d'Ivoire", "Togo"],
    panelType: "workshop",
    heroImage: {
        src: "images/activities/puidoux.webp",
        alt: "Crêt-Bérard Monastery",
        caption: "Crêt-Bérard Monastery"
    },
    pdfPath: "files/Programme_Atelier-Cret-Berard.pdf",
    pdfTitle: "Programme"
}; 