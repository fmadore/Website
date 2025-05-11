import type { Activity } from '$lib/types';
import { formatDisplayDate } from '$lib/utils/date-formatter';

export const activity: Activity = {
    id: "religiosity-africa-campuses-oa", 
    title: "“Religiosity on University Campuses in Africa: Trends and Experiences” now in open-access",
    dateISO: "2024-11-12", 
    date: formatDisplayDate("2024-11-12"), 
    year: 2024, 
    description: "The edited volume 'Religiosity on University Campuses in Africa: Trends and Experiences', co-edited with Abdoulaye Sounaye, is now available in open access.",
    content: `
        <p>The edited volume <em>Religiosity on University Campuses in Africa: Trends and Experiences</em>, which I co-edited with Abdoulaye Sounaye, is now in open access. Available for free download via <a href="https://doi.org/10.58144/20241107-000" target="_blank" rel="noreferrer noopener">ZMO's institutional repository</a>.</p>
    `,
    tags: ["Publications", "Remoboko"],
    panelType: "publication",
    image: "", 
    heroImage: {
        src: "images/publications/religiosity-university-campuses.webp",
        alt: "Book cover of Religiosity on University Campuses in Africa, edited by Abdoulaye Sounaye and Frédérick Madore.",
        caption: ""
    },}; 