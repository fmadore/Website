import type { Communication } from '$lib/types/communication';

// Talk Template - Copy this file and fill in the details
export const talkTemplate: Communication = {
    id: "talk-template-id", // Replace with URL-friendly ID (use kebab-case)
    title: "Talk Title",
    authors: ["Speaker Name"], // Add all speakers in the array
    date: "2025", // Year or specific date of the talk
    dateISO: "2025-06-15", // Use YYYY-MM-DD format for sorting
    year: 2025,
    conference: "Event Name", // Name of the conference, workshop, or event
    location: "City, Venue", // City and venue where the talk was presented
    country: "Country", // Country where the talk was held
    type: "lecture", // Options: 'conference', 'workshop', 'seminar', 'lecture', 'panel'
    language: "English", // Language of the talk
    abstract: "A comprehensive description of the talk content and significance.",
    tags: ["tag1", "tag2", "tag3"], // Add relevant tags for categorization
    url: "https://example.com/presentation", // URL to slides, video, or related resources
    additionalUrls: [
        { label: "Event Website", url: "https://example.com/event" },
        { label: "Video Recording", url: "https://example.com/video" }
    ],
    image: "images/communications/talk-image.jpg", // Path to presentation image
    heroImage: { // Optional: hero image configuration
        src: "images/communications/talk-hero.jpg", 
        alt: "Descriptive alt text for the talk image", 
        caption: "Optional caption for the talk image" 
    },
    coordinates: {
        latitude: 52.5200, // Example coordinates (Berlin)
        longitude: 13.4050
    },
};
