import type { Fieldwork } from '$lib/types';

// Fieldwork Template - Copy this file and fill in the details
export const fieldworkTemplate: Fieldwork = {
    id: "fieldwork-template-id", // Replace with URL-friendly ID (use kebab-case)
    city: "City Name",
    country: "Country Name",
    date: "Month – Month Year", // Format: "Month Year" or "Month – Month Year"
    year: 2024, // Year of fieldwork
    description: "Optional description of research activities and outcomes during this fieldwork.",
    project: "", // Options: "Mining the Islam West Africa Collection", "Religious Activism on Campuses in Togo and Benin", etc.
    coordinates: { // Optional: GPS coordinates for the primary location
        latitude: 0.0, 
        longitude: 0.0 
    },
    image: "", // Optional: path to related image (e.g., "images/fieldworks/location.jpg")
    heroImage: { // Optional: hero image configuration
        src: "images/fieldworks/location-hero.jpg", 
        alt: "Descriptive alt text for the location image", 
        caption: "Optional caption for the location image" 
    }
}; 