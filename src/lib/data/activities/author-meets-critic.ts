import type { Activity } from '$lib/types';
import { formatDisplayDate } from '$lib/utils/date-formatter';

// Define the ISO date first
const activityDateISO = "2024-12-09";

export const authorMeetsCritic: Activity = {
    id: "author-meets-critic-faith-based-student-activism",
    title: "Author Meets Critic. Faith-based Student Activism in Togo and Benin: Muslims and Christians on University Campuses",
    dateISO: activityDateISO,
    date: formatDisplayDate(activityDateISO), // This will format to "9 December 2024"
    year: 2024,
    description: "Panel discussion at the American Academy of Religion annual meeting.",
    content: `
        <p>I participated in an "Author Meets Critics" session at the American Academy of Religion annual meeting in San Diego, where my book on faith-based student activism in Togo and Benin was the focus of discussion. The panel brought together scholars from religious studies, anthropology, and African studies to engage with the book's findings and implications.</p>
        
        <p>The discussion explored the significance of religious activism on secular university campuses, the methodological challenges of studying faith-based groups in academic settings, and the theoretical contributions of the book to understanding the interplay between religion, education, and politics in West Africa.</p>
        
        <p>I am grateful to the panel organizers and participants for their insightful comments and questions, which have already prompted me to think about future research directions and potential collaborations.</p>
    `,
    tags: ["conference", "book", "panel", "AAR", "discussion"],
    heroImage: {
        src: "images/aar-panel-discussion.jpg",
        alt: "Author Meets Critics panel at the American Academy of Religion annual meeting",
        caption: "Panel discussion on faith-based student activism at the AAR conference in San Diego"
    }
}; 