import type { Activity } from '$lib/types';
import { formatDisplayDate } from '$lib/utils/date-formatter';

// Define the ISO date first
const activityDateISO = "2025-03-04";

export const etablirFaitiereIslamique: Activity = {
    id: "etablir-une-faitiere-islamique",
    title: "Établir une faîtière islamique à l'échelle nationale: le cas de 4 pays d'Afrique de l'Ouest francophone",
    dateISO: activityDateISO,
    date: formatDisplayDate(activityDateISO), // This will format to "4 March 2025"
    year: 2025,
    description: "Comparative analysis of national Islamic umbrella organizations in four West African countries.",
    content: `
        <p>On 4 March, I had the opportunity to present my paper, "Établir une faîtière islamique à l'échelle nationale: le cas de quatre pays d'Afrique de l'Ouest francophone", at the workshop "Religiosités et vies associatives en Afrique: entre stratégies d'organisation et vies en mouvement".</p>
        
        <p>Held at the Crêt-Bérard Monastery in Puidoux, Switzerland, the workshop provided a great setting for engaging discussions on the governance and structures of religious associations in West Africa. Grateful for the insightful contributions of the participants and the stimulating atmosphere throughout the workshop.</p>
        
        <p>Many thanks to André Chappatte and the entire team of the research project "The Contemporary Expansion of Corporate Islam in Rural West Africa" (CECIRWA) for organising such a wonderful event.</p>
    `,
    tags: ["article", "research", "islam", "west africa", "religious governance"],
    heroImage: {
        src: "images/activities/puidoux.jpeg",
        alt: "Participants of the workshop",
        caption: "Participants of the workshop"
    }
}; 