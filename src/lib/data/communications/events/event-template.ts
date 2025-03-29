import type { Communication } from '$lib/types/communication';

// Event Template - Copy this file and fill in the details
export const eventTemplate: Communication = {
    id: "event-template-id", // Replace with URL-friendly ID (use kebab-case)
    title: "Event Title",
    authors: ["Organizer Name"], // Add all main organizers in the array
    date: "2025", // Year or specific date of the event
    dateISO: "2025-06-15", // Use YYYY-MM-DD format for sorting
    year: 2025,
    conference: "Event Name", // Name of the conference, workshop, or other academic event
    location: "City, Venue", // City and venue where the event was held
    country: "Country", // Country where the event was held
    type: "conference", // Options: 'conference', 'workshop', 'seminar', 'lecture', 'panel'
    language: "English", // Primary language of the event
    abstract: "A comprehensive description of the event, its objectives, and significance.",
    tags: ["tag1", "tag2", "tag3"], // Add relevant tags for categorization
    url: "https://example.com/event", // URL to event website or related resources
    additionalUrls: [
        { label: "Call for Papers", url: "https://example.com/cfp" },
        { label: "Program", url: "https://example.com/program" }
    ],
    image: "images/communications/event-image.jpg", // Path to event image
    heroImage: { // Optional: hero image configuration
        src: "images/communications/event-hero.jpg", 
        alt: "Descriptive alt text for the event image", 
        caption: "Optional caption for the event image" 
    },
    coordinates: {
        latitude: 52.5200, // Example coordinates (Berlin)
        longitude: 13.4050
    },
    participants: [
        { name: "Participant Name", role: "Keynote Speaker", affiliation: "University Name" },
        { name: "Participant Name", role: "Panel Chair", affiliation: "Institution Name" }
    ],
    project: "" // Options: "Mining the Islam West Africa Collection", "Religious Activism on Campuses in Togo and Benin", "Muslim Minorities in Southern Cities of Benin and Togo", "Youth and Women's Islamic Activism in Côte d'Ivoire and Burkina Faso", "Other"
};

export default eventTemplate; 