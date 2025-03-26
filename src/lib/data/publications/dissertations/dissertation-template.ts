import type { Publication } from '$lib/types';

// Dissertation Template - Copy this file and fill in the details
export const dissertationTemplate: Publication = {
    id: "dissertation-template-id", // Replace with URL-friendly ID (use kebab-case)
    type: "dissertation",
    title: "Dissertation Title",
    authors: ["Author Name"], // Add all authors in the array
    date: "2025", // Graduation year
    dateISO: "2025", // Same as graduation year
    year: 2025,
    department: "Department Name", // Optional: Academic department
    university: "University Name", // University where the dissertation was defended
    placeOfPublication: "City, Country", // Location of the university
    pageCount: 300, // Total number of pages
    language: "English",
    doi: "", // Add DOI if available
    abstract: "A comprehensive description of the dissertation's content, methodology, findings, and significance.",
    tags: ["tag1", "tag2", "tag3"], // Add relevant tags for categorization
    url: "http://hdl.handle.net/00000/0000", // URL to the dissertation (often a handle or DOI)
    image: "images/publications/dissertation-image.jpg", // Optional: path to cover image
    heroImage: { // Optional: hero image configuration
        src: "images/publications/dissertation-hero.jpg", 
        alt: "Descriptive alt text for the dissertation cover", 
        caption: "Optional caption for the dissertation image" 
    },
    advisors: ["Advisor Name"], // Optional: Dissertation advisors/supervisors
}; 