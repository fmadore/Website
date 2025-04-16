import type { Activity } from '$lib/types';
import { formatDisplayDate } from '$lib/utils/date-formatter';

// Define the ISO date first
const activityDateISO = "2024-12-12";

export const authorMeetsCritic: Activity = {
    id: "author-meets-critic-faith-based-student-activism",
    title: "Author Meets Critic: Religious Activism on Campuses in Togo and Benin",
    dateISO: activityDateISO,
    date: formatDisplayDate(activityDateISO), // This will format to "12 December 2024"
    year: 2024,
    description: "Panel discussion at the 67th Annual Meeting of the African Studies Association (ASA).",
    content: `
        <p>I'm honoured to be participating in an Author Meets Critic roundtable at the 67th Annual Meeting of the <a href="https://africanstudies.org/" target="_blank" rel="noreferrer noopener">African Studies Association (ASA)</a> in Chicago. The session, which focuses on my forthcoming book <em><a href="https://doi.org/10.1515/9783111428895" target="_blank" rel="noreferrer noopener">Religious Activism on Campuses in Togo and Benin: Christian and Muslim Students Navigating Authoritarianism and Laïcité, 1970–2023</a></em>, will take place on 12 December 2024 from 10:15 to 12:00 in the Purdue Room.</p>
        
        <p>The panel will be chaired by <a href="https://religiousstudies.wisc.edu/staff/kdthompson/" target="_blank" rel="noreferrer noopener">K.D. Thompson</a> (University of Wisconsin–Madison) and will include Marius Kothor (Harvard University), <a href="https://www.cfr.org/expert/ebenezer-obadare" target="_blank" rel="noreferrer noopener">Ebenezer Obadare</a> (Council on Foreign Relations), <a href="https://history.arizona.edu/person/benjamin-n-lawrance" target="_blank" rel="noreferrer noopener">Benjamin Lawrance</a> (University of Arizona), and <a href="https://people.clas.ufl.edu/villalon/" target="_blank" rel="noreferrer noopener">Leonardo A. Villalón</a> (University of Florida).</p>
    `,
    tags: ["Conference", "ASA"],
    heroImage: {
        src: "images/activities/asa-panel-discussion.png",
        alt: "Author Meets Critics panel at the African Studies Association annual meeting",
        caption: "Panel discussion on religious activism at the ASA conference in Chicago"
    },
    panelType: "conference"
}; 