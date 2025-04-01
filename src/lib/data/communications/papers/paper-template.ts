import type { Communication } from '$lib/types/communication';

// Paper Template - Copy this file and fill in the details
export const paperTemplate: Communication = {
    id: "paper-template-id", // Replace with URL-friendly ID (use kebab-case)
    title: "Paper Title",
    authors: ["Author Name"], // Add all authors in the array
    date: "2025", // Year or specific date of the paper
    dateISO: "2025-06-15", // Use YYYY-MM-DD format for sorting
    year: 2025,
    conference: "Conference Name", // Name of the conference or event
    panelTitle: "Optional Panel Title", // Optional: Title of the panel the paper was part of
    location: "City, Venue", // City and venue where the paper was presented
    country: "Country", // Country where the conference was held
    type: "conference", // Options: 'conference', 'workshop', 'seminar', 'lecture', 'panel'
    language: "English", // Language of the paper
    abstract: "A comprehensive description of the paper content and significance.",
    tags: ["tag1", "tag2", "tag3"], // Add relevant tags for categorization
    url: "https://example.com/presentation", // URL to slides, video, or related resources
    additionalUrls: [
        { label: "Conference Website", url: "https://example.com/conference" },
        { label: "Video Recording", url: "https://example.com/video" }
    ],
    image: "images/communications/paper-image.jpg", // Path to presentation image
    heroImage: { // Optional: hero image configuration
        src: "images/communications/paper-hero.jpg", 
        alt: "Descriptive alt text for the paper image", 
        caption: "Optional caption for the paper image" 
    },
    coordinates: {
        latitude: 52.5200, // Example coordinates (Berlin)
        longitude: 13.4050
    },
    project: "" // Options: "Mining the Islam West Africa Collection", "Religious Activism on Campuses in Togo and Benin", "Muslim Minorities in Southern Cities of Benin and Togo", "Youth and Women's Islamic Activism in Côte d'Ivoire and Burkina Faso", "Other"
}; 