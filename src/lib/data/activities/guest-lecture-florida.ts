import type { Activity } from '$lib/types';
import { formatDisplayDate } from '$lib/utils/date-formatter';

// The date is already in ISO format, so we can use it directly
const activityDateISO = "2023-11-22";

export const guestLectureFlorida: Activity = {
    id: "guest-lecture-university-of-florida",
    title: "Guest lecture at University of Florida",
    dateISO: activityDateISO,
    date: formatDisplayDate(activityDateISO), // This will format to "22 November 2023"
    year: 2023,
    description: "Invited lecture on Islamic activism in West Africa at the Center for African Studies.",
    content: `
        <p>I delivered a guest lecture at the Center for African Studies at the University of Florida, where I previously served as a Banting Postdoctoral Fellow. The lecture, titled "Digital Approaches to Studying Islamic Activism in West Africa," presented findings from my ongoing work with the Islam West Africa Collection.</p>
        
        <p>The talk demonstrated how computational methods and digital humanities approaches can complement traditional historical and ethnographic research on religious movements. I presented several case studies showing how text mining, network analysis, and other digital tools can reveal patterns and connections that might be missed through conventional research methods.</p>
        
        <p>The lecture was followed by a lively discussion with faculty and graduate students, which generated valuable feedback and suggestions for further developing the digital dimensions of my research.</p>
    `,
    tags: ["lecture", "digital humanities", "teaching", "islamic activism"],
    heroImage: {
        src: "images/florida-lecture.jpg",
        alt: "Guest lecture at the Center for African Studies, University of Florida",
        caption: "Presenting on digital approaches to studying Islamic activism in West Africa"
    }
}; 