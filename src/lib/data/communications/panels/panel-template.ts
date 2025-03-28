import type { Communication } from '$lib/types/communication';

// Panel Template - Copy this file and fill in the details
export const panelTemplate: Communication = {
    id: "panel-template-id", // Replace with URL-friendly ID (use kebab-case)
    title: "Panel Title",
    authors: ["Author Name"], // Add all panel organizers/chairs in the array
    date: "2025", // Year or specific date of the panel
    dateISO: "2025-06-15", // Use YYYY-MM-DD format for sorting
    year: 2025,
    conference: "Conference Name", // Name of the conference or event
    location: "City, Venue", // City and venue where the panel was presented
    country: "Country", // Country where the conference was held
    type: "panel", // Type is set to 'panel'
    language: "English", // Language of the panel
    abstract: "A comprehensive description of the panel content and significance.",
    tags: ["tag1", "tag2", "tag3"], // Add relevant tags for categorization
    url: "https://example.com/panel", // URL to slides, video, or related resources
    additionalUrls: [
        { label: "Conference Website", url: "https://example.com/conference" },
        { label: "Video Recording", url: "https://example.com/video" }
    ],
    image: "images/communications/panel-image.jpg", // Path to panel image
    heroImage: { // Optional: hero image configuration
        src: "images/communications/panel-hero.jpg", 
        alt: "Descriptive alt text for the panel image", 
        caption: "Optional caption for the panel image" 
    },
    coordinates: {
        latitude: 52.5200, // Example coordinates (Berlin)
        longitude: 13.4050
    },
    papers: [ // Array of papers presented in the panel
        {
            title: "Paper Title 1",
            authors: ["Author Name 1", "Co-Author Name"],
            abstract: "Abstract of the paper"
        },
        {
            title: "Paper Title 2",
            authors: ["Author Name 2"],
            abstract: "Abstract of the paper"
        }
    ],
    participants: [ // Additional participants (discussants, chairs, etc.)
        {
            name: "Participant Name",
            role: "Discussant/Chair/etc.",
            affiliation: "University or Institution"
        }
    ],
    project: "" // Options: "Mining the Islam West Africa Collection", "Religious Activism on Campuses in Togo and Benin", "Muslim Minorities in Southern Cities of Benin and Togo", "Youth and Women's Islamic Activism in Côte d'Ivoire and Burkina Faso", "Other"
}; 