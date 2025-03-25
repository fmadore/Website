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
        <p>This article presents a comparative analysis of the establishment of national Islamic umbrella organizations in four Francophone West African countries: Côte d'Ivoire, Burkina Faso, Togo, and Benin. Drawing on extensive fieldwork and archival research, it explores the various models of religious governance and the dynamics of Muslim institutional representation in these countries.</p>
        
        <p>The study examines both the state initiatives to regulate Islamic affairs and the internal Muslim community efforts to create unified representative bodies. It highlights the challenges of religious governance in pluralistic societies and the complex negotiations between religious autonomy and state oversight.</p>
    `,
    tags: ["article", "research", "islam", "west africa", "religious governance"],
    heroImage: {
        src: "images/islamic-umbrella-organizations.jpg",
        alt: "Islamic umbrella organizations in West Africa",
        caption: "Comparative study of Islamic governance structures in Francophone West Africa"
    }
}; 