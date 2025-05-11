import type { Activity } from '$lib/types';
import { formatDisplayDate } from '$lib/utils/date-formatter';

export const humanisticaConference2025Dakar: Activity = {
    id: "humanistica-conference-2025-dakar",
    title: "Humanistica Conference 2025 - Dakar",
    dateISO: "2025-04-21",
    date: formatDisplayDate("2025-04-21"),
    year: 2025,
    description: "Attending and presenting at the Humanistica 2025 conference in Dakar, focusing on AI in Digital Humanities and African studies.",
    content: `
        <p>Great to be in Dakar for the 2025 Humanistica conference at the Université Cheikh Anta Diop de Dakar (UCAD).</p>
        
        <p>I'm looking forward to presenting my work on using artificial intelligence with the Islam West Africa Collection later this week.</p>
        
        <p>Even more so, I'm excited to be here to learn directly from scholars based on the continent about their innovative uses of digital humanities and AI in research, particularly concerning archives, cultural heritage, and African languages.</p>
    `,
    tags: ["Digital humanities", "AI", "IWAC"],
    url: "",
    image: "images/activities/humanistica-2025-dakar.webp",
    heroImage: {
        src: "images/activities/humanistica-2025-dakar-hero.webp",
        alt: "Humanistica 2025 conference in Dakar",
        caption: ""
    },
    panelType: "conference"
}; 