import type { Communication } from '$lib/types/communication';

// Communication Template - Copy this file and fill in the details
export const communicationTemplate: Communication = {
    id: "communication-template-id", // Replace with URL-friendly ID (use kebab-case)
    title: "Communication Title",
    authors: ["Author Name"], // Add all authors in the array
    date: "2025", // Year or specific date of the communication
    dateISO: "2025-06-15", // Use YYYY-MM-DD format for sorting
    year: 2025,
    conference: "Conference Name", // Name of the conference or event
    location: "City, Venue", // City and venue where the communication took place
    country: "Country", // Country where the conference was held
    type: "conference", // Options: 'conference', 'workshop', 'seminar', 'lecture', 'panel'
    language: "English", // Language of the communication
    abstract: "A comprehensive description of the communication content and significance.",
    tags: ["tag1", "tag2", "tag3"], // Add relevant tags for categorization
    url: "https://example.com/presentation", // URL to slides, video, or related resources
    additionalUrls: [
        { label: "Conference Website", url: "https://example.com/conference" },
        { label: "Video Recording", url: "https://example.com/video" }
    ],
    image: "images/communications/communication-image.jpg", // Path to presentation image
    heroImage: { // Optional: hero image configuration
        src: "images/communications/communication-hero.jpg", 
        alt: "Descriptive alt text for the communication image", 
        caption: "Optional caption for the communication image" 
    },
    coordinates: {
        latitude: 52.5200, // Example coordinates (Berlin)
        longitude: 13.4050
    },
}; 